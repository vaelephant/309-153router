# 新闻文章目录

在此目录下放置 Markdown 文件即可在「新闻资讯」列表和详情页展示。

## 图片存放

- **封面图、正文插图**：统一放在 `web/public/news/` 下。
- 引用时用站点根路径，例如：`/news/cover-1.png`、`/news/diagram.png`。

## 文章格式

- 文件名即文章 slug，如 `2025-01-01-hello.md` 对应路径 `/[locale]/blog/2025-01-01-hello`
- 必须包含 YAML frontmatter：

```yaml
---
title: "文章标题"
date: "2025-01-01"
coverImage: "/news/cover-1.png"  # 可选，放在 public/news 下
excerpt: "列表页显示的摘要"       # 可选，不写则从正文截取
tags: ["API", "AI", "产品"]      # 可选，用于卡片底部标签
readTimeMinutes: 5               # 可选，不写则按正文长度估算
---
```

正文使用标准 Markdown 书写；正文里的图片同样用 `/news/xxx.png` 引用。

## 推送接收接口

支持通过 API 接收外部推送的 .md 与图片（如爬虫/脚本生成后推送）：

- **接口**：`POST /api/news/receive`
- **鉴权**：Header `x-api-key` 或 `Authorization: Bearer <key>`
- **环境变量**：在项目 `.env` 或 `.env.local` 中配置 `RECEIVE_API_KEY=你的密钥`
- **请求**：`multipart/form-data`，字段名 `files`，可多个文件（.md 存到 content/news，图片存到 public/news）

示例：`curl -X POST https://你的域名/api/news/receive -H "x-api-key: YOUR_KEY" -F "files=@article.md" -F "files=@cover.png"`
