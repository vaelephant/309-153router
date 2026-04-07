/**
 * 认证模块数据访问层
 */
import { prisma } from '@/lib/db'
import type { LoginLogData } from './auth.types'

/**
 * 根据手机号查找用户
 */
export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
  })
}

/**
 * 检查手机号是否已注册
 */
export async function checkPhoneExists(phone: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { phone },
    select: { id: true },
  })
  return !!user
}

/**
 * 创建新用户
 */
export async function createUser(data: {
  phone: string
  password: string
  role?: string
}) {
  return prisma.user.create({
    data: {
      phone: data.phone,
      password: data.password,
      role: data.role || 'user',
    },
  })
}

/**
 * 更新用户最后登录时间
 */
export async function updateUserLastLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { updatedAt: new Date() },
  })
}

/**
 * 创建登录日志
 */
export async function createLoginLog(data: LoginLogData) {
  return prisma.userLoginLog.create({
    data: {
      userId: data.userId,
      phone: data.phone,
      loginAt: data.loginAt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  })
}
