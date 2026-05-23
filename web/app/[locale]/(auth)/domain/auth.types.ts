/**
 * 认证模块类型定义
 */

export interface LoginParams {
  phone: string
  password: string
}

export interface RegisterParams {
  phone: string
  password: string
  inviteCode?: string
  trafficSource?: string
}

export interface LoginResult {
  success: true
  userId: string
  phone: string
  token: string
  message: string
  role: string
}

export interface RegisterResult {
  success: true
  userId: string
  phone: string
  token: string
  message: string
  role: string
}

export interface AuthError {
  success: false
  detail: string
}

export type AuthResult<T> = T | AuthError

export interface LoginLogData {
  userId: string
  phone: string
  loginAt: Date
  ipAddress: string | null
  userAgent: string | null
}
