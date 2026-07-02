# brand.yaml 模板与文件清单

## brand.yaml starter 模板

```yaml
# [项目名] 品牌与对外文案 — 唯一配置源
#
# 修改本文件 → 同步 title / OG 分享图 / metadata / JSON-LD
# 读取：src/lib/load-brand.ts → seo.ts

brand:
  name: Your Product OS
  shortName: YourProduct
  ogTagline: Enterprise AI Execution   # OG 图 Logo 旁英文副标题

productCore:
  positioning: 一句话产品定位
  pillars: 支柱 A | 支柱 B | 支柱 C    # OG 短描述，SEO 摘要也会用
  capabilities:
    - 能力 1
    - 能力 2
    - 能力 3

seo:
  descriptionSuffix: 接在三支柱后的长描述，用于搜索引擎摘要。
  keywords:
    - 品牌名
    - 核心关键词

og:
  shortDescriptionFontSize: 22           # 三支柱等短句字号
  register:
    title: 注册页分享图主标题
    description: 注册页分享图描述
  invite:
    title: 推广页分享图主标题
    description: 推广页分享图描述

jsonLd:
  offerDescription: 注册后可体验控制台
```

## seo.ts 派生规则（建议保持一致）

```typescript
title = `${brand.name} — ${productCore.positioning}`
description = `${brand.name}：${positioning}。${pillars.replace(/\s*\|\s*/g, '、')}——${seo.descriptionSuffix}`
ogCopy.home/login = { title: positioning, description: pillars, descriptionFontSize }
ogCopy.features = productCore.capabilities
```

## 推荐文件树（Next.js App Router）

```
webui/
├── settings/
│   └── brand.yaml
├── public/
│   ├── favicon.svg
│   └── apple-touch-icon.svg
└── src/
    ├── lib/
    │   ├── load-brand.ts      # server-only + yaml.parse
    │   ├── seo.ts             # buildMetadata / siteSeo / ogCopy
    │   ├── og-fonts.ts        # Noto Sans SC loader + cache
    │   └── og-image.tsx       # createOgImage() 视觉模板
    ├── components/
    │   ├── brand/hive-logo-mark.tsx   # Logo SVG 与 favicon 同源
    │   └── seo/JsonLd.tsx
    └── app/
        ├── layout.tsx         # rootMetadata, icons, themeColor
        ├── page.tsx           # 首页 metadata + JsonLd
        ├── opengraph-image.tsx
        ├── twitter-image.tsx  # export from opengraph-image
        ├── robots.ts
        ├── sitemap.ts
        ├── manifest.ts
        └── auth/
            ├── login/
            │   ├── page.tsx
            │   └── opengraph-image.tsx   # 可选
            └── register/ ...
```

## 环境变量

```env
# webui/.env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

本地未设时回退 `AUTH_URL` 或 `http://localhost:3000`。

## 验证命令

```bash
# OG 图是否 200
curl -I http://localhost:3000/opengraph-image

# 首页 meta 是否含 og:image
curl -s http://localhost:3000/ | tr '>' '\n' | grep 'og:image'

# 静态 favicon
curl -I http://localhost:3000/favicon.svg
```

## 索引策略速查

| 路由类型 | robots | sitemap |
|----------|--------|---------|
| `/`、`/auth/*` 公开页 | index | 包含 |
| 控制台 `(platform)/*` | noindex | 不包含 |
| `/api/*` | disallow | 不包含 |
