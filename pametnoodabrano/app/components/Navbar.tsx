"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, User, LogOut, Loader2, Globe } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { useLanguage } from "@/app/lib/language-context";
import { UserAccountButton } from "./user/UserAccountButton";
import { UserProfileModal } from "./user/UserProfileModal";

const navLinks = [
  { href: "/products", labelKey: "nav.articles" },
  { href: "/categories", labelKey: "nav.categories" },
  { href: "/brands", labelKey: "nav.brands" },
];

export default function Navbar() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Hide navbar on auth pages
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't render navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  // Scroll-based styling: at top has margins and rounded corners
  const navWrapperClasses = isAtTop
    ? "mx-2 md:mx-4 mt-2 md:mt-3"
    : "mx-0 mt-0";

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navWrapperClasses}`}>
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`transition-all duration-500 bg-black shadow-md ${
            isAtTop ? "rounded-2xl" : ""
          }`}
        >
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                  <Image
                    src="/assets/sarayalogoicon.png"
                    alt="Saraya Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-lg text-white">
                  Saraya
                </span>
                <span className="block text-xs text-white/70">
                  Pametno odabrano
                </span>
              </div>
            </Link>

            {/* Mobile Center Logo */}
            <Link href="/" className="lg:hidden absolute left-1/2 -translate-x-1/2">
              <Image
                src="/assets/PametnoOdabranoLogo.png"
                alt="Pametno Odabrano"
                style={{ width: "225px", height: "45px" }}
                width={225}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all text-white/90 hover:text-white hover:bg-white/10"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "bs" ? "en" : "bs")}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full transition-all text-white/80 hover:bg-white/10 hover:text-white"
                title={language === "bs" ? "Switch to English" : "Prebaci na Bosanski"}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>

              <Link 
                href="/"
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full transition-all text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">{t("nav.home")}</span>
              </Link>

              {/* Auth buttons - Desktop */}
              <div className="hidden lg:block">
                <UserAccountButton
                  user={user ? { email: user.email, name: user.name } : null}
                  isLoading={loading}
                  onLogout={signOut}
                  onProfileClick={() => setShowProfileModal(true)}
                  variant="dark"
                />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-full transition-all text-white/80 hover:bg-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Profile Modal */}
      {user && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          email={user.email}
          name={user.name || user.email}
        />
      )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-semibold text-gray-900">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-violet-600 transition-colors"
                  >
                    {t("nav.home")}
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-violet-600 transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  ))}

                  {/* Language Switcher - Mobile */}
                  <button
                    onClick={() => setLanguage(language === "bs" ? "en" : "bs")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-violet-600 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    {language === "bs" ? "English" : "Bosanski"}
                  </button>
                  
                  {/* Auth section in mobile menu */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    {loading ? (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    ) : user ? (
                      <>
                        <div className="px-4 py-3 text-sm text-gray-500">
                          {t("userMenu.loggedInAs")} <span className="font-medium text-gray-700">{user.name || user.email}</span>
                        </div>
                        <button
                          onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          {t("nav.logout")}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-center"
                        >
                          {t("nav.login")}
                        </Link>
                        <Link
                          href="/auth/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-3 mt-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-center hover:bg-gray-50 transition-colors"
                        >
                          {t("nav.register")}
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
