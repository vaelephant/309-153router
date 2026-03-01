"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // 按产品预期：启动默认进入登录/注册页，登录成功后再进入控制台
    router.replace("/login")
  }, [router])

  // 避免闪烁
  return null
}

