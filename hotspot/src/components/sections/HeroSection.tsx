'use client'

import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { HeroVideo, HeroBanner } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Globe, Wifi, ArrowRight, Activity, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState, useCallback, type RefObject } from 'react'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'
import { captureEvent } from '@/lib/analytics/capture'
import { useImpressionOnce } from '@/lib/analytics/use-impression-once'

function deviceBucket(): string {
  if (typeof window === 'undefined') return 'unknown'
  const w = window.innerWidth
  if (w < 640) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

// =============================================================================
// HERO SECTION PROPS & UTILITIES
// =============================================================================

interface HeroSectionProps {
  video?: HeroVideo           // Single video (backward compatibility)
  videos?: HeroVideo[]        // Pool of hero videos: one is chosen at random on each full page load
  banner?: HeroBanner         // Single banner (backward compatibility)
  banners?: HeroBanner[]      // Pool of hero banners: one is chosen at random on each full page load
}

/** One random hero video per visit (reload picks again). */
function selectRandomVideo(videos: HeroVideo[]): HeroVideo | undefined {
  if (!videos || videos.length === 0) return undefined
  if (videos.length === 1) return videos[0]
  const randomIndex = Math.floor(Math.random() * videos.length)
  return videos[randomIndex]
}

/** One random hero banner per visit (reload picks again). */
function selectRandomBanner(banners: HeroBanner[]): HeroBanner | undefined {
  if (!banners || banners.length === 0) return undefined
  if (banners.length === 1) return banners[0]
  const randomIndex = Math.floor(Math.random() * banners.length)
  return banners[randomIndex]
}

// =============================================================================
// HERO SECTION COMPONENT
// =============================================================================

/**
 * Hero Section Component
 *
 * Layout specifications:
 * - Video: 16:9 aspect ratio
 * - Banner: 10:16 aspect ratio (portrait)
 * - Desktop: Side-by-side with matched heights
 * - Mobile: Stacked with reduced banner height
 * - Banner text placed BELOW the image
 * 
 * Features:
 * - Supports multiple videos with per-video content
 * - On each full page load, picks one random video from the pool (not all at once)
 * - Same for banners: one random banner per load
 * - Backward compatible with single video/banner props
 */
export function HeroSection({ video, videos, banner, banners }: HeroSectionProps) {
  const { language, setLanguage, t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressSent = useRef<Set<number>>(new Set())
  const startedSent = useRef(false)

  const [selectedVideo, setSelectedVideo] = useState<HeroVideo | undefined>(video)

  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | undefined>(banner)

  // State for overlay visibility animation (7s hidden, 7s visible cycle)
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (videos && videos.length > 0) {
      setSelectedVideo(selectRandomVideo(videos))
    } else if (video) {
      setSelectedVideo(video)
    }
  }, [videos, video])

  useEffect(() => {
    progressSent.current = new Set()
    startedSent.current = false
  }, [selectedVideo?.id])

  useEffect(() => {
    if (banners && banners.length > 0) {
      setSelectedBanner(selectRandomBanner(banners))
    } else if (banner) {
      setSelectedBanner(banner)
    }
  }, [banners, banner])

  const videoImpressionRef = useImpressionOnce(
    useCallback(() => {
      const tr = selectedVideo?.tracking
      if (!tr) return
      captureEvent(
        ANALYTICS_EVENTS.hero_video_viewed,
        { device: deviceBucket() },
        tr
      )
    }, [selectedVideo?.tracking]),
    { threshold: 0.4, resetKey: selectedVideo?.id }
  )

  const bannerImpressionRef = useImpressionOnce(
    useCallback(() => {
      const tr = selectedBanner?.tracking
      if (!tr) return
      captureEvent(
        ANALYTICS_EVENTS.hero_banner_viewed,
        { device: deviceBucket() },
        tr
      )
    }, [selectedBanner?.tracking]),
    { threshold: 0.4, resetKey: selectedBanner?.id }
  )

  const onVideoTimeUpdate = useCallback(() => {
    const vid = videoRef.current
    const tr = selectedVideo?.tracking
    if (!vid || !tr || !vid.duration || Number.isNaN(vid.duration)) return
    const ratio = vid.currentTime / vid.duration
    if (!startedSent.current && vid.currentTime > 0.5) {
      startedSent.current = true
      captureEvent(ANALYTICS_EVENTS.hero_video_started, { device: deviceBucket() }, tr)
    }
    for (const milestone of [0.25, 0.5, 0.75] as const) {
      if (ratio >= milestone && !progressSent.current.has(milestone)) {
        progressSent.current.add(milestone)
        captureEvent(
          ANALYTICS_EVENTS.hero_video_progress,
          { milestone_pct: Math.round(milestone * 100), device: deviceBucket() },
          tr
        )
      }
    }
    if (ratio >= 0.97 && !progressSent.current.has(1)) {
      progressSent.current.add(1)
      captureEvent(ANALYTICS_EVENTS.hero_video_completed, { device: deviceBucket() }, tr)
      captureEvent(
        ANALYTICS_EVENTS.hero_video_progress,
        { milestone_pct: 100, device: deviceBucket() },
        tr
      )
    }
  }, [selectedVideo?.tracking])

  // Auto-play video when selected video changes
  useEffect(() => {
    if (videoRef.current && selectedVideo?.videoFile) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {
        // Autoplay prevented - silent fail
      })
    }
  }, [selectedVideo?.videoFile])

  // Overlay visibility cycle: hidden for 7s on load, then 7s visible, 7s hidden, repeat
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Start hidden, show after 7 seconds
    const initialTimeout = setTimeout(() => {
      setShowOverlay(true)
      
      // After first show, start the continuous toggle interval
      intervalRef.current = setInterval(() => {
        setShowOverlay(prev => !prev)
      }, 7000)
    }, 7000)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-surface-dark">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-purple-glow opacity-20 blur-3xl" />

      {/* Header bar */}
      <div className="relative z-20 border-b border-surface-border/30 bg-surface-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Wifi className="w-5 h-5 ml-2 sm:w-6 sm:h-6 text-primary" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Saraya Connect
                </h1>
                <p className="text-[10px] sm:text-xs text-emerald-400 font-medium">
                  ● {t('Povezani', 'Connected')}
                </p>
              </div>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'BA' ? 'EN' : 'BA')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-elevated/90 border border-surface-border/50 hover:border-primary-500/50 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-xs font-semibold text-white">{language}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 lg:py-6">
        {/* Main layout container */}
        <div className="flex flex-col gap-3 sm:gap-5 lg:grid lg:grid-cols-[minmax(0,16fr)_minmax(0,12fr)] lg:items-start">
          
          {/* ============================================================
              VIDEO SECTION - 16:9 aspect ratio
              Content overlay at bottom with animated visibility
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-w-0"
          >
            {/* Video container with overlay - entire container is clickable */}
            <div 
              ref={videoImpressionRef as RefObject<HTMLDivElement>}
              className="relative w-full rounded-2xl overflow-hidden bg-surface-card border border-surface-border/50 shadow-xl shadow-black/20 aspect-video cursor-pointer group"
              onClick={() => {
                const link = selectedVideo?.buttonLink
                if (selectedVideo?.tracking) {
                  captureEvent(
                    ANALYTICS_EVENTS.hero_video_clicked,
                    { device: deviceBucket(), target: 'container' },
                    selectedVideo.tracking
                  )
                }
                if (link) {
                  if (link.startsWith('#')) {
                    const element = document.querySelector(link)
                    element?.scrollIntoView({ behavior: 'smooth' })
                  } else if (link.startsWith('http://') || link.startsWith('https://')) {
                    window.open(link, '_blank', 'noopener,noreferrer')
                  } else {
                    window.location.href = link
                  }
                }
              }}
            >
              {/* Video */}
              {selectedVideo?.videoFile && (
                <video
                  ref={videoRef}
                  key={selectedVideo.videoFile}
                  poster={selectedVideo.thumbnail}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onTimeUpdate={onVideoTimeUpdate}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                >
                  <source src={selectedVideo.videoFile} type="video/mp4" />
                </video>
              )}

              {/* Hover overlay for video */}
              <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-colors duration-300 pointer-events-none" />

              {/* Fallback thumbnail */}
              {!selectedVideo?.videoFile && selectedVideo?.thumbnail && (
                <Image
                  src={selectedVideo.thumbnail}
                  alt="Hero"
                  fill
                  className="object-cover"
                />
              )}

              {/* Bottom gradient overlay - animated */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showOverlay ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-0 bottom-0 h-24 sm:h-28 lg:h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              />

              {/* Content overlay at bottom - animated */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: showOverlay ? 1 : 0, 
                  y: showOverlay ? 0 : 10 
                }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-0 bottom-0 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-5 max-[430px]:px-2 max-[430px]:py-2 flex items-center justify-between gap-3 max-[430px]:gap-2"
              >
                {/* Title */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm sm:text-base lg:text-2xl max-[430px]:text-xs font-bold text-white leading-tight line-clamp-1 lg:line-clamp-2 drop-shadow-lg">
                    {selectedVideo
                      ? language === 'BA'
                        ? selectedVideo.titleBosnian
                        : selectedVideo.titleEnglish
                      : t('POVEŽI SE I ISTRAŽI PONUDE', 'CONNECT AND EXPLORE OFFERS')}
                  </h2>
                  <p className="hidden lg:block mt-2 max-w-2xl text-sm text-white/70 leading-relaxed line-clamp-2">
                    {selectedVideo
                      ? language === 'BA'
                        ? selectedVideo.subtitleBosnian || t('Najbolje gradske ponude, preporuke i doživljaji na jednom mjestu.', 'The best city offers, recommendations, and experiences in one place.')
                        : selectedVideo.subtitleEnglish || t('Najbolje gradske ponude, preporuke i doživljaji na jednom mjestu.', 'The best city offers, recommendations, and experiences in one place.')
                      : t('Otvorite pažljivo odabrane ponude, gradske preporuke i sve što vam treba dok ste povezani.', 'Open curated offers, city recommendations, and everything you need while connected.')}
                  </p>
                </div>

                {/* CTA Button */}
                <Button 
                  size="sm" 
                  className="gap-1 text-xs lg:text-sm max-[430px]:text-[11px] px-2.5 py-1 lg:px-4 lg:py-2 max-[430px]:px-2 max-[430px]:py-0.5 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering container click
                    if (selectedVideo?.tracking) {
                      captureEvent(
                        ANALYTICS_EVENTS.hero_video_clicked,
                        { device: deviceBucket(), target: 'cta' },
                        selectedVideo.tracking
                      )
                    }
                    const link = selectedVideo?.buttonLink
                    if (link) {
                      if (link.startsWith('#')) {
                        // Scroll to section
                        const element = document.querySelector(link)
                        element?.scrollIntoView({ behavior: 'smooth' })
                      } else if (link.startsWith('http://') || link.startsWith('https://')) {
                        // Navigate to external URL
                        window.open(link, '_blank', 'noopener,noreferrer')
                      } else {
                        // Internal link
                        window.location.href = link
                      }
                    }
                  }}
                >
                  {selectedVideo
                    ? language === 'BA'
                      ? selectedVideo.buttonTextBosnian
                      : selectedVideo.buttonTextEnglish
                    : t('ISTRAŽI', 'EXPLORE')}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* ============================================================
              BANNER SECTION - Portrait aspect ratio
              Content overlay at bottom with animated visibility
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full min-w-0"
          >
            {/* Banner container with overlay - entire container is clickable */}
            <div
              ref={bannerImpressionRef as RefObject<HTMLDivElement>}
              className="relative rounded-2xl overflow-hidden bg-surface-card border border-surface-border/50 shadow-xl shadow-black/20 cursor-pointer group
                         w-full aspect-[4/3]
                         lg:w-full"
              onClick={() => {
                if (selectedBanner?.tracking) {
                  captureEvent(
                    ANALYTICS_EVENTS.hero_banner_clicked,
                    { device: deviceBucket(), target: 'container' },
                    selectedBanner.tracking
                  )
                }
                const link = selectedBanner?.buttonLink
                if (link) {
                  if (link.startsWith('#')) {
                    const element = document.querySelector(link)
                    element?.scrollIntoView({ behavior: 'smooth' })
                  } else if (link.startsWith('http://') || link.startsWith('https://')) {
                    window.open(link, '_blank', 'noopener,noreferrer')
                  } else {
                    window.location.href = link
                  }
                }
              }}
            >
              {/* Image */}
              {selectedBanner?.imageFile && (
                <Image
                  src={selectedBanner.imageFile}
                  alt="Banner"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/10 transition-colors duration-300" />

              {/* Bottom gradient overlay - animated */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showOverlay ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-0 bottom-0 h-24 sm:h-28 lg:h-36 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              />

              {/* Content overlay at bottom - animated */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: showOverlay ? 1 : 0, 
                  y: showOverlay ? 0 : 10 
                }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-0 bottom-0 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5 lg:py-4 max-[430px]:px-2 max-[430px]:py-2 flex items-center justify-between gap-2"
              >
                {/* Left: Title + Subtitle */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base lg:text-xl max-[430px]:text-xs font-bold text-white leading-snug line-clamp-1 lg:line-clamp-2 drop-shadow-lg">
                    {selectedBanner
                      ? language === 'BA'
                        ? selectedBanner.titleBosnian
                        : selectedBanner.titleEnglish
                      : t('Specijalna ponuda dana', 'Special offer of the day')}
                  </h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm max-[430px]:hidden text-white/80 leading-tight lg:leading-relaxed line-clamp-1 lg:line-clamp-2 drop-shadow">
                    {selectedBanner
                      ? language === 'BA'
                        ? selectedBanner.subtitleBosnian
                        : selectedBanner.subtitleEnglish
                      : t('Ekskluzivne ponude samo za vas', 'Exclusive offers just for you')}
                  </p>
                </div>

                {/* Right: Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1 text-xs lg:text-sm max-[430px]:text-[11px] font-medium hover:bg-primary-600 hover:border-primary-600 transition-all px-2.5 py-1 lg:px-4 lg:py-2 max-[430px]:px-2 max-[430px]:py-0.5 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering container click
                    if (selectedBanner?.tracking) {
                      captureEvent(
                        ANALYTICS_EVENTS.hero_banner_clicked,
                        { device: deviceBucket(), target: 'cta' },
                        selectedBanner.tracking
                      )
                    }
                    const link = selectedBanner?.buttonLink
                    if (link) {
                      if (link.startsWith('#')) {
                        const element = document.querySelector(link)
                        element?.scrollIntoView({ behavior: 'smooth' })
                      } else if (link.startsWith('http://') || link.startsWith('https://')) {
                        window.open(link, '_blank', 'noopener,noreferrer')
                      } else {
                        window.location.href = link
                      }
                    }
                  }}
                >
                  {selectedBanner
                    ? language === 'BA'
                      ? selectedBanner.buttonTextBosnian
                      : selectedBanner.buttonTextEnglish
                    : t('POGLEDAJ', 'VIEW')}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Hotspot Stats Section */}
        <HotspotStatsBar />
      </div>
    </section>
  )
}

// =============================================================================
// HOTSPOT STATS BAR COMPONENT
// =============================================================================

/**
 * Dynamic stats bar showing real-time Hotspot portal statistics
 * Numbers simulate user activity with periodic updates
 */
function HotspotStatsBar() {
  const { t } = useLanguage()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="mt-3 sm:mt-5 pt-3 sm:pt-5 border-t border-surface-border/30">
        <div className="h-12 animate-pulse bg-white/5 rounded-xl" />
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mt-2 sm:mt-4 pt-2 sm:pt-4 max-[430px]:mt-1.5 max-[430px]:pt-1.5 border-t border-surface-border/30"
    >
      {/* Section Header */}
      <div className="flex items-center justify-center gap-2 max-[430px]:gap-1.5">
        <Activity className="w-3.5 h-3.5 max-[430px]:w-3 max-[430px]:h-3 text-emerald-400" />
        <span className="text-[10px] sm:text-xs max-[430px]:text-[9px] font-medium text-white/60">
          {t('Saraya Connect Status - Uživo', 'Saraya Connect Status - Live')}
        </span>
        <span className="relative flex h-1.5 w-1.5 ml-1 max-[430px]:ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      </div>

      {/* Scroll indicator - clickable */}
      <div className="flex items-center justify-center gap-2 max-[430px]:mt-1">
      <motion.button 
        onClick={() => {
          // Find the next section after HeroSection and scroll to it
          const heroSection = document.querySelector('section')
          const nextSection = heroSection?.nextElementSibling
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }}
        className="flex flex-col items-center mt-1.5 max-[430px]:mt-0 cursor-pointer hover:opacity-80 transition-opacity"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        
        <span className="text-[10px] max-[430px]:text-[9px] text-white/40 mb-0.5 max-[430px]:mb-0">
          {t('Skrolaj za više', 'Scroll for more')}
        </span>
        
        <ChevronDown className="w-4 h-4 max-[430px]:w-3.5 max-[430px]:h-3.5 text-white/40" />
      </motion.button>
      </div>
    </motion.div>
    
  )
}
