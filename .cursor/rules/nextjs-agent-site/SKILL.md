---
name: nextjs-agent-site
description: >-
  Adds agent-friendly site endpoints to Next.js App Router apps: /agents.json
  (primary), /llms.txt (discovery), and /agents (human debug HTML). Single
  data source from settings/brand.yaml agents block. Use when adding agent
  access, llms.txt, agents.json, AI crawler support, or machine-readable site
  summaries alongside nextjs-seo-brand.
---

# Next.js Agent 友好站点

## 概念（30 秒）

| 入口 | 面向谁 | 作用 |
|------|--------|------|
| **`/agents.json`** | Agent / 脚本 | 主入口，结构化 JSON，零 DOM 解析 |
| **`/llms.txt`** | LLM 爬虫 | 行业约定，顶部 `JSON:` 指向 JSON 入口 |
| **`/agents`** | 人类调试 | 语义化 HTML，浏览器可读 |

**原则：三层共用一份数据** → `getAgentSiteDocument()` ← `settings/brand.yaml` `agents:` 区块 + 动态内容（资讯、文档等）。

与 `nextjs-seo-brand` 配合：SEO 文案在 `brand.yaml` 的 `brand/productCore/seo`；Agent 专用字段在 `agents:`，复用 `productCore` 与 `siteSeo` 派生字段，避免硬编码。

---

## 目标架构

```
settings/brand.yaml          ← agents: 区块（purpose / editions / siteLinks …）
       ↓
lib/load-brand.ts            ← 扩展 BrandConfig.agents 类型
lib/site-url.ts              ← getSiteUrl / absoluteUrl（无 server-only）
       ↓
app/(agents)/_lib/agent-site.ts
  · getAgentSiteDocument()
  · buildAgentSiteJson()
  · buildLlmsTxt()
  · agentSiteJsonLd()
       ↓
app/(agents)/
├── layout.tsx               ← 简洁白底（可选）
├── agents/page.tsx          → /agents
├── agents.json/route.ts     → /agents.json
└── llms.txt/route.ts        → /llms.txt
       ↓
robots.ts / sitemap.ts       ← allow + 索引 /agents /agents.json /llms.txt
```

---

## 实施清单

```
- [ ] 1. brand.yaml 增加 agents: 区块（见 reference.md 模板）
- [ ] 2. 扩展 load-brand.ts 类型
- [ ] 3. 创建 app/(agents)/_lib/agent-site.ts（组装 + 导出 JSON/llms.txt）
- [ ] 4. agents.json/route.ts — application/json, force-static, Cache-Control
- [ ] 5. llms.txt/route.ts — text/plain, 顶部 JSON: {url}
- [ ] 6. agents/page.tsx — 语义 HTML + JSON-LD + alternates 指向 json/txt
- [ ] 7. robots.ts allow /agents /agents.json /llms.txt
- [ ] 8. publicRoutes / sitemap 加入 /agents
- [ ] 9. 页脚或文档加 Agent 入口链接
- [ ] 10. 验证三条 curl（见下）
```

---

## 三层职责

### `/agents.json`（主入口）

- `Content-Type: application/json; charset=utf-8`
- 顶层含 `endpoints: { json, html, llmsTxt }` 绝对 URL
- 动态区块（资讯、API 列表）在 `getAgentSiteDocument()` 里组装
- **Agent 集成优先读此 URL**

### `/llms.txt`（发现层）

- 遵循 [llmstxt.org](https://llmstxt.org) 风格 Markdown 纯文本
- **第二行必须是** `JSON: https://…/agents.json`
- 人类可读摘要 + 关键页面 + 文章索引

### `/agents`（调试层）

- Server Component，无 client JS 依赖
- `<article>` + 表格/列表，font-mono 可选
- `metadata.alternates.types`: `application/json` → `/agents.json`，`text/plain` → `/llms.txt`
- 嵌入 `agentSiteJsonLd()`（WebSite + ItemList）

---

## brand.yaml `agents:` 约定

| 字段 | 用途 |
|------|------|
| `purpose` | 本页供谁读、解决什么问题 |
| `oneLiner` | 一句话产品定义 |
| `targetAudience` | 目标读者 / Agent 类型 |
| `contactAction` | 转化动作（如 `/#contact`） |
| `license` | 引用声明 |
| `editions` | 可选，产品档位 / 定价 |
| `siteLinks` | 站内关键路径 + title + description |

**禁止**在 `agent-site.ts` 或页面里硬编码产品句子；动态 URL 用 `absoluteUrl()` 生成。

---

## 与 SEO skill 的衔接

已有 `nextjs-seo-brand` 时：

```typescript
import { productCore, siteSeo } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site-url';

// agent-site.ts 复用 siteSeo.description、productCore.pillars 等
```

`publicRoutes` 增加 `{ path: '/agents', changeFrequency: 'weekly', priority: 0.95 }`。

---

## 验证命令

```bash
curl -s http://localhost:3000/agents.json | jq .endpoints
curl -s http://localhost:3000/llms.txt | head -5    # 含 JSON: 行
curl -s http://localhost:3000/agents | grep -E 'agents\.json|llms\.txt'
```

期望：
- `agents.json` → 200，`Content-Type: application/json`
- `llms.txt` 第 3 行附近 → `JSON: https://…/agents.json`
- `agents` 页含 JSON-LD script

---

## 常见坑

1. **`/agents.json` 与动态路由冲突**  
   → 放在 `app/(agents)/agents.json/route.ts`，勿命名 `[slug]` 可匹配的路径。

2. **JSON 与 HTML 双源**  
   → 只维护 `getAgentSiteDocument()`；JSON / llms.txt / HTML 均从中派生。

3. **server-only 链污染 client**  
   → `site-url.ts` 独立；`agent-site.ts` 标 `server-only`；页面只用 Server Component。

4. **llms.txt 未指向 JSON**  
   → 爬虫会扫 llms.txt 但不会猜 JSON 路径；**必须**写 `JSON:` 行。

5. **忘记 robots / sitemap**  
   → Agent 入口应对外可索引（除非整站 private）。

---

## 改文案工作流

1. 编辑 `settings/brand.yaml` → `agents:` 区块
2. 动态内容（文章）改 Markdown / CMS，无需动 agent 路由
3. 重启 dev，curl 三条验证

---

## 参考

- 完整模板与 JSON 字段说明：[reference.md](reference.md)
- 本仓库实例：`667-divstudio/webui/app/(agents)/`、`webui/settings/brand.yaml`
