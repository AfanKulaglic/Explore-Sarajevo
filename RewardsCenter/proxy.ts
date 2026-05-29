import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/avatar']
const PROTECTED_PREFIXES = ['/rewards', '/friends', '/account', '/orders', '/notifications', '/messages', '/tournaments', '/leaderboard', '/admin']

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const normalizedPath = pathname.toLowerCase()
  const hasCentralSession = Boolean(request.cookies.get('sb-auth-token'))

  if (hasCentralSession && isAuthPath(normalizedPath)) {
    const desired = searchParams.get('redirect')
    const target = desired && desired.startsWith('/') ? desired : '/rewards/catalog'
    const url = new URL(target, request.url)
    return NextResponse.redirect(url)
  }

  if (!hasCentralSession && isProtected(normalizedPath)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/|api/|.*\.).*)'],
}
