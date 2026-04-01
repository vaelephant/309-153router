# 联系表单 → 线索服务 + 钉钉（Next.js 可平移包）

本目录与主站 `src/app/api/lead` 逻辑一致，但 **`lib` 独立在 `src/lib/contact-lead/`**，避免和你项目里已有的 `lib/http`、`lib/notify` 混名冲突。

## 平移步骤

1. 将 `nextjs-drop-in/src/lib/contact-lead/` **整个文件夹**复制到你项目的 `src/lib/contact-lead/`（若项目无 `src`，则复制到 `lib/contact-lead/` 并自行改下面 import 路径）。

2. 将 `nextjs-drop-in/src/app/api/lead/route.ts` 复制到 `src/app/api/lead/route.ts`（App Router）。

3. 确认 `tsconfig.json` 里路径别名包含 `"@/*": ["./src/*"]`（Next 默认如此）。

4. 把 `nextjs-drop-in/env.example` 里的变量写入你项目的 `.env.local`（或部署环境变量）。

5. （可选）参考 `nextjs-drop-in/src/components/ContactLeadForm.example.tsx` 做首页表单，或自己写 `fetch("/api/lead", …)`。

## POST `/api/lead` 请求体（JSON）

| 字段 | 说明 |
|------|------|
| `phone` | 必填（线索侧若校验失败会由服务返回错误） |
| `name` / `email` / `company` / `message` | 可选 |
| `form_name` | 可选，用于钉钉文案区分来源 |
| `domain` | 可选，不传则用请求 `Host` |

成功时响应含 `success: true`（并附带线索服务返回的 JSON 字段）。

## 钉钉（两个群）

联系表单钉钉使用 **`DINGTALK_CONTACT_WEBHOOK_URL`**（及可选 **`DINGTALK_CONTACT_SECRET`**），与注册/登录用的 **`DINGTALK_WEBHOOK_URL`** 分开，可指向不同群机器人。

## 与本仓库主站的关系

主站 `web/` 已集成：`app/api/lead` + `lib/contact-lead/*`，钉钉变量同上。  
**本 `integrations/` 包仍可拷贝到其他仓库**；更新逻辑时请与 `web/lib/contact-lead` 保持同步或只维护一处再复制。
