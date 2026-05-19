'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * 仅在客户端挂载后再渲染 next-themes，避免 hydration 时
 * "Can't perform a React state update on a component that hasn't mounted yet"
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
