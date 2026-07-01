# Agent 站点模板与文件清单

## brand.yaml `agents:` 模板

```yaml
# Agent / LLM 可读站点摘要 — /agents /agents.json /llms.txt 的数据源
agents:
  purpose: 本页供 AI Agent、LLM 爬虫与自动化工具快速理解产品与站点结构。
  oneLiner: 一句话产品定义。
  targetAudience: 目标读者描述
  contactAction: 预约演示请访问首页 /#contact
  license: 引用本站内容请注明出处与原始链接。
  editions:                          # 可选，SaaS/硬件档位
    - name: 入门版
      config: 配置说明
      audience: 目标客户
      priceRangeCny: 价格区间
  siteLinks:
    - path: /
      title: 营销首页
      description: 页面用途一句话
    - path: /news
      title: 资讯中心
      description: 内容类型说明
    - path: /agents
      title: Agent 首页
      description: 结构化 HTML 摘要
    - path: /agents.json
      title: Agent JSON
      description: 机器可读 JSON，Agent 主入口
    - path: /llms.txt
      title: llms.txt
      description: 纯文本发现入口
```

---

## AgentSiteDocument 类型（建议）

```typescript
export type AgentSiteDocument = {
  generatedAt: string;              // ISO 8601
  brand: { name: string; shortName: string; tagline: string };
  purpose: string;
  oneLiner: string;
  positioning: string;
  pillars: string[];
  capabilities: string[];
  description: string;              // 来自 siteSeo.description
  keywords: string[];
  targetAudience: string;
  contactAction: string;
  license: string;
  editions: { name: string; config: string; audience: string; priceRangeCny: string }[];
  siteLinks: { path: string; title: string; description: string; url: string }[];
  news: {                           // 或其他动态内容
    slug: string;
    title: string;
    summary: string;
    category: string;
    publishedAt: string;
    url: string;
  }[];
};
```

JSON 输出额外包一层：

```typescript
export function buildAgentSiteJson(doc = getAgentSiteDocument()) {
  return {
    ...doc,
    endpoints: {
      json: absoluteUrl('/agents.json'),
      html: absoluteUrl('/agents'),
      llmsTxt: absoluteUrl('/llms.txt'),
    },
  };
}
```

---

## 推荐文件树（Next.js App Router）

```
webui/
├── settings/
│   └── brand.yaml                 # agents: 区块
├── lib/
│   ├── load-brand.ts              # 含 agents 类型
│   ├── site-url.ts                # getSiteUrl / absoluteUrl
│   └── seo.ts                     # 已有，供 agent-site 复用
└── app/
    └── (agents)/
        ├── layout.tsx
        ├── _lib/
        │   └── agent-site.ts      # getAgentSiteDocument / build*
        ├── agents/
        │   └── page.tsx           # /agents
        ├── agents.json/
        │   └── route.ts           # /agents.json
        └── llms.txt/
            └── route.ts           # /llms.txt
```

---

## route.ts 模板

### agents.json/route.ts

```typescript
import { buildAgentSiteJson } from '@/app/(agents)/_lib/agent-site';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(JSON.stringify(buildAgentSiteJson(), null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

### llms.txt/route.ts

```typescript
import { buildLlmsTxt } from '@/app/(agents)/_lib/agent-site';

export const dynamic = 'force-static';

export async function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
```

---

## llms.txt 格式约定

```text
# Brand Name

JSON: https://example.com/agents.json

> One-liner

## About
Full description…

- Purpose: …
- Target audience: …
- Positioning: …
- Pillars: A | B | C
- Contact: …

## Capabilities
- Item 1
- Item 2

## Key Pages
- [Title](https://example.com/path): description

## News & Articles
- [Title](url) (category, date): summary

## Keywords
kw1, kw2

## License
Citation terms

Generated: 2026-07-01T00:00:00.000Z
```

---

## agents/page.tsx metadata 模板

```typescript
export const metadata: Metadata = {
  ...buildMetadata({
    title: `Agent 首页 · ${siteSeo.shortName}`,
    description: '…',
    path: '/agents',
  }),
  alternates: {
    types: {
      'application/json': '/agents.json',
      'text/plain': '/llms.txt',
    },
  },
};
```

---

## robots / sitemap

```typescript
// robots.ts
allow: ['/', '/agents', '/agents.json', '/llms.txt', '/news'],

// seo.ts publicRoutes
{ path: '/agents', changeFrequency: 'weekly', priority: 0.95 },
```

---

## 非 Next.js 项目

最小可行三件套：

1. 静态 `public/agents.json` — 构建时从 CMS/YAML 生成
2. 静态 `public/llms.txt` — 同上，含 `JSON:` 行
3. 可选 HTML 页 `/agents`

原则不变：**单数据源 → 多格式导出**。

---

## 扩展场景

| 场景 | 做法 |
|------|------|
| 多语言 | `agents.json` 加 `locales: { zh: {...}, en: {...} }` 或 `?lang=en` |
| 私有站点 | robots disallow + JSON 加 API key（不推荐公开 JSON 鉴权） |
| 大型文章库 | JSON 只列摘要 + `newsIndexUrl`；全文仍走 `/news/[slug]` |
| OpenAPI | 额外 `/openapi.json`，在 `endpoints` 里交叉引用 |

---

## 实例仓库

`667-divstudio/webui/app/(agents)/_lib/agent-site.ts`
