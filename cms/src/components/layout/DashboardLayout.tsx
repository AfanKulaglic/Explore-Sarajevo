'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BreadcrumbProvider } from '@/lib/breadcrumb-context';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (!isLoading && !user && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [user, isLoading, router, pathname]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm">Učitavanje...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <BreadcrumbProvider>
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - fixed on desktop */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onMobileClose={() => setMobileMenuOpen(false)} 
      />
      
      {/* Main content area - padding to avoid sidebar overlap */}
      <div className="min-h-screen lg:pl-[280px]">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main
          className={
            pathname.startsWith('/dashboard/hotspot')
              ? 'px-3 py-6 sm:px-4 lg:px-6'
              : 'px-4 py-6 sm:px-6 lg:px-8'
          }
        >
          <div
            className={
              pathname.startsWith('/dashboard/hotspot')
                ? 'mx-auto w-full max-w-none space-y-6'
                : 'mx-auto max-w-7xl space-y-6'
            }
          >
            {children}
          </div>
        </main>
      </div>
    </div>
    </BreadcrumbProvider>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutInner>{children}</DashboardLayoutInner>
  );
}
