---
name: nextjs-seo-brand
description: >-
  Sets up Next.js App Router SEO, Open Graph share images, and a single
  settings/brand.yaml as the only source for brand copy. Use when adding favicon,
  OG images, sitemap, robots, metadata, brand.yaml, social share cards, or
  consolidating marketing copy across a Next.js web app.
---

# Next.js SEO + OG + 单一 brand.yaml

## 概念（30 秒）

| 术语 | 面向谁 | 作用 |
|------|--------|------|
| **SEO** | 搜索引擎 | `<title>`、`description`、`keywords`、`canonical`、`robots`、JSON-LD |
| **OG** (Open Graph) | 社交平台 | 链接预览卡片：`og:title`、`og:description`、`og:image` |
| **Twitter Card** | Twitter/X | 通常复用 OG 图，`twitter:card=summary_large_image` |

**原则：产品文案只写一次** → `settings/brand.yaml` → 代码只负责组装与渲染。

---

## 目标架构

```
settings/brand.yaml          ← 人类唯一编辑入口（品牌 / 定位 / SEO / OG 页文案）
       ↓
src/lib/load-brand.ts        ← server-only，读 YAML + 进程内缓存
       ↓
src/lib/seo.ts               ← 导出 siteSeo / productCore / ogCopy / buildMetadata()
       ↓
├─ app/**/page.tsx           ← export const metadata = buildMetadata({...})
├─ app/opengraph-image.tsx   ← ImageResponse 分享图（1200×630）
├─ app/twitter-image.tsx     ← re-export opengraph-image
├─ app/robots.ts / sitemap.ts / manifest.ts
└─ public/favicon.svg        ← 静态 favicon（避免被 catch-all 路由抢走）
```

---

## 实施清单

复制到新 Next.js 项目时按序执行：

```
- [ ] 1. 创建 settings/brand.yaml（见 reference.md 模板）
- [ ] 2. pnpm add yaml && 创建 load-brand.ts（import 'server-only'）
- [ ] 3. 创建 seo.ts：从 brand 派生 siteSeo / ogCopy / buildMetadata()
- [ ] 4. 根 layout.tsx：rootMetadata + icons + themeColor + metadataBase
- [ ] 5. 公开页 buildMetadata({ path })；控制台 layout 设 noIndex: true
- [ ] 6. public/favicon.svg + apple-touch-icon.svg（勿只用 app/icon.svg 若有 catch-all）
- [ ] 7. lib/og-image.tsx + app/opengraph-image.tsx（Noto Sans SC 支持中文）
- [ ] 8. 各公开路由 app/auth/*/opengraph-image.tsx（可选，页级分享图文案）
- [ ] 9. robots.ts 允许 /，disallow /api 与控制台路径；sitemap 只列公开路由
- [ ] 10. .env NEXT_PUBLIC_SITE_URL 生产 canonical / OG 绝对 URL
- [ ] 11. proxy/middleware matcher 排除 favicon、opengraph-image、manifest
- [ ] 12. 工程文档「配置归属」表增加 brand.yaml 一行
```

---

## brand.yaml 结构约定

| 区块 | 用途 |
|------|------|
| `brand` | 名称、短名、OG 图英文副标题 |
| `productCore` | 定位、三支柱（`|` 分隔）、能力标签（OG 图底部 pill） |
| `seo` | description 后缀、keywords（title/description 由代码拼接） |
| `og` | 分享图字号、register/invite 等页级标题与描述 |
| `jsonLd` | 结构化数据补充字段 |

**禁止**在 `seo.ts`、页面组件、OG 模板里硬编码产品句子；新增页面文案先加到 `brand.yaml`。

---

## buildMetadata 要点

```typescript
// 自动生成 og:image 路径：/ → /opengraph-image，/auth/login → /auth/login/opengraph-image
openGraph: { images: [{ url: ogImage, width: 1200, height: 630, alt }] }
twitter: { card: 'summary_large_image', images: [ogImage] }
robots: noIndex ? { index: false } : { index: true, googleBot: { 'max-image-preview': 'large' } }
metadataBase: new URL(getSiteUrl())  // 来自 NEXT_PUBLIC_SITE_URL
```

公开页索引，控制台 `(platform)/*`、`(fleet)/*` 一律 `noIndex: true`。

---

## OG 分享图（opengraph-image.tsx）

- 尺寸：**1200 × 630**（标准 OG 比例）
- 用 `next/og` 的 `ImageResponse` + 品牌色 + Logo SVG
- 中文必须加载字体（如 Noto Sans SC），见 `lib/og-fonts.ts`，并做进程内缓存
- 短句（三支柱）可用较小 `descriptionFontSize`（如 22），长句默认 26
- 每页可放 `app/<route>/opengraph-image.tsx` 覆盖默认图

验证：`curl -I http://localhost:<port>/opengraph-image` → `content-type: image/png`

---

## 常见坑（本项目已踩）

1. **Catch-all 路由抢走 `/icon`、`/opengraph-image`**  
   → favicon 放 `public/favicon.svg`；OG 路由靠 Next 文件约定，必要时在 middleware 排除。

2. **auth proxy 拦截静态资源**  
   → matcher 排除 `favicon.svg`、`opengraph-image`、`manifest.webmanifest`。

3. **metadata.json 与 brand.yaml 双源**  
   → 删除冗余 JSON，layout 只读 `siteSeo`。

4. **命名 `site-copy.yaml`**  
   → 易误解为「复制」；统一用 **`brand.yaml`**。

5. **OG 首次生成慢**  
   → Google Fonts 拉取；生产环境进程缓存后正常。

---

## 改文案工作流（给产品/运营）

1. 只编辑 `settings/brand.yaml`
2. 保存，重启 `pnpm dev`（YAML 模块级缓存需重启）
3. 检查：页面 `<head>`、`/opengraph-image`、分享调试器（可选）

---

## 参考

- 完整 `brand.yaml` 模板与文件列表：[reference.md](reference.md)
- 本仓库实例：`webui/settings/brand.yaml`、`webui/src/lib/seo.ts`
