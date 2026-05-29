'use client'

import { useLanguage } from '@/context/LanguageContext'
import { ChipItem } from '@/types/content'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef, useState, useCallback, type RefObject } from 'react'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { captureEvent } from '@/lib/analytics/capture'
import { useImpressionOnce } from '@/lib/analytics/use-impression-once'

function deviceBucket(): string {
  if (typeof window === 'undefined') return 'unknown'
  const w = window.innerWidth
  if (w < 1024) return 'mobile'
  return 'desktop'
}

// Type-safe icon lookup
const IconsMap = Icons as unknown as Record<string, LucideIcon>

interface ChipsBarProps {
  chips: ChipItem[]
}

function TrackedChipLink({
  chip,
  language,
  index,
  layout,
  onChipClick,
  t,
}: {
  chip: ChipItem
  language: 'BA' | 'EN'
  index: number
  layout: 'scroll' | 'grid'
  onChipClick: (e: React.MouseEvent) => void
  t: (ba: string, en: string) => string
}) {
  const impRef = useImpressionOnce(
    useCallback(() => {
      if (!chip.tracking) return
      captureEvent(
        ANALYTICS_EVENTS.quick_access_viewed,
        { device: deviceBucket() },
        chip.tracking
      )
    }, [chip.tracking]),
    { resetKey: chip.id, threshold: 0.35 }
  )

  const onNavigate = useCallback(() => {
    if (chip.tracking) {
      captureEvent(
        ANALYTICS_EVENTS.quick_access_clicked,
        { device: deviceBucket() },
        chip.tracking
      )
    }
  }, [chip.tracking])

  const IconComponent = chip.icon ? IconsMap[chip.icon] : null

  const scrollClass = cn(
    'inline-flex items-center gap-3 flex-shrink-0',
    'px-4 py-2.5 sm:px-5 sm:py-2.5 max-[430px]:px-3 max-[430px]:py-2',
    'rounded-xl',
    'bg-surface-elevated/80 border border-surface-border/60',
    'text-sm sm:text-sm max-[430px]:text-xs font-medium text-white/80',
    'hover:bg-primary-600/90 hover:border-primary-500/70 hover:text-white',
    'hover:shadow-lg hover:shadow-primary-500/10',
    'active:scale-[0.98] active:bg-primary-600/90',
    'transition-all duration-200 ease-out',
    'pointer-events-auto'
  )

  const gridClass =
    'group inline-flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-surface-border/60 bg-surface-elevated/80 px-4 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 ease-out hover:bg-primary-600/90 hover:border-primary-500/70 hover:text-white hover:shadow-lg hover:shadow-primary-500/10 active:scale-[0.98] active:bg-primary-600/90'

  return (
    <motion.a
      ref={impRef as RefObject<HTMLAnchorElement>}
      href={chip.link}
      onClick={(e) => {
        onChipClick(e)
        if (!e.defaultPrevented) onNavigate()
      }}
      draggable={false}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * (layout === 'scroll' ? 0.05 : 0.04), duration: 0.3 }}
      className={layout === 'scroll' ? scrollClass : gridClass}
    >
      {layout === 'scroll' ? (
        <>
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border/60 bg-white/5 text-primary-400 transition-all group-hover:border-primary-500/50 group-hover:text-white">
            {IconComponent ? (
              <IconComponent className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-primary-400/60" />
            )}
          </div>
          <span className="whitespace-nowrap">
            {language === 'BA' ? chip.nameBosnian : chip.nameEnglish}
          </span>
        </>
      ) : (
        <>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-border/60 bg-white/5 text-primary-400 transition-all group-hover:border-primary-500/50 group-hover:text-white">
            {IconComponent ? (
              <IconComponent className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-primary-400/60" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="whitespace-nowrap overflow-hidden text-ellipsis">
              {language === 'BA' ? chip.nameBosnian : chip.nameEnglish}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-white/60 transition-colors group-hover:text-white">
            <span className="hidden xl:inline">{t('Otvori', 'Open')}</span>
            <ArrowRightIcon />
          </div>
        </>
      )}
    </motion.a>
  )
}

/**
 * ChipsBar Component
 * 
 * Displays quick access navigation chips with icons.
 * Features:
 * - Smooth animations and hover effects
 * - Horizontal drag/swipe on mobile and desktop
 * - Larger touch targets on mobile for better usability
 * - Responsive design across all screen sizes
 */
export function ChipsBar({ chips }: ChipsBarProps) {
  const { language, t } = useLanguage()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Drag state management
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  // ==========================================================================
  // MOUSE DRAG HANDLERS (Desktop)
  // ==========================================================================
  
  /**
   * Initiates drag on mouse down
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])

  /**
   * Ends drag on mouse up
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  /**
   * Ends drag when mouse leaves container
   */
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  /**
   * Handles drag movement on mouse move
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5 // Multiplier for faster scrolling
    scrollRef.current.scrollLeft = scrollLeft - walk
    
    // Mark as dragged if moved more than 5px (to differentiate from clicks)
    if (Math.abs(x - startX) > 5) {
      setHasDragged(true)
    }
  }, [isDragging, startX, scrollLeft])

  // ==========================================================================
  // TOUCH HANDLERS (Mobile)
  // ==========================================================================
  
  /**
   * Initiates drag on touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasDragged(false)
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])

  /**
   * Handles drag movement on touch move
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeft - walk
    
    if (Math.abs(x - startX) > 5) {
      setHasDragged(true)
    }
  }, [isDragging, startX, scrollLeft])

  /**
   * Ends drag on touch end
   */
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // ==========================================================================
  // CLICK HANDLER
  // ==========================================================================
  
  /**
   * Prevents navigation if user was dragging
   */
  const handleChipClick = useCallback((e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault()
    }
  }, [hasDragged])

  if (!chips || chips.length === 0) return null

  return (
    <section className="relative z-20 py-3 sm:py-4 lg:py-3 -mt-1 sm:-mt-1 lg:-mt-3 max-[430px]:-mt-4 max-[430px]:py-2 border-y border-surface-border/50 bg-gradient-to-b from-surface-card/60 via-surface-card/35 to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="text-center mb-3 sm:mb-4 max-[430px]:mb-1.5 lg:hidden">
          <p className="text-[10px] sm:text-xs max-[430px]:text-[9px] text-white/40 uppercase tracking-widest font-medium">
            {t('Brzi pristup', 'Quick Access')}
          </p>
        </div>

        {/* Desktop heading */}
        <div className="hidden lg:flex items-center justify-center mb-2">
          <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-white/40">
            {t('Brzi pristup', 'Quick Access')}
          </p>
        </div>
        
        {/* Chips container - draggable/swipeable */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            // Base styles
            'flex gap-2.5 sm:gap-3 max-[430px]:gap-2 overflow-x-auto pb-2 max-[430px]:pb-0.5 select-none hide-scrollbar',
            // Center on larger screens when content fits
            'lg:hidden',
            // Cursor styles based on drag state
            isDragging ? 'cursor-grabbing' : 'cursor-grab lg:cursor-default',
            // Padding for edge chips visibility on mobile
            'px-1 -mx-1 sm:px-0 sm:mx-0'
          )}
        >
          {chips.map((chip, index) => (
            <TrackedChipLink
              key={chip.id}
              chip={chip}
              language={language}
              index={index}
              layout="scroll"
              onChipClick={handleChipClick}
              t={t}
            />
          ))}
        </div>

        {/* Scroll hint for mobile - shows when there are many chips */}
        {chips.length > 4 && (
          <div className="flex justify-center mt-3 max-[430px]:mt-1.5 lg:hidden">
            <div className="flex items-center gap-1.5">
              {/* Animated dots indicating scrollability */}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="flex gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="w-1 h-1 rounded-full bg-white/40" />
              </motion.div>
              <span className="text-[10px] text-white/30 ml-1">
                {t('Prevuci', 'Swipe')}
              </span>
            </div>
          </div>
        )}

        {/* Desktop action grid */}
        <div className="hidden lg:flex lg:flex-wrap gap-2.5">
          {chips.map((chip, index) => (
            <TrackedChipLink
              key={chip.id}
              chip={chip}
              language={language}
              index={index}
              layout="grid"
              onChipClick={() => {}}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M4.167 10h11.666m0 0-4.166-4.167M15.833 10l-4.166 4.167"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
