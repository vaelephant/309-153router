import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, updateLastUsed } from '@/lib/auth'
import { sendChatRequest } from '@/lib/gateway'

/** 计费与 usage_logs 由网关 bill_in_tx 写入；此处不再重复 prisma.usageLog.create，避免双条记录与统计放大。 */

interface ChatRequestBody {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
  stop?: string | string[]
  [key: string]: unknown
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request)
  if (!auth.valid) {
    return NextResponse.json(
      { error: { message: auth.error, type: 'authentication_error' } },
      { status: auth.statusCode || 401 }
    )
  }

  let body: ChatRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'Invalid JSON body', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  if (!body.model) {
    return NextResponse.json(
      { error: { message: 'Missing required field: model', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: { message: 'Missing required field: messages', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.headers.get('x-api-key') || ''

  let gatewayResponse: Response
  try {
    gatewayResponse = await sendChatRequest(
      {
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        top_p: body.top_p,
        max_tokens: body.max_tokens,
        stream: body.stream,
        stop: body.stop,
      },
      apiKey
    )
  } catch (error) {
    console.error('Gateway request failed:', error)
    return NextResponse.json(
      { error: { message: 'Gateway request failed', type: 'gateway_error' } },
      { status: 502 }
    )
  }

  if (body.stream) {
    const stream = await createStreamingResponse(
      gatewayResponse.body!,
      auth.apiKeyId
    )

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  const responseData = await gatewayResponse.json()

  if (auth.apiKeyId && gatewayResponse.ok) {
    await updateLastUsed(auth.apiKeyId)
  }

  return NextResponse.json(responseData, {
    status: gatewayResponse.status,
  })
}

async function createStreamingResponse(
  readableStream: ReadableStream<Uint8Array>,
  apiKeyId: string | undefined
): Promise<ReadableStream<Uint8Array>> {
  const decoder = new TextDecoder()

  const transformStream = new TransformStream({
    async transform(chunk, controller) {
      decoder.decode(chunk, { stream: true })
      controller.enqueue(chunk)
    },
    async flush() {
      if (apiKeyId) {
        await updateLastUsed(apiKeyId).catch(console.error)
      }
    },
  })

  return readableStream.pipeThrough(transformStream)
}

export async function GET() {
  return NextResponse.json({
    object: 'service',
    id: 'OptRouter-chat',
    created: Math.floor(Date.now() / 1000),
    instructions: 'OptRouter API - Unified AI Gateway',
    models: 'GET /api/models',
  })
}
