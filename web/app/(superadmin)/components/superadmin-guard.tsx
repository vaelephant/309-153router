"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isSuperadmin, isAuthenticated, getAuthHeaders, saveUserAuth, getCurrentUserId, getCurrentUserEmail, getCurrentUserToken } from '@/lib/auth-client'

interface SuperadminGuardProps {
  children: React.ReactNode
}

export function SuperadminGuard({ children }: SuperadminGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      let isSuperadminUser = isSuperadmin()
      if (!isSuperadminUser && isAuthenticated()) {
        // 已登录但本地 role 可能未写入或过期，用 profile 接口同步一次
        try {
          const res = await fetch('/api/settings/profile', { headers: getAuthHeaders() })
          const json = await res.json()
          if (json?.ok && json?.data?.role === 'superadmin') {
            const userId = getCurrentUserId()
            const email = getCurrentUserEmail()
            const token = getCurrentUserToken()
            if (userId && email && token) {
              saveUserAuth(userId, email, token, 'superadmin')
            }
            isSuperadminUser = true
          }
        } catch (_) {
          // 忽略错误，下面按未授权处理
        }
      }
      setIsAuthorized(isSuperadminUser)
      setIsChecking(false)

      if (!isSuperadminUser) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router, pathname])

  if (isChecking) {
    return null
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
