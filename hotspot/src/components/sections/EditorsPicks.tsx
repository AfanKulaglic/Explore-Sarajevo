'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { EditorsPickItem } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { Star, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EditorsPicksProps {
  items: EditorsPickItem[]
}

// Layout pattern: 2 small, 1 large, 2 small, 1 large...
// Returns 'small' or 'large' based on index
function getCardSize(index: number): 'small' | 'large' {
  const pattern = [0, 1, 2, 3, 4, 5] // positions in pattern
  const posInPattern = index % 6
  // 0,1 = small, 2 = large, 3,4 = small, 5 = large
  if (posInPattern === 2 || posInPattern === 5) return 'large'
  return 'small'
}

export function EditorsPicks({ items }: EditorsPicksProps) {
  const { language, t } = useLanguage()

  if (!items.length) return null

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('Saraya Connect Izbor', 'Saraya Connect Picks')}
          title={t('Ekskluzivne ponude', 'Exclusive Offers')}
          subtitle={t(
            'Posebno odabrane ponude i sadržaji za naše korisnike',
            'Specially selected offers and content for our users'
          )}
          action={{
            label: t('Vidi sve', 'View All'),
            href: '#',
          }}
        />

        {/* 2x1x2x1 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => {
            const size = getCardSize(index)
            const isLarge = size === 'large'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(isLarge && 'md:col-span-2')}
              >
                <Card hover className="h-full overflow-hidden">
                  <div
                    className={cn(
                      'flex flex-col',
                      isLarge && 'md:flex-row'
                    )}
                  >
                    {/* Image */}
                    <div
                      className={cn(
                        'relative bg-gradient-to-br from-surface-elevated to-surface-dark overflow-hidden',
                        isLarge
                          ? 'aspect-[16/9] md:aspect-auto md:w-1/2 md:min-h-[280px]'
                          : 'aspect-[16/10]'
                      )}
                    >
                      {/* Actual Image */}
                      {item.imageFile && (
                        <Image
                          src={item.imageFile}
                          alt={language === 'BA' ? item.titleBosnian : item.titleEnglish}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {/* Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant={index === 0 ? 'new' : index % 3 === 0 ? 'hot' : 'top'}>
                          <Star className="w-3 h-3" />
                          {index === 0 ? t('Novo', 'New') : index % 3 === 0 ? 'Hot' : 'Top'}
                        </Badge>
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[1]" />
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        'p-5 flex flex-col justify-between',
                        isLarge && 'md:w-1/2 md:p-6'
                      )}
                    >
                      <div>
                        <div className="text-xs font-medium text-primary-400 uppercase tracking-wider mb-2">
                          {t('SARAYA CONNECT PONUDA', 'SARAYA CONNECT OFFER')}
                        </div>

                        <h3
                          className={cn(
                            'font-bold text-white mb-2',
                            isLarge ? 'text-xl md:text-2xl' : 'text-lg'
                          )}
                        >
                          {language === 'BA' ? item.titleBosnian : item.titleEnglish}
                        </h3>

                        <p
                          className={cn(
                            'text-dark-400 mb-4',
                            isLarge ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'
                          )}
                        >
                          {language === 'BA' ? item.teaserBosnian : item.teaserEnglish}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                        <span className="text-xs text-dark-500">
                          {t('Sponzorirano', 'Sponsored')}
                        </span>
                        <a
                          href={item.link}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300"
                        >
                          {t('Pogledaj', 'View')}
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
