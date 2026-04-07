/**
 * 注册流程中的邀请码集成逻辑
 * 
 * 此文件作为兼容层，调用 Domain Service
 */
import { handleInviteCodeOnRegister as handleInviteCodeOnRegisterService } from '@/app/[locale]/(invite)/domain/invite.service'

/**
 * 注册时处理邀请码
 * 
 * @param newUserId - 新注册用户的 ID
 * @param newUserPhone - 新注册用户的手机号
 * @param inviteCodeStr - 用户输入的邀请码
 */
export async function handleInviteCodeOnRegister(
  newUserId: string,
  newUserPhone: string,
  inviteCodeStr: string
) {
  return handleInviteCodeOnRegisterService({
    newUserId,
    newUserPhone,
    inviteCodeStr,
  })
}
