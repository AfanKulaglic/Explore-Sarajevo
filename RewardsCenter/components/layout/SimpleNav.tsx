'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaArrowLeft, FaHome } from 'react-icons/fa'

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
]

export function SimpleNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side - Back to home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <FaHome className="text-lg" />
            <span className="hidden sm:inline font-medium">Rewards Center</span>
          </Link>

          {/* Right side - Nav links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
