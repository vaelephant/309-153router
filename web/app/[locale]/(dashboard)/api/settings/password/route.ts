import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

/**
 * POST /api/settings/password - 修改密码
 */
export async function POST(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: '请填写完整' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '新密码长度不能少于6位' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: '旧密码不正确' }, { status: 400 })
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ ok: true, message: '密码修改成功' })
  } catch (error) {
    console.error('Failed to change password:', error)
    return NextResponse.json({ error: '修改密码失败' }, { status: 500 })
  }
}
