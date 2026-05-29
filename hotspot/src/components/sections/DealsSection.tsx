'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { BlockItem, BlockSet } from '@/types/content'

function dealBlockButtonLabel(block: BlockItem, language: 'BA' | 'EN'): string {
  return language === 'BA' ? block.buttonTextBosnian : block.buttonTextEnglish
}
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

interface DealsSectionProps {
  blockSet?: BlockSet
}

export function DealsSection({ blockSet }: DealsSectionProps) {
  const { t, language } = useLanguage()

  if (!blockSet?.blocks.length) return null

  // Split blocks into two groups of 3
  const firstGroup = blockSet.blocks.slice(0, 3)
  const secondGroup = blockSet.blocks.slice(3, 6)

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('Saraya Connect Ponude', 'Saraya Connect Deals')}
          title={t('Ekskluzivne ponude', 'Exclusive Offers')}
          subtitle={t(
            'Posebne ponude dostupne samo na Saraya Connect mreži',
            'Special offers available only on Saraya Connect network'
          )}
          icon="ShoppingBag"
        />

        <div className="space-y-6">
          {/* First Group: 1 tall on left, 2 stacked on right */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {/* Tall card on left - spans 2 rows */}
            {firstGroup[0] && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="row-span-2"
              >
                <Card hover className="h-full group overflow-hidden">
                  <div className="relative h-full min-h-[300px] md:min-h-[400px] bg-gradient-to-br from-surface-elevated to-surface-dark overflow-hidden">
                    {firstGroup[0].imageFile && (
                      <Image
                        src={firstGroup[0].imageFile}
                        alt={language === 'BA' ? firstGroup[0].titleBosnian : firstGroup[0].titleEnglish}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                      <h3 className="text-base md:text-xl font-bold text-white mb-1">{language === 'BA' ? firstGroup[0].titleBosnian : firstGroup[0].titleEnglish}</h3>
                      <p className="text-xs md:text-sm text-white/70 line-clamp-2">{language === 'BA' ? firstGroup[0].descriptionBosnian : firstGroup[0].descriptionEnglish}</p>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 z-20">
                      <Button size="sm" className="w-full text-xs md:text-sm">
                        {dealBlockButtonLabel(firstGroup[0], language)}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Two stacked cards on right */}
            {firstGroup.slice(1, 3).map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 1) * 0.1 }}
              >
                <Card hover className="h-full group overflow-hidden">
                  <div className="relative aspect-square bg-gradient-to-br from-surface-elevated to-surface-dark overflow-hidden">
                    {block.imageFile && (
                      <Image
                        src={block.imageFile}
                        alt={language === 'BA' ? block.titleBosnian : block.titleEnglish}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-20">
                      <h3 className="text-sm md:text-lg font-bold text-white">{language === 'BA' ? block.titleBosnian : block.titleEnglish}</h3>
                      <p className="text-[10px] md:text-xs text-white/70 line-clamp-1 md:line-clamp-2">{language === 'BA' ? block.descriptionBosnian : block.descriptionEnglish}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Second Group: 1 large on top, 2 small below */}
          {secondGroup.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {/* Large card spanning full width on top */}
              {secondGroup[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="col-span-2"
                >
                  <Card hover className="h-full group overflow-hidden">
                    <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-surface-elevated to-surface-dark overflow-hidden">
                      {secondGroup[0].imageFile && (
                        <Image
                          src={secondGroup[0].imageFile}
                          alt={language === 'BA' ? secondGroup[0].titleBosnian : secondGroup[0].titleEnglish}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20">
                        <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">{language === 'BA' ? secondGroup[0].titleBosnian : secondGroup[0].titleEnglish}</h3>
                        <p className="text-xs md:text-sm text-white/70 mb-2 md:mb-4 max-w-md line-clamp-2">{language === 'BA' ? secondGroup[0].descriptionBosnian : secondGroup[0].descriptionEnglish}</p>
                        <Button size="sm" className="text-xs md:text-sm">
                        {dealBlockButtonLabel(secondGroup[0], language)}
                      </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Two smaller cards below */}
              {secondGroup.slice(1, 3).map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index + 1) * 0.1 }}
                >
                  <Card hover className="h-full group overflow-hidden">
                    <div className="relative aspect-square bg-gradient-to-br from-surface-elevated to-surface-dark overflow-hidden">
                      {block.imageFile && (
                        <Image
                          src={block.imageFile}
                          alt={language === 'BA' ? block.titleBosnian : block.titleEnglish}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-20">
                        <h3 className="text-sm md:text-lg font-bold text-white mb-1">{language === 'BA' ? block.titleBosnian : block.titleEnglish}</h3>
                        <p className="text-[10px] md:text-xs text-white/70 line-clamp-1 md:line-clamp-2 mb-2 md:mb-3">{language === 'BA' ? block.descriptionBosnian : block.descriptionEnglish}</p>
                        <Button size="sm" className="w-full text-xs md:text-sm">
                          {dealBlockButtonLabel(block, language)}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
