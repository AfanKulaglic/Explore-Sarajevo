'use client'

import { useLanguage } from '@/context/LanguageContext'
import { HeroBanner } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Gift, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface FeaturedBannerProps {
  banner?: HeroBanner
}

export function FeaturedBanner({ banner }: FeaturedBannerProps) {
  const { language, t } = useLanguage()

  if (!banner) return null

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-surface-dark" />
          
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Content */}
          <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Gift className="w-7 h-7 text-primary-300" />
              </div>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs text-primary-300 mb-1">
                  <Sparkles className="w-3 h-3" />
                  {t('Ekskluzivno za Saraya Connect korisnike', 'Exclusive for Saraya Connect users')}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {language === 'BA' ? banner.titleBosnian : banner.titleEnglish}
                </h2>
                <p className="text-sm text-white/70 mt-1">
                  {language === 'BA' ? banner.subtitleBosnian : banner.subtitleEnglish}
                </p>
              </div>
            </div>

            <Button size="lg" className="whitespace-nowrap shrink-0">
              {language === 'BA' ? banner.buttonTextBosnian : banner.buttonTextEnglish}
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary-600/20 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  )
}
