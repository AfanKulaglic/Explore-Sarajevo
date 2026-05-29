'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { PlayAndWinItem } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Gamepad2, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlayAndWinSectionProps {
  item?: PlayAndWinItem
}

export function PlayAndWinSection({ item }: PlayAndWinSectionProps) {
  const { language, t } = useLanguage()

  if (!item) return null

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('Saraya Connect Igre', 'Saraya Connect Games')}
          title={t('Igraj i Osvoji', 'Play & Win')}
          subtitle={t(
            'Igraj dok čekaš – bez registracije',
            'Play while you wait – no signup'
          )}
          icon="Gamepad2"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card hover className="overflow-hidden max-w-2xl mx-auto">
            <a href={item.link} className="block group">
              <div className="relative aspect-video">
                {/* Actual Image */}
                {item.imageFile && (
                  <Image
                    src={item.imageFile}
                    alt={(language === 'BA' ? item.titleBosnian : item.titleEnglish) || 'Play & Win'}
                    fill
                    className="object-cover"
                  />
                )}

                {/* Background fallback */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 via-surface-dark to-primary-900/30 -z-10" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-20 h-20 rounded-full bg-primary-600/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-500 transition-all duration-300 shadow-glow">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                {/* Game icon */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur z-10">
                  <Gamepad2 className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-medium text-white">
                    {language === 'BA' ? item.titleBosnian : item.titleEnglish}
                  </span>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {language === 'BA' ? item.titleBosnian : item.titleEnglish}
                  </h3>
                  <p className="text-sm text-dark-400">
                    {language === 'BA' ? item.subtitleBosnian : item.subtitleEnglish}
                  </p>
                </div>
                <Button>
                  {t('Igraj', 'Play')}
                </Button>
              </div>
            </a>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
