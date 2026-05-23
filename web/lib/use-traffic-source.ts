'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { resolveTrafficSource } from './traffic-source'

export function useTrafficSource(): string | null {
  const searchParams = useSearchParams()
  return useMemo(() => resolveTrafficSource(searchParams), [searchParams])
}
