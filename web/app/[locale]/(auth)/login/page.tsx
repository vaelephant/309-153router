"use client"

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveUserAuth } from '@/lib/auth-client'
import { LocaleLink } from '@/components/locale-link'
import { useI18n } from '@/lib/i18n-context'

function getLocaleFromPathname(pathname: string): string {
  const segment = pathname.split('/')[1]
  return segment && ['zh', 'en', 'ja'].includes(segment) ? segment : 'zh'
}

export default function LoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname)
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/${locale}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        const userId = data.user_id || data.userId
        if (!userId) {
          setError(t('auth.errorMissingUserId'))
          return
        }
        saveUserAuth(userId, data.email, data.token, data.role)
        router.push(`/${locale}/dashboard`)
        router.refresh()
      } else {
        setError(data.detail || t('auth.errorLoginFail'))
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
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('auth.loginDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.placeholderEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.placeholderPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.submitLoginLoading') : t('auth.submitLogin')}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <LocaleLink href="/register" className="text-primary hover:underline">
                {t('auth.goRegister')}
              </LocaleLink>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
