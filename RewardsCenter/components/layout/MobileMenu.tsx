'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Coins,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  Swords,
  Ticket,
  Trophy,
  User,
  Users,
  HelpCircle,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useFriends } from "@/lib/friends-context";

const navItems = [
  { label: "Catalog", href: "/rewards/catalog", icon: LayoutDashboard, gradient: "from-blue-500 to-cyan-500" },
  { label: "Earn Rewards", href: "/earn", icon: Coins, gradient: "from-amber-500 to-orange-500" },
  { label: "Promo Codes", href: "/coupons", icon: Ticket, gradient: "from-pink-500 to-rose-500" },
  { label: "Orders", href: "/rewards/orders", icon: ListChecks, gradient: "from-emerald-500 to-teal-500" },
  { label: "Tournaments", href: "/tournaments", icon: Swords, gradient: "from-red-500 to-orange-500" },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy, gradient: "from-amber-400 to-yellow-500" },
  { label: "Friends", href: "/friends", icon: Users, gradient: "from-sky-400 to-blue-500" },
  { label: "Messages", href: "/messages", icon: MessageCircle, gradient: "from-teal-500 to-cyan-500" },
  { label: "Account", href: "/account", icon: User, gradient: "from-brand-500 to-violet-500" },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { friendRequestCount } = useFriends();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-white transition hover:border-brand-500/60 hover:bg-brand-500/10 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed z-50 w-80 max-w-[85vw] bg-slate-950 shadow-2xl lg:hidden overscroll-contain"
              style={{ top: 0, left: 0, height: '100dvh', overflowY: 'auto' }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center">
                    <img src="/sarayalogoicon.png" alt="Saraya" className="h-10 w-10 object-contain" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">Saraya</p>
                    <p className="text-xs text-white/50">Rewards Store</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Navigation
                </p>
                <div className="space-y-1">
                  {navItems.map(({ label, href, icon: Icon, gradient }) => {
                    const active = pathname.startsWith(href);
                    const showFriendsBadge = href === "/friends" && friendRequestCount > 0 && isAuthenticated;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 transition-all",
                          active
                            ? "bg-brand-500/20 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span
                          className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-xl",
                            active
                              ? `bg-gradient-to-br ${gradient} shadow-lg`
                              : "bg-white/5"
                          )}
                        >
                          <Icon size={20} />
                          {showFriendsBadge && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                              {friendRequestCount > 9 ? '9+' : friendRequestCount}
                            </span>
                          )}
                        </span>
                        <span className="font-medium">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Support Card */}
              <div className="p-4 pb-24">
                <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-brand-600/20 to-violet-600/20 p-4">
                  <p className="text-sm font-semibold text-white">Need Help?</p>
                  <p className="mt-1 text-xs text-white/50">
                    Check our support center for guides.
                  </p>
                  <Link
                    href="/support"
                    onClick={() => setIsOpen(false)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <HelpCircle size={16} />
                    Support Center
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
