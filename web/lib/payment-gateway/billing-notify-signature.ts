/**
 * PayRouter Billing Webhook 验签
 * 与 310-payrouter `generate_billing_notify_sign` 一致
 */
import crypto from 'crypto'

/** 与 Python json.dumps(..., sort_keys=True, separators=(',', ':')) 一致 */
export function stableJsonStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJsonStringify(item)).join(',')}]`
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    const pairs = keys.map(
      (k) => `${JSON.stringify(k)}:${stableJsonStringify(obj[k])}`
    )
    return `{${pairs.join(',')}}`
  }
  return JSON.stringify(value)
}

export function generateBillingNotifySign(
  apiSecret: string,
  envelope: Record<string, unknown>
): string {
  const sortedKeys = Object.keys(envelope).sort()
  const parts: string[] = []

  for (const k of sortedKeys) {
    if (k === 'sign') continue
    const v = envelope[k]
    if (v !== null && typeof v === 'object') {
      parts.push(`${k}=${stableJsonStringify(v)}`)
    } else if (v === null || v === undefined) {
      parts.push(`${k}=`)
    } else {
      parts.push(`${k}=${v}`)
    }
  }

  const signString = `${apiSecret}${parts.join('&')}`
  return crypto.createHash('md5').update(signString, 'utf8').digest('hex')
}

export function verifyBillingNotifySign(
  apiSecret: string,
  envelope: Record<string, unknown>,
  sign: string
): boolean {
  const expected = generateBillingNotifySign(apiSecret, envelope)
  if (sign.length !== expected.length) {
    throw new Error('Billing 签名长度不匹配')
  }
  let result = 0
  for (let i = 0; i < sign.length; i++) {
    result |= sign.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  if (result !== 0) {
    throw new Error(`Billing 签名验证失败: 期望=${expected}, 实际=${sign}`)
  }
  return true
}
