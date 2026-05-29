'use client'

import { useLanguage } from '@/context/LanguageContext'
import { FooterIcon } from '@/types/content'
import { Wifi, Heart, Signal, ExternalLink } from 'lucide-react'

interface FooterProps {
  icons?: FooterIcon[]
}

/**
 * Footer Component
 * 
 * Displays partner logos, navigation links, and copyright.
 * Features clean layout with connection status indicator.
 */
export function Footer({ icons }: FooterProps) {
  const { t } = useLanguage()

  return (
    <footer className="py-10 sm:py-12 bg-gradient-to-b from-surface-card/50 to-surface-dark border-t border-surface-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Partners Section */}
        {icons && icons.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <div className="text-[10px] sm:text-xs text-white/30 uppercase tracking-widest text-center mb-5 font-medium">
              {t('Naši partneri', 'Our Partners')}
            </div>
            <div className="flex justify-center items-center gap-6 sm:gap-8 flex-wrap">
              {icons.map((icon) => (
                <a
                  key={icon.id}
                  href={icon.url}
                  className="group flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-all duration-300"
                >
                  <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-primary-500/30 group-hover:bg-primary-500/5 transition-all">
                    <span className="text-xs sm:text-sm text-white/70 group-hover:text-white font-medium">
                      {icon.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-surface-border/50 to-transparent mb-8" />

        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">Saraya Connect</span>
              <p className="text-[10px] text-white/40">Free WiFi</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-emerald-400">
              {t('Povezani ste', 'You are connected')}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-4 sm:gap-6">
            {[
              { label: t('Privatnost', 'Privacy'), href: '#' },
              { label: t('Uslovi', 'Terms'), href: '#' },
              { label: t('Kontakt', 'Contact'), href: '#' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs sm:text-sm text-white/40 hover:text-primary-400 transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-surface-border/30 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-white/30">
            <span>© 2025 Saraya Connect</span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1">
              {t('Napravljeno sa', 'Made with')}
              <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
              {t('u Sarajevu', 'in Sarajevo')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
