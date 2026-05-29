'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Gamepad2, 
  Trophy, 
  Star, 
  Users, 
  Clock, 
  ArrowLeft,
  Zap,
  Target,
  Puzzle,
  Dice1,
  Brain,
  Sparkles,
  Heart,
  LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { LanguageProvider, useLanguage } from '@/context/LanguageContext'
import { ContentProvider, useContent } from '@/context/ContentContext'
import { GameItem } from '@/types/content'
import { LoadingSpinner } from '@/components/ui/PageLoader'

// =============================================================================
// ICON MAP - Maps icon names to Lucide components
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  Brain,
  Zap,
  Target,
  Puzzle,
  Dice1,
  Sparkles,
  Gamepad2,
  Trophy,
  Star,
  Heart,
}

// =============================================================================
// DIFFICULTY BADGE COMPONENT
// =============================================================================

function DifficultyBadge({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) {
  const { t } = useLanguage()
  
  const config = {
    easy: { 
      label: t('Lako', 'Easy'), 
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    },
    medium: { 
      label: t('Srednje', 'Medium'), 
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
    },
    hard: { 
      label: t('Teško', 'Hard'), 
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
    },
  }

  return (
    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${config[difficulty].color}`}>
      {config[difficulty].label}
    </span>
  )
}

// =============================================================================
// GAME CARD COMPONENT
// =============================================================================

interface GameCardProps {
  game: GameItem
  index: number
}

function GameCard({ game, index }: GameCardProps) {
  const { language, t } = useLanguage()
  
  // Get icon component from map, fallback to Gamepad2
  const Icon = ICON_MAP[game.icon] || Gamepad2
  
  const title = language === 'BA' ? game.titleBosnian : game.titleEnglish
  const description = language === 'BA' ? game.descriptionBosnian : game.descriptionEnglish

  // Color classes based on game color
  const colorClasses: Record<string, { icon: string; border: string; glow: string; bg: string }> = {
    violet: { 
      icon: 'text-violet-400', 
      border: 'hover:border-violet-500/50',
      glow: 'group-hover:shadow-violet-500/20',
      bg: 'from-violet-500/20 to-purple-600/10'
    },
    amber: { 
      icon: 'text-amber-400', 
      border: 'hover:border-amber-500/50',
      glow: 'group-hover:shadow-amber-500/20',
      bg: 'from-amber-500/20 to-orange-600/10'
    },
    emerald: { 
      icon: 'text-emerald-400', 
      border: 'hover:border-emerald-500/50',
      glow: 'group-hover:shadow-emerald-500/20',
      bg: 'from-emerald-500/20 to-green-600/10'
    },
    blue: { 
      icon: 'text-blue-400', 
      border: 'hover:border-blue-500/50',
      glow: 'group-hover:shadow-blue-500/20',
      bg: 'from-blue-500/20 to-cyan-600/10'
    },
    rose: { 
      icon: 'text-rose-400', 
      border: 'hover:border-rose-500/50',
      glow: 'group-hover:shadow-rose-500/20',
      bg: 'from-rose-500/20 to-pink-600/10'
    },
    cyan: { 
      icon: 'text-cyan-400', 
      border: 'hover:border-cyan-500/50',
      glow: 'group-hover:shadow-cyan-500/20',
      bg: 'from-cyan-500/20 to-teal-600/10'
    },
  }

  const colors = colorClasses[game.color] || colorClasses.violet

  const handleClick = () => {
    if (game.link && game.link !== '#') {
      window.open(game.link, '_blank')
    } else {
      alert(t(`Igra "${title}" dolazi uskoro!`, `Game "${title}" coming soon!`))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <button
        onClick={handleClick}
        className={`
          group w-full text-left relative
          p-4 sm:p-5 rounded-2xl
          bg-surface-card border border-surface-border/60
          ${colors.border}
          transition-all duration-300
          hover:-translate-y-1
          hover:shadow-xl ${colors.glow}
        `}
      >
        {/* Featured badge */}
        {game.featured && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary-500 text-[10px] font-bold text-white shadow-lg z-10">
            HOT
          </div>
        )}

        <div className="flex gap-4">
          {/* Icon or Image */}
          <div className={`
            relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl
            bg-gradient-to-br ${colors.bg}
            flex items-center justify-center
            border border-white/5
            group-hover:scale-110 transition-transform duration-300
            overflow-hidden
          `}>
            {game.imageFile ? (
              <Image 
                src={game.imageFile} 
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${colors.icon}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary-300 transition-colors">
                {title}
              </h3>
              <DifficultyBadge difficulty={game.difficulty} />
            </div>
            
            <p className="text-xs sm:text-sm text-white/50 mb-3 line-clamp-2">
              {description}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {game.players} {t('igrača', 'players')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                2-5 min
              </span>
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  )
}

// =============================================================================
// GAMES PAGE CONTENT
// =============================================================================

function GamesPageContent() {
  const { t } = useLanguage()
  const { content, isLoading } = useContent()
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  // Get games from content
  const games = content.games || []

  const filteredGames = filter === 'all' 
    ? games 
    : games.filter(game => game.difficulty === filter)

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-sm text-white/40">Loading games...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-surface-border/50 bg-surface-dark/90 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <Link 
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">
                {t('Nazad', 'Back')}
              </span>
            </Link>

            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {t('Igraj i Osvoji', 'Play & Win')}
              </h1>
            </div>

            {/* Placeholder for balance */}
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden py-8 sm:py-12">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-amber-500/10 rounded-full blur-[100px]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">
                {t('Osvoji nagrade dok čekaš', 'Win prizes while you wait')}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
              {t('Izaberi Igru', 'Choose a Game')}
            </h2>
            
            <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto">
              {t(
                'Igraj zabavne igre i osvoji popuste, bodove i nagrade od naših partnera.',
                'Play fun games and win discounts, points, and prizes from our partners.'
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { value: 'all', label: t('Sve igre', 'All Games') },
            { value: 'easy', label: t('Lako', 'Easy') },
            { value: 'medium', label: t('Srednje', 'Medium') },
            { value: 'hard', label: t('Teško', 'Hard') },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${filter === tab.value
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-surface-elevated/50 text-white/60 hover:text-white hover:bg-surface-elevated'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Games grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredGames.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>

        {/* Empty state */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">
              {games.length === 0 
                ? t('Nema dostupnih igara', 'No games available')
                : t('Nema igara u ovoj kategoriji', 'No games in this category')
              }
            </p>
          </div>
        )}
      </section>

      {/* Stats bar */}
      {games.length > 0 && (
        <section className="border-t border-surface-border/50 bg-surface-card/30 py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex justify-center items-center gap-8 sm:gap-12">
              {[
                { icon: Gamepad2, value: games.length.toString(), label: t('Igara', 'Games') },
                { icon: Trophy, value: '50+', label: t('Nagrada', 'Prizes') },
                { icon: Star, value: '4.8', label: t('Ocjena', 'Rating') },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <stat.icon className="w-4 h-4 text-amber-400" />
                    <span className="text-xl sm:text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-white/40 uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

// =============================================================================
// MAIN PAGE EXPORT
// =============================================================================

export default function GamesPage() {
  return (
    <ContentProvider>
      <LanguageProvider>
        <GamesPageContent />
      </LanguageProvider>
    </ContentProvider>
  )
}
