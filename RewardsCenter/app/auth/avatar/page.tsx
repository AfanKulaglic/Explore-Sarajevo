'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Shuffle, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Palette,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  CircleDot
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import {
  avatarStyles,
  AvatarStyleKey,
  AvatarConfig,
  defaultAvatarConfig,
  backgroundColors,
  generateAvatar,
  generateRandomSeed,
} from '@/lib/avatar'

const categories = ['Characters', 'Robots', 'Pixel', 'Fun', 'Abstract'] as const

// Fixed seed for initial SSR render to avoid hydration mismatch
const INITIAL_SEED = 'default-avatar-seed'

export default function AvatarCreationPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<AvatarConfig>({
    ...defaultAvatarConfig,
    seed: INITIAL_SEED,
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('Characters')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'style' | 'customize'>('style')

  // Set mounted and generate random seed on client only
  useEffect(() => {
    setMounted(true)
    setConfig(prev => ({
      ...prev,
      seed: generateRandomSeed(),
    }))
  }, [])

  // Get styles for current category
  const categoryStyles = useMemo(() => {
    return Object.entries(avatarStyles)
      .filter(([_, info]) => info.category === selectedCategory)
      .map(([key, info]) => ({ key: key as AvatarStyleKey, ...info }))
  }, [selectedCategory])

  // Generate avatar preview
  const avatarPreview = useMemo(() => {
    return generateAvatar(config)
  }, [config])

  // Randomize everything
  const randomize = () => {
    const styleKeys = Object.keys(avatarStyles) as AvatarStyleKey[]
    const randomStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)]
    const randomBg = backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
    
    setConfig({
      ...config,
      style: randomStyle,
      seed: generateRandomSeed(),
      backgroundColor: randomBg.value,
      flip: Math.random() > 0.5,
      rotate: Math.floor(Math.random() * 4) * 90,
    })
    
    // Update category to match
    const styleCategory = avatarStyles[randomStyle].category
    setSelectedCategory(styleCategory)
  }

  // Randomize seed only
  const randomizeSeed = () => {
    setConfig({ ...config, seed: generateRandomSeed() })
  }

  // Check if user already has an avatar
  const hasExistingAvatar = user?.avatarUrl && !user.avatarUrl.includes('dicebear.com/7.x/initials')

  // Skip avatar creation or go back
  const skipOrGoBack = () => {
    if (hasExistingAvatar) {
      router.back()
    } else {
      // Mark as skipped so we don't prompt again
      if (user) {
        localStorage.setItem('saraya_avatar_skipped', user.id)
      }
      router.push('/rewards/catalog')
    }
  }

  // Save avatar
  const saveAvatar = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const avatarDataUri = generateAvatar(config)
      
      // Always save avatar locally first
      const userKey = 'saraya_rewards_user'
      const storedUser = localStorage.getItem(userKey)
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        userData.avatarUrl = avatarDataUri
        userData.hasAvatar = true  // Mark as having avatar
        localStorage.setItem(userKey, JSON.stringify(userData))
      }
      
      // Clear the skipped flag since user is now setting an avatar
      localStorage.removeItem('saraya_avatar_skipped')

      // Try to save to Account System via admin API (using email)
      try {
        await fetch('/api/auth/avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            avatarUrl: avatarDataUri,
            avatarConfig: config,
            email: user.email // Include email for admin API
          })
        })
      } catch (apiError) {
        console.error('Error syncing avatar to API:', apiError)
        // Continue anyway - avatar is saved locally
      }
      
      // Refresh user state and navigate
      await refreshUser()
      router.push('/rewards/catalog')
    } catch (error) {
      console.error('Error saving avatar:', error)
      alert('Failed to save avatar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white truncate">Create Your Avatar</h1>
              <p className="text-xs sm:text-sm text-white/60 hidden sm:block">Personalize your profile with a unique avatar</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={skipOrGoBack}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-colors text-xs sm:text-sm"
              >
                {hasExistingAvatar ? 'Back' : 'Skip'}
              </button>
              <button
                onClick={saveAvatar}
                disabled={saving}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-500 transition-colors disabled:opacity-50 text-xs sm:text-sm"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <Check size={14} className="sm:hidden" />
                )}
                {saving ? null : <Check size={18} className="hidden sm:block" />}
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-white">Preview</h2>
                <button
                  onClick={randomize}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-brand-600/20 text-brand-400 text-xs sm:text-sm font-medium hover:bg-brand-600/30 transition-colors"
                >
                  <Sparkles size={14} className="sm:hidden" />
                  <Sparkles size={16} className="hidden sm:block" />
                  Randomize
                </button>
              </div>
              
              {/* Avatar Display */}
              <div className="relative mx-auto w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 mb-10 sm:mb-12">
                <motion.div
                  key={mounted ? avatarPreview : 'loading'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-800"
                >
                  {mounted && (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
                
                {/* Shuffle button */}
                <button
                  onClick={randomizeSeed}
                  className="absolute -bottom-8 sm:-bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-800 border border-white/10 text-white text-xs sm:text-sm font-medium hover:bg-slate-700 transition-colors shadow-lg whitespace-nowrap"
                >
                  <Shuffle size={14} className="sm:hidden" />
                  <Shuffle size={16} className="hidden sm:block" />
                  New Look
                </button>
              </div>

              {/* Current style info */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-white/60 text-xs sm:text-sm">Style</p>
                <p className="text-white font-medium text-sm sm:text-base">{avatarStyles[config.style].name}</p>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="space-y-4 sm:space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 p-1 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'style' 
                    ? 'bg-brand-600 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Choose Style
              </button>
              <button
                onClick={() => setActiveTab('customize')}
                className={`flex-1 py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'customize' 
                    ? 'bg-brand-600 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Customize
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'style' ? (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Category selector */}
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                          selectedCategory === cat
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Style grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
                    {categoryStyles.map(({ key, name }) => {
                      const previewConfig = { ...config, style: key }
                      const preview = mounted ? generateAvatar(previewConfig) : ''
                      
                      return (
                        <button
                          key={key}
                          onClick={() => setConfig({ ...config, style: key })}
                          className={`relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${
                            config.style === key
                              ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="aspect-square rounded-md sm:rounded-lg overflow-hidden mb-1.5 sm:mb-2 bg-slate-800">
                            {mounted && (
                              <img 
                                src={preview} 
                                alt={name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-white/80 truncate">{name}</p>
                          {config.style === key && (
                            <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-brand-500 flex items-center justify-center">
                              <Check size={10} className="text-white sm:hidden" />
                              <Check size={12} className="text-white hidden sm:block" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="customize"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Background Color */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette size={18} className="text-white/60" />
                      <h3 className="text-sm font-medium text-white">Background Color</h3>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {backgroundColors.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setConfig({ ...config, backgroundColor: color.value })}
                          className={`relative aspect-square rounded-lg transition-all ${
                            config.backgroundColor === color.value
                              ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-900'
                              : 'hover:scale-105'
                          }`}
                          style={{ 
                            backgroundColor: color.value === 'transparent' ? 'transparent' : `#${color.value}`,
                            backgroundImage: color.value === 'transparent' 
                              ? 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)'
                              : undefined,
                            backgroundSize: '8px 8px',
                            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                          }}
                          title={color.name}
                        >
                          {config.backgroundColor === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={16} className="text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flip */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlipHorizontal size={18} className="text-white/60" />
                        <h3 className="text-sm font-medium text-white">Flip Horizontal</h3>
                      </div>
                      <button
                        onClick={() => setConfig({ ...config, flip: !config.flip })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          config.flip ? 'bg-brand-600' : 'bg-white/20'
                        }`}
                      >
                        <div 
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            config.flip ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Rotation */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <RotateCw size={18} className="text-white/60" />
                      <h3 className="text-sm font-medium text-white">Rotation</h3>
                    </div>
                    <div className="flex gap-2">
                      {[0, 90, 180, 270].map(deg => (
                        <button
                          key={deg}
                          onClick={() => setConfig({ ...config, rotate: deg })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            config.rotate === deg
                              ? 'bg-brand-600 text-white'
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scale */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ZoomIn size={18} className="text-white/60" />
                      <h3 className="text-sm font-medium text-white">Scale: {config.scale}%</h3>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={config.scale}
                      onChange={(e) => setConfig({ ...config, scale: parseInt(e.target.value) })}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  {/* Border Radius */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CircleDot size={18} className="text-white/60" />
                      <h3 className="text-sm font-medium text-white">Corner Radius: {config.radius}%</h3>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={config.radius}
                      onChange={(e) => setConfig({ ...config, radius: parseInt(e.target.value) })}
                      className="w-full accent-brand-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
