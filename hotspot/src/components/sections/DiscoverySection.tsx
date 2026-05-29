'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { DiscoveryPlace } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

interface DiscoverySectionProps {
  places: DiscoveryPlace[]
}

export function DiscoverySection({ places }: DiscoverySectionProps) {
  const { language, t } = useLanguage()

  if (!places.length) return null

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t('Saraya Connect Lokacije', 'Saraya Connect Locations')}
          title={t('Otkrijte Sarajevo', 'Discover Sarajevo')}
          subtitle={t(
            'Popularna mjesta u blizini',
            'Popular places nearby'
          )}
          icon="MapPin"
          action={{
            label: t('Vidi sve', 'View All'),
            href: '#'
          }}
        />

        <div className="grid md:grid-cols-3 gap-4">
          {places.map((place, index) => (
            <motion.a
              key={place.id}
              href={place.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card hover className="overflow-hidden">
                <div className="relative aspect-[16/9]">
                  {/* Actual Image */}
                  {place.imageFile && (
                    <Image
                      src={place.imageFile}
                      alt={language === 'BA' ? place.nameBosnian : place.nameEnglish}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}

                  {/* Background gradient fallback */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-surface-dark -z-10" />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <div className="flex items-center gap-1 text-xs text-primary-300 mb-1">
                      <MapPin className="w-3 h-3" />
                      {language === 'BA' ? place.categoryBosnian : place.categoryEnglish}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'BA' ? place.nameBosnian : place.nameEnglish}
                    </h3>
                  </div>
                </div>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
