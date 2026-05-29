'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useContent } from '@/context/ContentContext'
import { BlockSet, BlockItem, BlockGroup, EditorsPickItem, DiscoveryPlace, PlayAndWinItem } from '@/types/content'
import { Card } from '@/components/ui/Card'
import { MapPin, Sparkles, Gamepad2, Trophy, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback, useEffect, type RefObject } from 'react'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { captureEvent } from '@/lib/analytics/capture'
import { useImpressionOnce } from '@/lib/analytics/use-impression-once'

// =============================================================================
// RANDOM SELECTION UTILITIES
// =============================================================================

function selectRandomItems<T>(items: T[], count: number): T[] {
  if (!items || items.length === 0) return []
  if (items.length <= count) return [...items]
  
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled.slice(0, count)
}

function selectRandomGroup(groups: BlockGroup[]): BlockItem[] {
  if (!groups || groups.length === 0) return []
  const randomIndex = Math.floor(Math.random() * groups.length)
  return groups[randomIndex].blocks
}

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface DealsWithCarouselsProps {
  blockSets?: BlockSet[]
  editorsPicks?: EditorsPickItem[]
  discoveryPlaces?: DiscoveryPlace[]
  editorsPicksDisplayCount?: number
  discoveryDisplayCount?: number
}

// =============================================================================
// CAROUSEL COMPONENTS
// =============================================================================

interface ArrowButtonProps {
  direction: 'left' | 'right'
  onClick: () => void
  disabled?: boolean
}

function ArrowButton({ direction, onClick, disabled = false }: ArrowButtonProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className={`
        w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center
        bg-surface-elevated/80 border border-surface-border/60
        text-white/60 hover:text-white hover:bg-primary-500/20 hover:border-primary-500/40
        disabled:opacity-30 disabled:cursor-not-allowed
        transition-all duration-200 active:scale-95
      `}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

interface DraggableCarouselProps {
  children: React.ReactNode
  title: string
  icon: React.ElementType
  totalItems?: number
  displayedItems?: number
  hideRandomIndicator?: boolean
}

function DraggableCarousel({ children, title, icon: Icon, totalItems, displayedItems, hideRandomIndicator = false }: DraggableCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const SCROLL_AMOUNT = 190

  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    setTimeout(updateScrollState, 300)
  }, [updateScrollState])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseUp = () => { setIsDragging(false); updateScrollState() }
  const handleMouseLeave = () => { setIsDragging(false); updateScrollState() }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft
    scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5
  }

  const handleTouchEnd = () => { setIsDragging(false); updateScrollState() }

  const showRandomIndicator = !hideRandomIndicator && totalItems && displayedItems && totalItems > displayedItems

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-primary-400" />
          </div>
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          {showRandomIndicator && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/20 flex-shrink-0">
              <Shuffle className="w-3 h-3 text-primary-400" />
              <span className="text-[10px] text-primary-300 font-medium">{displayedItems}/{totalItems}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ArrowButton direction="left" onClick={() => scroll('left')} disabled={!canScrollLeft} />
          <ArrowButton direction="right" onClick={() => scroll('right')} disabled={!canScrollRight} />
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex gap-3 overflow-x-auto pb-2 select-none hide-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {children}
      </div>
    </div>
  )
}

interface CarouselItemProps {
  href: string
  imageFile?: string
  title: string
  subtitle: string
  index: number
  itemId: string
  tracking?: EditorsPickItem['tracking'] | DiscoveryPlace['tracking']
}

function CarouselItem({ href, imageFile, title, subtitle, index, itemId, tracking }: CarouselItemProps) {
  const impRef = useImpressionOnce(
    useCallback(() => {
      if (!tracking) return
      captureEvent(ANALYTICS_EVENTS.listing_row_card_viewed, { index }, tracking)
    }, [tracking, index]),
    { resetKey: itemId, threshold: 0.35 }
  )

  const onClick = useCallback(() => {
    if (tracking) {
      captureEvent(ANALYTICS_EVENTS.listing_row_clicked, { index }, tracking)
    }
  }, [tracking, index])

  return (
    <motion.a
      ref={impRef as RefObject<HTMLAnchorElement>}
      href={href}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex-shrink-0 w-[160px] sm:w-[180px] group"
      draggable={false}
    >
      <div className="rounded-xl overflow-hidden bg-surface-card border border-surface-border/60 hover:border-primary-500/40 transition-colors pointer-events-none">
        <div className="relative aspect-[4/3] bg-surface-elevated overflow-hidden">
          {imageFile ? (
            <Image src={imageFile} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-surface-dark" />
          )}
        </div>
        <div className="p-3">
          <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1 mb-0.5 group-hover:text-primary-300 transition-colors">{title}</h4>
          <p className="text-[10px] sm:text-xs text-white/50 line-clamp-2 leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </motion.a>
  )
}

// =============================================================================
// DEAL BLOCK CARD WITH TEXT ANIMATION
// =============================================================================

interface DealBlockCardProps {
  block: BlockItem
  variant: 'vertical' | 'horizontal' | 'square'
  index: number
  showText: boolean
  language: 'BA' | 'EN'
}

function DealBlockCard({ block, variant, index, showText, language }: DealBlockCardProps) {
  const isVertical = variant === 'vertical'
  const isHorizontal = variant === 'horizontal'

  const impRef = useImpressionOnce(
    useCallback(() => {
      if (!block.tracking) return
      captureEvent(ANALYTICS_EVENTS.block_viewed, { layout: variant, index }, block.tracking)
    }, [block.tracking, variant, index]),
    { resetKey: `${block.id}-${variant}`, threshold: 0.35 }
  )

  const handleClick = () => {
    if (block.tracking) {
      captureEvent(ANALYTICS_EVENTS.block_clicked, { layout: variant, index }, block.tracking)
    }
    const link = block.buttonLink
    if (link) {
      if (link.startsWith('#')) {
        const element = document.querySelector(link)
        element?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.open(link, '_blank', 'noopener,noreferrer')
      }
    }
  }
  
  return (
    <motion.div
      ref={impRef as RefObject<HTMLDivElement>}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`${isVertical ? 'h-full' : ''} cursor-pointer`}
      onClick={handleClick}
    >
      <Card hover className="h-full group overflow-hidden">
        <div className={`relative bg-gradient-to-br from-surface-elevated to-surface-dark overflow-hidden ${
          isVertical 
            ? 'h-full min-h-[260px] sm:min-h-[280px] lg:min-h-[300px]' 
            : isHorizontal
              ? 'aspect-[2/1]'
              : 'aspect-square'
        }`}>
          {block.imageFile && (
            <Image
              src={block.imageFile}
              alt={language === 'BA' ? block.titleBosnian : block.titleEnglish}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          
          {/* Animated overlay + text - both hide/show together */}
          <AnimatePresence>
            {showText && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-10"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Text content */}
                <motion.div 
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  exit={{ y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20"
                >
                  <h3 className={`font-bold text-white mb-1 ${isVertical || isHorizontal ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                    {language === 'BA' ? block.titleBosnian : block.titleEnglish}
                  </h3>
                  <p className={`text-white/70 ${isVertical || isHorizontal ? 'text-[10px] sm:text-xs line-clamp-2' : 'text-[10px] line-clamp-1'}`}>
                    {language === 'BA' ? block.descriptionBosnian : block.descriptionEnglish}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// PLAY AND WIN CARD COMPONENT
// =============================================================================

interface PlayAndWinCardProps {
  language: 'BA' | 'EN'
  t: (ba: string, en: string) => string
  gameCount: number
  playAndWin?: PlayAndWinItem
}

function PlayAndWinCard({ language, t, gameCount, playAndWin }: PlayAndWinCardProps) {
  const wrapRef = useImpressionOnce(
    useCallback(() => {
      if (!playAndWin?.tracking) return
      captureEvent(ANALYTICS_EVENTS.play_and_win_viewed, {}, playAndWin.tracking)
    }, [playAndWin]),
    { resetKey: playAndWin?.link ?? 'paw', threshold: 0.35 }
  )

  const onCta = useCallback(() => {
    if (playAndWin?.tracking) {
      captureEvent(ANALYTICS_EVENTS.play_and_win_clicked, {}, playAndWin.tracking)
    }
  }, [playAndWin])
  // Get values from CMS with hardcoded fallbacks
  const title = language === 'BA' 
    ? (playAndWin?.titleBosnian || 'Igraj Zabavne Igre')
    : (playAndWin?.titleEnglish || 'Play Fun Games')
  
  const subtitle = language === 'BA'
    ? (playAndWin?.subtitleBosnian || 'Osvoji popuste i nagrade dok čekaš')
    : (playAndWin?.subtitleEnglish || 'Win discounts and prizes while you wait')
  
  // Link from CMS or fallback to /games
  const link = playAndWin?.link || '/games'
  
  // Check if external link (starts with http:// or https://)
  const isExternalLink = link.startsWith('http://') || link.startsWith('https://')
  
  // Image from CMS (optional)
  const imageUrl = playAndWin?.imageFile
  
  const cardContent = (
    <div className="h-full min-h-[120px] rounded-xl overflow-hidden bg-gradient-to-br from-amber-900/20 via-surface-card to-primary-900/10 border border-surface-border/60 hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10">
      <div className="relative h-full p-4 sm:p-5 flex flex-col justify-center">
        {/* Background image from CMS if provided */}
        {imageUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-card/90 via-surface-card/70 to-transparent" />
          </div>
        )}
        
        {/* Default gradient background */}
        {!imageUrl && (
          <div className="absolute inset-0 opacity-10 overflow-hidden">
            <div className="absolute top-2 right-2 w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-amber-500 blur-3xl" />
            <div className="absolute bottom-2 left-2 w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-primary-500 blur-2xl" />
          </div>
        )}
        
        <div className="relative flex items-center gap-4 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
            <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          
          <div className="flex-1">
            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-white/50 mb-2 lg:mb-3">
              {subtitle}
            </p>
            <div className="flex items-center gap-4 text-[10px] sm:text-xs lg:text-sm text-white/40">
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-3 h-3 lg:w-4 lg:h-4 text-amber-400" />
                {gameCount} {t('igara', 'games')}
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 lg:w-4 lg:h-4 text-amber-400" />
                50+ {t('nagrada', 'prizes')}
              </span>
            </div>
          </div>
          
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div ref={wrapRef as RefObject<HTMLDivElement>} className="flex flex-col lg:flex-1">
      <div className="flex items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {t('Igraj i Osvoji', 'Play and Win')}
          </h3>
        </div>
      </div>
      
      {isExternalLink ? (
        <motion.a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="block group flex-1"
        >
          {cardContent}
        </motion.a>
      ) : (
        <Link href={link} className="block group flex-1" onClick={onCta}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="h-full"
          >
            {cardContent}
          </motion.div>
        </Link>
      )}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DealsWithCarousels({ 
  blockSets, 
  editorsPicks, 
  discoveryPlaces,
  editorsPicksDisplayCount = 3,
  discoveryDisplayCount = 3
}: DealsWithCarouselsProps) {
  const { language, t } = useLanguage()
  const { content } = useContent()
  
  const gameCount = content.games?.length || 0

  // Random selection state
  const [selectedBlocks, setSelectedBlocks] = useState<BlockItem[]>([])
  const [selectedEditorsPicks, setSelectedEditorsPicks] = useState<EditorsPickItem[]>([])
  const [selectedDiscoveryPlaces, setSelectedDiscoveryPlaces] = useState<DiscoveryPlace[]>([])
  
  // Text visibility state - starts hidden, toggles every 7 seconds
  const [showText, setShowText] = useState(false)

  // Initialize random block set selection - pick random set from all available
  useEffect(() => {
    if (!blockSets || blockSets.length === 0) return
    
    // Pick a random block set from all available sets
    const randomSetIndex = Math.floor(Math.random() * blockSets.length)
    const selectedSet = blockSets[randomSetIndex]
    
    if (selectedSet?.groups && selectedSet.groups.length > 0) {
      // If selected set has groups, pick random group
      setSelectedBlocks(selectRandomGroup(selectedSet.groups))
    } else if (selectedSet?.blocks && selectedSet.blocks.length > 0) {
      // Use all blocks from the randomly selected set (up to 6)
      setSelectedBlocks(selectedSet.blocks.slice(0, 6))
    }
  }, [blockSets])

  // Initialize carousels
  useEffect(() => {
    if (editorsPicks && editorsPicks.length > 0) {
      setSelectedEditorsPicks(selectRandomItems(editorsPicks, editorsPicksDisplayCount))
    }
  }, [editorsPicks, editorsPicksDisplayCount])

  useEffect(() => {
    if (discoveryPlaces && discoveryPlaces.length > 0) {
      setSelectedDiscoveryPlaces(selectRandomItems(discoveryPlaces, discoveryDisplayCount))
    }
  }, [discoveryPlaces, discoveryDisplayCount])

  // Text visibility interval: hidden on load, show for 7s, hide for 7s, repeat
  useEffect(() => {
    const interval = setInterval(() => {
      setShowText(prev => !prev)
    }, 7000)
    
    return () => clearInterval(interval)
  }, [])

  if (!selectedBlocks.length) return null

  // Layout positions:
  // Row 1: [0] Vertical (left, spans 2 rows) | [1] Square, [2] Square (stacked on right)
  // Row 2: [3] Horizontal (full width) 
  //        [4] Square | [5] Square (side by side below horizontal)
  const verticalCard = selectedBlocks[0]
  const topRightCards = selectedBlocks.slice(1, 3)
  const horizontalCard = selectedBlocks[3]
  const bottomCards = selectedBlocks.slice(4, 6)

  // Reusable carousel renderers
  const renderExploreSarajevo = () => selectedDiscoveryPlaces.length > 0 && (
    <DraggableCarousel 
      title={t('Explore Sarajevo', 'Explore Sarajevo')} 
      icon={MapPin}
      totalItems={discoveryPlaces?.length}
      displayedItems={selectedDiscoveryPlaces.length}
      hideRandomIndicator
    >
      {selectedDiscoveryPlaces.map((place, index) => (
        <CarouselItem
          key={place.id}
          itemId={place.id}
          href={place.link}
          imageFile={place.imageFile}
          title={language === 'BA' ? place.nameBosnian : place.nameEnglish}
          subtitle={language === 'BA' ? (place.categoryBosnian || '') : (place.categoryEnglish || '')}
          index={index}
          tracking={place.tracking}
        />
      ))}
    </DraggableCarousel>
  )

  const renderSmartChoices = () => selectedEditorsPicks.length > 0 && (
    <DraggableCarousel 
      title={t('Pametno Odabrano', 'Smart Choices')} 
      icon={Sparkles}
      totalItems={editorsPicks?.length}
      displayedItems={selectedEditorsPicks.length}
    >
      {selectedEditorsPicks.map((item, index) => (
        <CarouselItem
          key={item.id}
          itemId={item.id}
          href={item.link}
          imageFile={item.imageFile}
          title={language === 'BA' ? item.titleBosnian : item.titleEnglish}
          subtitle={language === 'BA' ? (item.teaserBosnian || '') : (item.teaserEnglish || '')}
          index={index}
          tracking={item.tracking}
        />
      ))}
    </DraggableCarousel>
  )

  // Deal blocks - Group A (first 3: vertical + 2 squares)
  const renderDealsGroupA = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {verticalCard && (
          <div className="row-span-2">
            <DealBlockCard block={verticalCard} variant="vertical" index={0} showText={showText} language={language} />
          </div>
        )}
        {topRightCards.map((block, idx) => (
          <DealBlockCard key={block.id} block={block} variant="square" index={idx + 1} showText={showText} language={language} />
        ))}
      </div>
    </div>
  )

  // Deal blocks - Group B (last 3: horizontal + 2 bottom squares)
  const renderDealsGroupB = () => (
    <div className="space-y-3">
      {horizontalCard && (
        <DealBlockCard block={horizontalCard} variant="horizontal" index={3} showText={showText} language={language} />
      )}
      {bottomCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {bottomCards.map((block, idx) => (
            <DealBlockCard key={block.id} block={block} variant="square" index={idx + 4} showText={showText} language={language} />
          ))}
        </div>
      )}
    </div>
  )

  // Section header for deals
  const renderDealsHeader = () => (
    <div className="flex items-center mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">
          {t('Današnje Ponude', 'Today\'s Recommended')}
        </h3>
      </div>
    </div>
  )

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================
            MOBILE LAYOUT (< lg)
            Order: Header + Group A → Explore Sarajevo → Group B → Smart Choices → Play & Win
            ============================================================ */}
        <div className="flex flex-col gap-6 lg:hidden">
          {/* Today's Recommended Header + Group A */}
          <div>
            {renderDealsHeader()}
            {renderDealsGroupA()}
          </div>

          {/* Explore Sarajevo (between deal groups on mobile) */}
          {renderExploreSarajevo()}

          {/* Group B deals */}
          {renderDealsGroupB()}

          {/* Smart Choices */}
          {renderSmartChoices()}

          {/* Play and Win */}
          <PlayAndWinCard language={language} t={t} gameCount={gameCount} playAndWin={content.playAndWin} />
        </div>

        {/* ============================================================
            DESKTOP LAYOUT (lg+)
            Side-by-side: Left = All Deals | Right = Smart Choices → Explore Sarajevo → Play & Win
            ============================================================ */}
        <div className="hidden lg:flex lg:flex-row gap-8 lg:items-stretch">
          
          {/* LEFT SIDE - All Deals Grid */}
          <div className="w-full lg:w-1/2">
            {renderDealsHeader()}
            <div className="space-y-3">
              {renderDealsGroupA()}
              {renderDealsGroupB()}
            </div>
          </div>

          {/* RIGHT SIDE - Carousels + Play and Win */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            {renderSmartChoices()}
            {renderExploreSarajevo()}
            <PlayAndWinCard language={language} t={t} gameCount={gameCount} playAndWin={content.playAndWin} />
          </div>
        </div>
      </div>
    </section>
  )
}
