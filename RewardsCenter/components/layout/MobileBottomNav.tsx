'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  Trophy,
  User,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";

type NavKey = 'catalog' | 'earn' | 'tournaments' | 'account';

const mobileNavItems: { key: NavKey; href: string; icon: typeof LayoutDashboard; requiresAuth: boolean }[] = [
  { key: "catalog", href: "/rewards/catalog", icon: LayoutDashboard, requiresAuth: false },
  { key: "earn", href: "/earn", icon: Coins, requiresAuth: false },
  { key: "tournaments", href: "/tournaments", icon: Trophy, requiresAuth: false },
  { key: "account", href: "/account", icon: User, requiresAuth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  // Map keys to translated labels
  const getLabel = (key: NavKey) => {
    switch (key) {
      case 'catalog': return t.nav.catalog;
      case 'earn': return t.nav.earn;
      case 'tournaments': return t.nav.tournaments;
      case 'account': return t.nav.account;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map(({ key, href, icon: Icon, requiresAuth }) => {
          const label = getLabel(key);
          const active = pathname.startsWith(href);
          const isLocked = requiresAuth && !isAuthenticated;
          
          // For Account, show Login if not authenticated
          if (key === "account" && !isAuthenticated) {
            return (
              <Link
                key={href}
                href="/auth/login"
                className="flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all text-brand-400"
              >
                <LogIn size={22} />
                <span className="text-[10px] font-medium">{t.auth.signIn}</span>
              </Link>
            );
          }
          
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                active
                  ? "text-brand-400"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              <Icon size={22} className={active ? "text-brand-400" : ""} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span className="absolute bottom-1 h-1 w-8 rounded-full bg-brand-500" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-slate-950/95" />
    </nav>
  );
}
