import { buildLlmsTxt } from '@/app/(agents)/_lib/agent-site'

export const dynamic = 'force-static'

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
