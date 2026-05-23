/** 顾问微信二维码（与 ai-gateway 转化区一致） */
export const WECHAT_QR_PRIMARY = "/images/wechat-qr.jpg"
export const WECHAT_QR_PNG = "/images/wechat-qr.png"
export const WECHAT_QR_FALLBACK = "/images/wechat-qr.svg"

/**
 * 企业微信「获客助手」或官方加好友链接。
 * 配置后 H5 内可一键跳转添加（示例：https://work.weixin.qq.com/ca/xxx）
 */
export function getWechatContactUrl(): string {
  return process.env.NEXT_PUBLIC_WECHAT_CONTACT_URL?.trim() ?? ""
}
