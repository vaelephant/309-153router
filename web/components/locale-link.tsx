'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n-context'
import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

export function LocaleLink({ href, ...rest }: Props) {
  const { locale } = useI18n()
  const resolved =
    href.startsWith('#') || href.startsWith('http') ? href : `/${locale}${href === '/' ? '' : href}`
  return <Link href={resolved} {...rest} />
}
