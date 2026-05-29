'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { NewsCtaCard } from '@/types/content'
import { useRef, useState, useCallback, type RefObject } from 'react'
import { motion } from 'framer-motion'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { captureEvent } from '@/lib/analytics/capture'
import { useImpressionOnce } from '@/lib/analytics/use-impression-once'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Type-safe icon lookup
const IconsMap = LucideIcons as unknown as Record<string, LucideIcon>

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface NewsCarouselProps {
  cards?: NewsCtaCard[]
}

// =============================================================================
// ICON RENDERER
// =============================================================================

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  // Get icon from lucide-react dynamically
  const IconComponent = IconsMap[name]
  
  if (!IconComponent) {
    // Fallback to a default icon
    return <LucideIcons.Sparkles className={className} />
  }
  
  return <IconComponent className={className} />
}

// =============================================================================
// CTA CARD COMPONENT
// =============================================================================

interface CtaCardProps {
  card: NewsCtaCard
  index: number
}

function CtaCard({ card, index }: CtaCardProps) {
  const { language } = useLanguage()
  
  const text = language === 'BA' ? card.textBosnian : card.textEnglish
  const hasIcon = card.iconName && !card.imageFile
  const hasImage = card.imageFile
  // Only show first chip
  const chip = card.chips?.[0]

  const impRef = useImpressionOnce(
    useCallback(() => {
      if (!card.tracking) return
      captureEvent(ANALYTICS_EVENTS.article_card_viewed, { index }, card.tracking)
    }, [card.tracking, index]),
    { resetKey: card.id, threshold: 0.35 }
  )

  const onClick = useCallback(() => {
    if (card.tracking) {
      captureEvent(ANALYTICS_EVENTS.article_card_clicked, { index }, card.tracking)
    }
  }, [card.tracking, index])
  
  return (
    <motion.a
      ref={impRef as RefObject<HTMLAnchorElement>}
      href={card.link}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex-shrink-0 w-[140px] sm:w-[160px] group"
      draggable={false}
    >
      {/* Card - relative container with fixed height */}
      <div className="relative h-[150px] sm:h-[170px] p-2 group-hover:opacity-80 transition-opacity">
        
        {/* Icon or Image - absolute top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors relative">
          {hasImage ? (
            <Image 
              src={card.imageFile!} 
              alt={text}
              fill
              className="object-cover"
              draggable={false}
            />
          ) : hasIcon ? (
            <DynamicIcon 
              name={card.iconName!} 
              className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400 group-hover:text-primary-300 transition-colors" 
            />
          ) : (
            <LucideIcons.Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
          )}
        </div>
        
        {/* Text - absolute middle area */}
        <div className="absolute top-12 sm:top-14 left-0 right-0 bottom-8 flex items-center justify-center px-1">
          <p className="text-xs sm:text-sm font-medium text-white leading-snug text-center group-hover:text-primary-200 transition-colors">
            {text}
          </p>
        </div>
        
        {/* Chip - absolute bottom center (always same position) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          {chip ? (
            <span className="px-2.5 py-0.5 text-[9px] sm:text-[10px] font-medium rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
              {language === 'BA' ? chip.labelBosnian : chip.labelEnglish}
            </span>
          ) : (
            <span className="h-5" /> // Placeholder to maintain spacing
          )}
        </div>
      </div>
    </motion.a>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * NewsCarousel - Horizontally scrollable CTA cards section
 * 
 * Features:
 * - Portrait ratio cards (1:2 approximately)
 * - Mouse drag, touch swipe, trackpad scroll support
 * - Each card has: icon/image, text (64 char), chips
 * - Transparent background (inherits page bg)
 * - Placed above DealsWithCarousels on homepage
 */
export function NewsCarousel({ cards }: NewsCarouselProps) {
  const { language, t } = useLanguage()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Don't render if no cards
  if (!cards || cards.length === 0) return null

  // Filter out draft cards
  const publishedCards = cards.filter(card => !card.isDraft)
  
  if (publishedCards.length === 0) return null

  return (
    <section className="py-4 sm:py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - left aligned */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <LucideIcons.Newspaper className="w-3.5 h-3.5 text-primary-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {t('Saraya Connect Novosti', 'Saraya Connect Updates')}
          </h3>
        </div>

        {/* Scrollable container - centered on desktop when content fits */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`
            flex gap-6 sm:gap-8 lg:gap-10 overflow-x-auto pb-2 select-none hide-scrollbar
            justify-start lg:justify-center
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
        >
          {publishedCards.map((card, index) => (
            <CtaCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
