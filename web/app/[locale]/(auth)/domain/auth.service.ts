/**
 * 认证模块业务逻辑层
 */
import { hashPassword, verifyPassword, validatePhone, normalizePhoneInput, createSimpleToken } from '@/lib/auth-utils'
import {
  findUserByPhone,
  checkPhoneExists,
  createUser,
  updateUserLastLogin,
  createLoginLog,
} from './auth.repo'
import type {
  LoginParams,
  RegisterParams,
  LoginResult,
  RegisterResult,
  AuthError,
  LoginLogData,
} from './auth.types'
import { notifyUserRegister, notifyUserLogin } from '@/lib/dingtalk'

/**
 * 提取 IP 地址（从 Request Headers）
 */
function extractIpAddress(headers: {
  get: (key: string) => string | null
}): string | null {
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfIp = headers.get('cf-connecting-ip')
  const clientIp = headers.get('x-client-ip')

  let ipAddress = forwarded?.split(',').map(ip => ip.trim()).find(ip => ip) || null
  if (!ipAddress) {
    ipAddress = realIp?.trim() || cfIp?.trim() || clientIp?.trim() || null
  }

  if (ipAddress) {
    ipAddress = ipAddress.replace(/^\[|\]$/g, '')
    if (ipAddress.includes(':') && !ipAddress.startsWith('::')) {
      const parts = ipAddress.split(':')
      if (parts.length === 2 && /^\d+$/.test(parts[1])) {
        ipAddress = parts[0]
      }
    }
  }

  return ipAddress
}

/**
 * 用户登录
 */
export async function loginUser(
  params: LoginParams,
  headers: { get: (key: string) => string | null }
): Promise<LoginResult | AuthError> {
  try {
    const normalized = normalizePhoneInput(params.phone ?? '')
    if (!normalized || !validatePhone(normalized)) {
      return {
        success: false,
        detail: '手机号格式不正确',
      }
    }

    const user = await findUserByPhone(normalized)
    if (!user) {
      return {
        success: false,
        detail: '手机号或密码错误',
      }
    }

    if (!user.password) {
      return {
        success: false,
        detail: '该账户未设置密码，请先设置密码',
      }
    }

    const isPasswordValid = await verifyPassword(params.password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        detail: '手机号或密码错误',
      }
    }

    await updateUserLastLogin(user.id)

    const ipAddress = extractIpAddress(headers)
    const userAgent = headers.get('user-agent') || null

    await createLoginLog({
      userId: user.id,
      phone: normalized,
      loginAt: new Date(),
      ipAddress,
      userAgent,
    })

    const token = createSimpleToken(user.id, normalized)

    notifyUserLogin(normalized, userAgent, ipAddress).catch((err) => {
      console.error('发送钉钉登录通知失败:', err)
    })

    return {
      success: true,
      message: '登录成功',
      token,
      userId: user.id,
      phone: normalized,
      role: user.role,
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    return {
      success: false,
      detail: error.message || '登录失败，请稍后重试',
    }
  }
}

/**
 * 用户注册
 */
export async function registerUser(
  params: RegisterParams,
  onInviteCodeProcess?: (userId: string, phone: string, inviteCode: string) => Promise<void>,
  headers?: { get: (key: string) => string | null }
): Promise<RegisterResult | AuthError> {
  try {
    const normalized = normalizePhoneInput(params.phone ?? '')
    if (!normalized || !validatePhone(normalized)) {
      return {
        success: false,
        detail: '手机号格式不正确',
      }
    }

    if (!params.password || params.password.length < 6) {
      return {
        success: false,
        detail: '密码长度至少为6位',
      }
    }

    const phoneExists = await checkPhoneExists(normalized)
    if (phoneExists) {
      return {
        success: false,
        detail: '该手机号已注册',
      }
    }

    const passwordHash = await hashPassword(params.password)
    const user = await createUser({
      phone: normalized,
      password: passwordHash,
      role: 'user',
    })

    if (params.inviteCode && onInviteCodeProcess) {
      try {
        await onInviteCodeProcess(user.id, normalized, params.inviteCode)
      } catch (inviteError: any) {
        console.error('[注册] 邀请码处理异常:', inviteError)
      }
    }

    const token = createSimpleToken(user.id, normalized)

    const regIp = headers ? extractIpAddress(headers) : null
    const regUa = headers?.get('user-agent') || null
    notifyUserRegister(normalized, params.inviteCode || null, regUa, regIp).catch((err) => {
      console.error('发送钉钉注册通知失败:', err)
    })

    return {
      success: true,
      message: '注册成功',
      userId: user.id,
      token,
      phone: normalized,
      role: user.role,
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    return {
      success: false,
      detail: error.message || '注册失败，请稍后重试',
    }
  }
}
