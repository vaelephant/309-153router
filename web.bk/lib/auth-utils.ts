/**
 * 认证相关工具函数
 * 适配：手机号登录、UUID 用户ID
 */
import bcrypt from 'bcryptjs';

/** 中国大陆手机号：11 位，1 开头 */
const CN_MOBILE_REGEX = /^1[3-9]\d{9}$/

/** 只保留数字，用于输入清洗 */
export function normalizePhoneInput(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * 验证中国大陆手机号格式
 */
export function validatePhone(phone: string): boolean {
  return CN_MOBILE_REGEX.test(phone)
}

/**
 * 加密密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 验证密码
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * 生成简单的 Token（不依赖 JWT）
 * 使用 Base64 编码用户ID和手机号 + 时间戳
 */
export function createSimpleToken(userId: string, phone: string): string {
  const payload = {
    userId: userId,
    phone: phone,
    timestamp: Date.now(),
  };
  // 使用 Base64 编码（仅用于标识，不包含敏感信息）
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * 解析 Token（简单实现）
 */
export function parseToken(token: string): { userId: string; phone: string; timestamp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return {
      userId: payload.userId,
      phone: payload.phone ?? payload.email ?? '',
      timestamp: payload.timestamp,
    };
  } catch {
    return null;
  }
}

/**
 * 生成6位数字验证码（预留功能）
 */
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * UUID 格式验证
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}
