import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['zh', 'en', 'ja']
const DEFAULT_LOCALE = 'zh'

function getLocale(pathname: string): string | null {
  const segment = pathname.split('/')[1]
  return segment && LOCALES.includes(segment) ? segment : null
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/trpc') ||
    /\.(ico|png|jpg|jpeg|svg|webp|js|css)$/.test(pathname)
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
