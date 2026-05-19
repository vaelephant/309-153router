/**
 * 新闻/内容文件接收 API（推送接收接口）
 *
 * 功能：接收外部推送的 .md 和图片，按类型保存到指定目录
 * - .md  → content/news（若 frontmatter 无 tags 则自动按关键词打标签）
 * - 图片 → public/news
 *
 * 鉴权：Header 中 x-api-key 或 Authorization: Bearer RECEIVE_API_KEY
 * 环境变量：在 .env 或 .env.local 中配置 RECEIVE_API_KEY
 */

import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONFIG = {
  apiKeyEnvName: "RECEIVE_API_KEY",
  contentDir: "content/news",
  publicDir: "public/news",
  docExtensions: [".md"],
  imageExtensions: [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"],
}

/** 标签与关键词：若标题/摘要中出现关键词则打上对应标签（顺序即优先级，先匹配先选） */
const TAG_KEYWORDS: [string, string[]][] = [
  ["OpenClaw", ["OpenClaw", "openclaw"]],
  ["API", ["API", "api", "接口", "网关"]],
  ["AI", ["AI", "大模型", "LLM", "推理", "生成式"]],
  ["智能路由", ["智能路由", "路由", "多模型"]],
  ["快速开始", ["快速开始", "入门", "接入", "集成"]],
  ["产品", ["产品", "OptRouter", "optrouter"]],
]

const CONTENT_DIR = path.join(process.cwd(), CONFIG.contentDir)
const PUBLIC_DIR = path.join(process.cwd(), CONFIG.publicDir)

function getApiKey(): string | undefined {
  const key = process.env[CONFIG.apiKeyEnvName]
  if (!key) console.error(`${CONFIG.apiKeyEnvName} 未配置`)
  return key
}

function validateApiKey(request: NextRequest): boolean {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace("Bearer ", "")
  const expectedKey = getApiKey()
  return !!expectedKey && apiKey === expectedKey
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/** 根据标题和正文片段做关键词匹配，返回建议的标签（去重、最多 6 个） */
function inferTags(title: string, excerptOrBody: string): string[] {
  const text = `${title}\n${excerptOrBody}`.toLowerCase()
  const seen = new Set<string>()
  const tags: string[] = []
  for (const [tag, keywords] of TAG_KEYWORDS) {
    if (tags.length >= 6) break
    const hit = keywords.some((kw) => text.includes(kw.toLowerCase()))
    if (hit && !seen.has(tag)) {
      seen.add(tag)
      tags.push(tag)
    }
  }
  return tags
}

/** 若 .md 没有 tags，则自动打标签并写回 */
function ensureTagsInMarkdown(filePath: string): void {
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  const existing = data.tags
  const hasTags = Array.isArray(existing) && existing.length > 0
  if (hasTags) return

  const title = (data.title as string) || ""
  const excerpt = (data.excerpt as string) || ""
  const bodySnippet = content.slice(0, 500)
  const suggested = inferTags(title, `${excerpt}\n${bodySnippet}`)
  if (suggested.length === 0) return

  const updated = matter.stringify(content, { ...data, tags: suggested }, { lineWidth: 0 })
  fs.writeFileSync(filePath, updated, "utf-8")
}

export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, message: "无效的 API Key" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "没有收到文件，请用 files 字段上传" },
        { status: 400 }
      )
    }

    const results: { name: string; saved: boolean; dest?: string; error?: string }[] = []

    for (const file of files) {
      const fileName = file.name
      const ext = path.extname(fileName).toLowerCase()

      try {
        const buffer = Buffer.from(await file.arrayBuffer())

        if (CONFIG.docExtensions.includes(ext)) {
          ensureDir(CONTENT_DIR)
          const dest = path.join(CONTENT_DIR, fileName)
          fs.writeFileSync(dest, buffer)
          try {
            ensureTagsInMarkdown(dest)
          } catch (e) {
            console.warn("自动打标签失败，已保留原文:", fileName, e)
          }
          results.push({ name: fileName, saved: true, dest: `${CONFIG.contentDir}/${fileName}` })
        } else if (CONFIG.imageExtensions.includes(ext)) {
          ensureDir(PUBLIC_DIR)
          const dest = path.join(PUBLIC_DIR, fileName)
          fs.writeFileSync(dest, buffer)
          results.push({ name: fileName, saved: true, dest: `${CONFIG.publicDir}/${fileName}` })
        } else {
          results.push({ name: fileName, saved: false, error: `不支持的文件类型: ${ext}` })
        }
      } catch (error) {
        results.push({ name: fileName, saved: false, error: (error as Error).message })
      }
    }

    const savedCount = results.filter((r) => r.saved).length
    const failedCount = results.filter((r) => !r.saved).length

    return NextResponse.json({
      success: true,
      message: `接收完成：成功 ${savedCount} 个，失败 ${failedCount} 个`,
      data: { total: files.length, saved: savedCount, failed: failedCount, details: results },
    })
  } catch (error) {
    console.error("接收文件失败:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "接收文件失败" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/news/receive",
    description: "上传 .md 和图片文件，自动保存到 content/news 与 public/news",
    usage: `curl -X POST https://你的域名/api/news/receive -H "x-api-key: YOUR_KEY" -F "files=@article.md" -F "files=@cover.png"`,
  })
}
