'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu, X, ChevronDown, LogOut, Loader2,
  Wifi, Gift, Brain, Gamepad2, ShoppingBag, ExternalLink,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useTranslation } from "../lib/language-context";
import { UserAccountButton } from "./user/UserAccountButton";
import { UserProfileModal } from "./user/UserProfileModal";

const SARAYA_APPS = [
  { name: 'Saraya Connect',    href: 'https://hs.saraya.solutions/',       icon: Wifi },
  { name: 'Rewards Center',   href: 'https://rewards.saraya.solutions/',   icon: Gift },
  { name: 'Saraya Quiz',      href: 'https://quiz.saraya.solutions/',      icon: Brain },
  { name: 'Play & Win',       href: 'https://saraya.games/',               icon: Gamepad2 },
  { name: 'Pametno Odabrano', href: 'https://pametnoodabrano.com/',        icon: ShoppingBag },
];

interface Category { id: string; name: string; slug: string; }

export default function Navbar() {
  const [scrolled, setScrolled]           = useState(false);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [catsOpen, setCatsOpen]           = useState(false);
  const pathname  = usePathname();
  const { user, loading, signOut } = useAuth();
  const { t, language, setLanguage }      = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/categories?all=true', { cache: 'no-store', signal: AbortSignal.timeout(10000) })
      .then(r => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => { setDrawerOpen(false); setCatsOpen(false); }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawerOpen]);

  if (isAuthPage) return null;

  const navBg = scrolled
    ? 'bg-[#0f0f1a]/90 backdrop-blur-xl border-b border-[#1e1e2e]'
    : 'bg-transparent';

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/assets/exploreSarajevo-logo1.png"
                alt="Explore Sarajevo"
                width={170} height={50} priority
                className="h-8 md:h-10 w-auto object-contain transition-all duration-300"
                style={{ filter: scrolled ? 'none' : 'brightness(0) invert(1)' }}
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7">
              <NavLink href="/">{t('nav.home')}</NavLink>
              <CategoriesDropdown categories={categories} label={t('nav.categories')} />
              <NavLink href="/o-nama">{t('footer.aboutUs')}</NavLink>
              <NavLink href="/contact">{t('footer.contact')}</NavLink>
              <a
                href="https://sarayasolutions.com/"
                target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium text-[#a0a0b8] hover:text-[#a78bfa] transition-colors flex items-center gap-1"
              >
                Saraya Solutions <ExternalLink className="w-3 h-3" />
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Language — flag button, visible on all sizes */}
              <button
                onClick={() => setLanguage(language === 'bs' ? 'en' : 'bs')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-white/5 transition"
                aria-label={t('nav.switchLanguage')}
              >
                <div className="w-6 h-4 rounded-sm overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                  <img
                    src={`https://flagcdn.com/w40/${language === 'bs' ? 'ba' : 'gb'}.png`}
                    alt={language === 'bs' ? 'Bosanski' : 'English'}
                    width={24}
                    height={16}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-semibold text-[#a0a0b8] uppercase tracking-wider">
                  {language}
                </span>
              </button>

              {/* User account button — desktop only */}
              <div className="hidden md:block">
                <UserAccountButton
                  user={user ? { email: user.email, name: user.name } : null}
                  isLoading={loading}
                  onLogout={signOut}
                  onProfileClick={() => setShowProfileModal(true)}
                />
              </div>

              {/* Hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-white/5 transition"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button" aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <aside
            ref={drawerRef}
            className="absolute top-0 right-0 h-full w-[88%] max-w-sm flex flex-col animate-slide-in"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <Image
                src="/assets/exploreSarajevo-logo1.png"
                alt="Explore Sarajevo" width={140} height={40}
                style={{ filter: 'brightness(0) invert(1)' }}
                className="h-8 w-auto object-contain"
              />
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg text-[#a0a0b8] hover:text-white hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 thin-scroll">
              <DrawerLink href="/">{t('nav.home')}</DrawerLink>

              <button
                onClick={() => setCatsOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-[#a0a0b8] hover:text-white hover:bg-white/5 font-medium transition"
              >
                <span>{t('nav.categories')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${catsOpen ? 'rotate-180' : ''}`} />
              </button>
              {catsOpen && (
                <div className="pl-4 space-y-0.5 pb-2">
                  {categories.map(c => (
                    <Link key={c.id} href={`/category/${c.slug}`}
                      className="block px-4 py-2 rounded-lg text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              <DrawerLink href="/o-nama">{t('footer.aboutUs')}</DrawerLink>
              <DrawerLink href="/contact">{t('footer.contact')}</DrawerLink>
              <a
                href="https://sarayasolutions.com/" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl text-[#a0a0b8] hover:text-white hover:bg-white/5 font-medium transition"
              >
                <span>Saraya Solutions</span>
                <ExternalLink className="w-4 h-4 text-[#7c3aed]" />
              </a>

              {/* Language */}
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-[#5a5a72] font-semibold">Language</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Bosanski */}
                  <button
                    onClick={() => { setLanguage('bs'); setDrawerOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition"
                    style={{
                      background: language === 'bs' ? 'rgba(124,58,237,0.15)' : 'var(--bg-raised)',
                      border: `1px solid ${language === 'bs' ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="w-7 h-5 rounded-sm overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src="https://flagcdn.com/w40/ba.png" alt="BA" width={28} height={20} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-medium ${language === 'bs' ? 'text-white' : 'text-[#a0a0b8]'}`}>Bosanski</span>
                  </button>
                  {/* English */}
                  <button
                    onClick={() => { setLanguage('en'); setDrawerOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition"
                    style={{
                      background: language === 'en' ? 'rgba(124,58,237,0.15)' : 'var(--bg-raised)',
                      border: `1px solid ${language === 'en' ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
                    }}
                  >
                    <div className="w-7 h-5 rounded-sm overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src="https://flagcdn.com/w40/gb.png" alt="GB" width={28} height={20} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-medium ${language === 'en' ? 'text-white' : 'text-[#a0a0b8]'}`}>English</span>
                  </button>
                </div>
              </div>

              {/* Auth */}
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                {loading ? (
                  <div className="flex justify-center py-3"><Loader2 className="w-5 h-5 animate-spin text-[#a0a0b8]" /></div>
                ) : user ? (
                  <button
                    onClick={() => { signOut(); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-medium transition"
                  >
                    <LogOut className="w-4 h-4" /> {t('nav.signOut')}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/auth/login"
                      className="text-center px-4 py-3 rounded-xl border border-[#1e1e2e] text-[#a0a0b8] hover:text-white hover:border-[#7c3aed] font-medium transition">
                      {t('nav.signIn')}
                    </Link>
                    <Link href="/auth/register"
                      className="text-center px-4 py-3 rounded-xl font-medium text-white transition"
                      style={{ background: 'var(--violet)' }}>
                      {t('nav.createAccount')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Saraya Apps */}
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="px-4 pb-2 text-[10px] uppercase tracking-widest text-[#5a5a72] font-semibold">Saraya Apps</p>
                {SARAYA_APPS.map(app => (
                  <a key={app.name} href={app.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition">
                    <app.icon className="w-4 h-4 text-[#7c3aed]" />
                    <span className="text-sm text-[#a0a0b8]">{app.name}</span>
                  </a>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {user && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          email={user.email}
          name={user.name || user.email}
        />
      )}
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-[#a0a0b8] hover:text-white transition-colors">
      {children}
    </Link>
  );
}

function DrawerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-4 py-3 rounded-xl text-[#a0a0b8] hover:text-white hover:bg-white/5 font-medium transition">
      {children}
    </Link>
  );
}

function CategoriesDropdown({ categories, label }: { categories: Category[]; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-[#a0a0b8] hover:text-white flex items-center gap-1 transition-colors"
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl shadow-2xl p-2 max-h-[70vh] overflow-y-auto thin-scroll z-50"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#5a5a72] font-semibold">Browse by category</div>
          {categories.length === 0
            ? <div className="px-3 py-3 text-sm text-[#5a5a72]">Loading…</div>
            : categories.map(c => (
              <Link key={c.id} href={`/category/${c.slug}`} onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#a0a0b8] hover:text-white hover:bg-white/5 transition">
                {c.name}
              </Link>
            ))
          }
        </div>
      )}
    </div>
  );
}
