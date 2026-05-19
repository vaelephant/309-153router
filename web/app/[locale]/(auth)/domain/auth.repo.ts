/**
 * 认证模块数据访问层
 */
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
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
 * 创建新用户并发放注册赠送余额（事务）
 */
export async function createUserWithWelcomeCredit(
  data: {
    phone: string
    password: string
    role?: string
  },
  welcomeCredit: number
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone: data.phone,
        password: data.password,
        role: data.role || 'user',
      },
    })

    const amount = new Prisma.Decimal(welcomeCredit)
    const now = new Date()

    await tx.userBalance.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        balance: amount,
        updatedAt: now,
      },
      update: {
        balance: { increment: amount },
        updatedAt: now,
      },
    })

    await tx.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'adjustment',
        description: `注册赠送余额 ¥${welcomeCredit}`,
      },
    })

    return user
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
