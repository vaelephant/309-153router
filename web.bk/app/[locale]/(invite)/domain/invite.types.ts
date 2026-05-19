/**
 * 邀请模块类型定义
 */
export * from '@/lib/types/invite'

export interface HandleInviteCodeParams {
  newUserId: string
  newUserPhone: string
  inviteCodeStr: string
}

export interface HandleInviteCodeResult {
  success: boolean
  reason?: string
}
