'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n-context'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

export function LocaleLink({ href, ...rest }: Props) {
  const { locale } = useI18n()
  // 纯 hash（#section）若原样交给 Link，在 /zh/blog 等子页会变成 /zh/blog#section，无法回到首页锚点。
  // 应解析为「当前语言首页 + 锚点」，例如 /zh#features。
  const resolved = (() => {
    if (href.startsWith('http')) return href
    if (href.startsWith('#')) return `/${locale}${href}`
    if (href === '/') return `/${locale}`
    return `/${locale}${href}`
  })()
  return <Link href={resolved} {...rest} />
}
