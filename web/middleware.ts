import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['zh', 'en', 'ja']
const DEFAULT_LOCALE = 'zh'

/** Agent 站点路由 — 无 locale 前缀，勿被重定向到 /zh/agents */
const AGENT_PATHS = ['/agents', '/llms.txt']

function getLocale(pathname: string): string | null {
  const segment = pathname.split('/')[1]
  return segment && LOCALES.includes(segment) ? segment : null
}

function isAgentPath(pathname: string): boolean {
  if (AGENT_PATHS.includes(pathname)) return true
  if (pathname.startsWith('/agents/')) return true
  return false
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/trpc') ||
    isAgentPath(pathname) ||
    /\.(ico|png|jpg|jpeg|svg|webp|js|css|txt|json|xml)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const locale = getLocale(pathname)
  if (locale) {
    return NextResponse.next()
  }

  const newUrl = new URL(`/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`, request.url)
  newUrl.search = request.nextUrl.search
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ['/((?!api|_next|trpc|.*\\..*).*)'],
}
