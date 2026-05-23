# 朋友圈怎么发（链接 + 可点按钮）

## 正确方式

朋友圈发 **链接**，不是只发一张图。

| 发什么 | 说明 |
|--------|------|
| **链接** | `https://optrouter.com/zh/wx-poster?from=wechat_moments` |
| **配图（可选）** | 同链接，微信会拉 OG 预览图；也可手动选 `wechat-moments-poster.png` 当封面 |

用户点开链接后：

```text
上半屏：GPT 海报视觉（展示用）
下半屏：真实「了解更多」按钮 → 跳转 /zh/ai-gateway
```

按钮是网页里的真按钮，不是图片上的假按钮。

## 本地预览

```text
http://localhost:3000/zh/wx-poster?from=wechat_moments
```

## 素材

| 文件 | 用途 |
|------|------|
| `wechat-moments-poster.png` | GPT 完整海报（含底部假按钮）→ **仅用于链接分享 OG 预览** |
| `wechat-moments-visual.png` | 裁掉底部蓝区后的上半 → **`/wx-poster` 页面上半展示** |

### 朋友圈页「添加微信」按钮

- 默认：点击弹出顾问微信二维码（`/images/wechat-qr.jpg`），用户**长按识别**添加。
- 一键跳转加好友：在 `web/.env` 配置企业微信获客链接：

```env
NEXT_PUBLIC_WECHAT_CONTACT_URL=https://work.weixin.qq.com/ca/你的获客链接
```

配置后按钮直接打开该链接（微信内可直达添加流程）。

页面上半不要再用完整海报，否则会和底部真按钮重复。

## 配文示例

```text
一个接口接入多家大模型，兼容 OpenAI API，智能路由省成本。

👉 https://optrouter.com/zh/wx-poster?from=wechat_moments
```
