'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { HeroSection } from '@/components/sections/HeroSection'
import { ChipsBar } from '@/components/sections/ChipsBar'
import { CityUtility } from '@/components/sections/CityUtility'
import { NewsCarousel } from '@/components/sections/NewsCarousel'
import { DealsWithCarousels } from '@/components/sections/DealsWithCarousels'
import { Footer } from '@/components/sections/Footer'
import { LoadingSpinner } from '@/components/ui/PageLoader'

/**
 * Main Home Page Component
 * 
 * Uses the ContentContext to get dynamic content that can be
 * updated via the admin panel. Changes made in admin are
 * immediately reflected here.
 */
export default function Home() {
  const { content, isLoading } = useContent()

  const {
    heroVideos,
    chips,
    heroBanners,
    blockSets,
    editorsPicks,
    discovery,
    utilities,
    footer,
    newsCarousel
  } = content

  // Show loading state while content is being fetched
  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-sm text-white/40">Loading content...</p>
        </div>
      </main>
    )
  }

  return (
    <LanguageProvider>
      <main className="min-h-screen bg-surface-dark">
        {/* Hero: one random video + one random banner per full page load (pools from CMS) */}
        <HeroSection 
          video={heroVideos?.[0]} 
          videos={heroVideos}
          banner={heroBanners?.[0]} 
          banners={heroBanners}
        />

        {/* Chips Navigation */}
        {chips && <ChipsBar chips={chips} />}

        {/* City Utility */}
        <CityUtility config={utilities} />

        {/* News Carousel - CTA cards above deals */}
        <NewsCarousel cards={newsCarousel} />

        {/* Deals + Carousels (Pametno Odabrano, Sarajevo Discovery, Play and Win) */}
        <DealsWithCarousels 
          blockSets={blockSets} 
          editorsPicks={editorsPicks}
          discoveryPlaces={discovery?.places}
        />

        {/* Footer */}
        <Footer icons={footer?.icons} />
      </main>
    </LanguageProvider>
  )
}
