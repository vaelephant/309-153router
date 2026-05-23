"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveUserAuth, isAuthenticated } from '@/lib/auth-client'
import { RegisterInviteCodeField } from '../../(invite)/components/RegisterInviteCodeField'
import { LocaleLink } from '@/components/locale-link'
import { useI18n } from '@/lib/i18n-context'
import { resolveTrafficSource } from '@/lib/traffic-source'

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/')[1]
  return segment && ['zh', 'en', 'ja'].includes(segment) ? segment : 'zh'
}

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { t } = useI18n()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  const handleInviteCodeChange = (code: string) => setInviteCode(code)

  useEffect(() => {
    setIsMounted(true)
    resolveTrafficSource(searchParams)
  }, [searchParams])

  useEffect(() => {
    if (!isMounted) return
    const hasInviteCode = searchParams.get('invite_code')
    if (isAuthenticated() && !hasInviteCode) {
      router.push(`/${locale}/dashboard`)
    }
  }, [router, searchParams, isMounted, locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(t('auth.errorPasswordLength'))
      return
    }

    setLoading(true)
    const urlInviteCode = searchParams.get('invite_code')
    const finalInviteCode = inviteCode?.trim() || urlInviteCode?.trim().toUpperCase() || undefined
    const trafficSource = resolveTrafficSource(searchParams)

    try {
      const response = await fetch(`/${locale}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password,
          invite_code: finalInviteCode,
          from: trafficSource || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const userId = data.user_id || data.userId
        if (!userId) {
          setError(t('auth.errorMissingUserId'))
          return
        }
        const p = data.phone ?? data.email
        saveUserAuth(userId, p, data.token, data.role)
        router.push(`/${locale}/dashboard`)
        router.refresh()
      } else {
        setError(data.detail || t('auth.errorRegisterFail'))
      }
    } catch {
      setError(t('auth.errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.registerTitle')}</CardTitle>
          <CardDescription>{t('auth.registerDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={11}
                placeholder={t('auth.placeholderPhone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.placeholderPasswordMin')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <RegisterInviteCodeField onInviteCodeChange={handleInviteCodeChange} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.submitRegisterLoading') : t('auth.submitRegister')}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.hasAccount')}{' '}
              <LocaleLink href="/login" className="text-primary hover:underline">
                {t('auth.goLogin')}
              </LocaleLink>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function RegisterPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-pulse">
        <CardHeader>
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="mt-2 h-4 w-full rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent />
    </Suspense>
  )
}
