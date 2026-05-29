'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Gift, 
  ShoppingCart, 
  Trophy, 
  Ticket, 
  Users,
  Settings,
  ArrowLeft,
  Award,
  FolderOpen,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth'
import { motion, AnimatePresence } from 'framer-motion'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, isLoading, isAuthenticated, logout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, isLoginPage, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Login page renders without sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Not authenticated - don't render (redirect will happen)
  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/rewards', label: 'Rewards', icon: Gift },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/admin/achievements', label: 'Achievements', icon: Award },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/users', label: 'Users', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Admin</span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-slate-900 lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Mobile Sidebar Header */}
                <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">Admin Panel</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/60"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Admin Info */}
                {admin && (
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-medium text-white truncate">{admin.name || admin.email}</p>
                    <p className="text-xs text-white/50 truncate">{admin.email}</p>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || 
                      (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>

                {/* Footer Actions */}
                <div className="border-t border-white/10 p-3 space-y-1">
                  <Link
                    href="/rewards/catalog"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Store
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400/70 transition-all hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Admin Panel</span>
          </div>

          {/* Admin Info */}
          {admin && (
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-sm font-medium text-white truncate">{admin.name || admin.email}</p>
              <p className="text-xs text-white/50 truncate">{admin.email}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/rewards/catalog"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Store
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400/70 transition-all hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-14 lg:pt-0 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}
