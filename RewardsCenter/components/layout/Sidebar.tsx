'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Coins,
  LayoutDashboard,
  ListChecks,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Swords,
  Ticket,
  Trophy,
  User,
  Users,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useFriends } from "@/lib/friends-context";
import { useTranslation } from "@/lib/i18n";

type NavKey = 'catalog' | 'earnRewards' | 'promoCodes' | 'orders' | 'tournaments' | 'leaderboard' | 'friends' | 'messages' | 'account';

const navItems: { key: NavKey; href: string; icon: typeof LayoutDashboard; gradient: string; requiresAuth: boolean }[] = [
  { key: "catalog", href: "/rewards/catalog", icon: LayoutDashboard, gradient: "from-blue-500 to-cyan-500", requiresAuth: false },
  { key: "earnRewards", href: "/earn", icon: Coins, gradient: "from-amber-500 to-orange-500", requiresAuth: false },
  { key: "promoCodes", href: "/coupons", icon: Ticket, gradient: "from-pink-500 to-rose-500", requiresAuth: false },
  { key: "orders", href: "/rewards/orders", icon: ListChecks, gradient: "from-emerald-500 to-teal-500", requiresAuth: true },
  { key: "tournaments", href: "/tournaments", icon: Swords, gradient: "from-red-500 to-orange-500", requiresAuth: false },
  { key: "leaderboard", href: "/leaderboard", icon: Trophy, gradient: "from-amber-400 to-yellow-500", requiresAuth: false },
  { key: "friends", href: "/friends", icon: Users, gradient: "from-sky-400 to-blue-500", requiresAuth: true },
  { key: "messages", href: "/messages", icon: MessageCircle, gradient: "from-teal-500 to-cyan-500", requiresAuth: true },
  { key: "account", href: "/account", icon: User, gradient: "from-brand-500 to-violet-500", requiresAuth: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { friendRequestCount } = useFriends();
  const { t } = useTranslation();

  return (
    <aside className="hidden w-72 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm backdrop-blur-2xl lg:flex lg:flex-col h-fit">
      {/* Decorative gradient */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col gap-1.5">
        <div className="mb-2 px-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{t.nav.navigation}</p>
        </div>
        
        {navItems.map(({ key, href, icon: Icon, gradient, requiresAuth }) => {
          const label = t.nav[key];
          const active = pathname.startsWith(href);
          const showBadge = key === "friends" && friendRequestCount > 0 && isAuthenticated;
          const isLocked = requiresAuth && !isAuthenticated;
          
          const handleClick = (e: React.MouseEvent) => {
            if (isLocked) {
              e.preventDefault();
              router.push('/auth/login');
            }
          };
          
          return (
            <Link
              key={href}
              href={isLocked ? '/auth/login' : href}
              onClick={handleClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200",
                active && !isLocked
                  ? "bg-gradient-to-r from-brand-600/30 to-brand-500/20 text-white"
                  : isLocked
                  ? "text-white/40 hover:text-white/60 hover:bg-white/5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {/* Active indicator bar */}
              {active && !isLocked && (
                <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" />
              )}
              
              <span
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  active && !isLocked
                    ? `bg-gradient-to-br ${gradient} shadow-lg` 
                    : "bg-white/5 group-hover:bg-white/10"
                )}
              >
                <Icon size={18} className={active && !isLocked ? "text-white" : ""} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {friendRequestCount > 9 ? '9+' : friendRequestCount}
                  </span>
                )}
              </span>
              
              <span className="flex-1 font-medium">{label}</span>
              
              {isLocked && (
                <LogIn size={14} className="text-white/30" />
              )}
              
              {showBadge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {friendRequestCount > 99 ? '99+' : friendRequestCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      {/* Login CTA for guests */}
      {!isAuthenticated && (
        <div className="relative pt-4">
          <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-600/20 to-violet-600/20 p-4">
            <p className="text-sm font-semibold text-white">{t.sidebar.joinRewards}</p>
            <p className="mt-1 text-xs text-white/50">{t.sidebar.joinRewardsDescription}</p>
            <Link 
              href="/auth/login"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-brand-500/40"
            >
              <LogIn size={16} />
              {t.auth.signIn}
            </Link>
          </div>
        </div>
      )}
      
      {/* Bottom section - Help */}
      <div className="relative pt-4">
        <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-brand-600/20 to-violet-600/20 p-4">
          <p className="text-xs font-semibold text-white">{t.sidebar.needHelp}</p>
          <p className="mt-1 text-xs text-white/50">{t.sidebar.helpDescription}</p>
          <Link 
            href="/support"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <HelpCircle size={14} />
            {t.sidebar.supportCenter}
          </Link>
        </div>
      </div>
    </aside>
  );
}
