'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { RedemptionToast } from '@/components/common/RedemptionToast'
import Footer from './Footer'
import { SimpleNav } from './SimpleNav'
import { useAuth } from '@/lib/auth-context'

// Pages that should NOT show the main navigation
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/avatar']
const adminRoutes = ['/admin']

// Pages that show footer (public/info pages)
const footerRoutes = ['/privacy', '/terms', '/cookies', '/about', '/contact', '/faq']

// Pages that require authentication - redirect to login if not authenticated
const protectedRoutes = ['/account', '/friends', '/messages', '/rewards/orders']

// Pages accessible to guests (viewing only, actions require login)
const guestAccessibleRoutes = ['/', '/rewards/catalog', '/earn', '/leaderboard', '/coupons', '/tournaments']

const AVATAR_SKIPPED_KEY = 'saraya_avatar_skipped'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  
  // Check if current route is an auth page
  const isAuthPage = authRoutes.some(route => pathname.startsWith(route))
  const isAdminPage = adminRoutes.some(route => pathname.startsWith(route))
  const isFooterPage = footerRoutes.some(route => pathname.startsWith(route))
  const isProtectedPage = protectedRoutes.some(route => pathname.startsWith(route))
  const isGuestAccessible = guestAccessibleRoutes.some(route => 
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  )

  // Redirect to login only for protected pages (account, friends, messages, orders)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtectedPage) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, isProtectedPage, router])

  // Check if user needs to set up avatar (after login, not on auth pages)
  // Only prompt once - if they skipped, don't ask again
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !isAuthPage && !isAdminPage && !isFooterPage) {
      const hasSkippedAvatar = localStorage.getItem(AVATAR_SKIPPED_KEY) === user.id
      
      // Only redirect if no avatar AND hasn't skipped before
      if (!user.hasAvatar && !hasSkippedAvatar) {
        router.push('/auth/avatar')
      }
    }
  }, [isLoading, isAuthenticated, user, isAuthPage, isAdminPage, isFooterPage, router])
  
  // Auth pages render without the main layout
  if (isAuthPage) {
    return <>{children}</>
  }

  // Show loading state while checking auth (but not for footer pages or guest accessible pages)
  if (isLoading && !isFooterPage && !isGuestAccessible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and on protected page, don't render anything (redirect will happen)
  if (!isAuthenticated && isProtectedPage) {
    return null
  }
  
  // Admin pages have their own layout
  if (isAdminPage) {
    return <>{children}</>
  }

  // Footer pages - render with minimal layout + SimpleNav
  if (isFooterPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <SimpleNav />
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <Footer />
      </div>
    )
  }

  // Create profile and wallet from auth context
  const profile = {
    name: user?.name || 'Guest',
    handle: user ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : '@guest',
    avatarUrl: user?.avatarUrl || '/default-avatar.svg',
    notifications: 0,
  }

  const wallet = {
    coins: user?.coins || 0,
    tokens: user?.tokens || 0,
    xp: user?.xp || 0,
    level: user?.level || 1,
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <TopBar profile={profile} wallet={wallet} isLoading={isLoading} />
        <div className="flex-1 w-full max-w-[1600px] mx-auto flex gap-6 px-3 sm:px-4 lg:px-8 pb-24 lg:pb-10 py-4 sm:py-6">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <Footer />
      </div>
      <MobileBottomNav />
      <RedemptionToast />
    </>
  )
}
