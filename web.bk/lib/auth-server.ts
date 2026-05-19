/**
 * 服务端认证工具函数
 * 用于在 API 路由中验证用户权限
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * 从请求头获取用户 ID
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  const userId = request.headers.get('x-user-id')
  return userId || null
}

/**
 * 从数据库获取用户角色
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    return user?.role || null
  } catch (error) {
    console.error('Failed to get user role:', error)
    return null
  }
}

/**
 * 检查用户是否为超级管理员
 */
export async function isSuperadminUser(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'superadmin'
}

/**
 * 验证用户权限（用于 API 路由）
 * 返回用户 ID 和角色，如果验证失败返回 null
 */
export async function verifyUserAuth(request: NextRequest): Promise<{
  userId: string
  role: string
} | null> {
  const userId = getUserIdFromRequest(request)
  if (!userId) {
    return null
  }

  const role = await getUserRole(userId)
  if (!role) {
    return null
  }

  return { userId, role }
}

/**
 * 验证用户是否为超级管理员（用于 API 路由）
 * 如果不是 superadmin，返回 null
 */
export async function verifySuperadmin(request: NextRequest): Promise<{
  userId: string
  role: string
} | null> {
  const auth = await verifyUserAuth(request)
  if (!auth || auth.role !== 'superadmin') {
    return null
  }
  return auth
}
