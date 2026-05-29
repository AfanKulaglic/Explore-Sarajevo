'use client'

import { motion } from 'framer-motion'
import { Star, ArrowRight, Coins, Sparkles, Gift, LogIn } from 'lucide-react'
import Link from 'next/link'
import { AVAILABLE_ICONS } from '@/components/ui/IconPicker'
import { useState } from 'react'
import { UserProfileModal } from '@/components/user/UserProfileModal'
import { UserAccountButton } from '@/components/user/UserAccountButton'
import { createSupabaseClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Footer from '@/components/layout/Footer'

interface Quiz {
  id: string
  title: string
  description: string | null
  slug: string
  icon: string | null
  gradient: string | null
}

interface QuizHomepageClientProps {
  quizzes: Quiz[]
  stats: {
    activeQuizzes: number
    playersOnline: number
    completedToday: number
  }
  user: {
    email: string
    name: string
  } | null
}

const FloatingShape = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute rounded-full bg-white/10 backdrop-blur-sm"
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      y: [-20, 20, -20],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
)

export function QuizHomepageClient({ quizzes, stats, user }: QuizHomepageClientProps) {
  const [showAll, setShowAll] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showLoginCTA, setShowLoginCTA] = useState(!user)
  const displayedQuizzes = showAll ? quizzes : quizzes.slice(0, 4)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-blue-500">
      {/* Profile Modal - only show if user is logged in */}
      {user && (
        <UserProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          email={user.email}
          name={user.name}
        />
      )}

      {/* Anonymous User Login CTA Banner */}
      {!user && showLoginCTA && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-white">
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-200" />
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <Gift className="w-4 h-4 text-green-200" />
                </div>
                <p className="text-xs sm:text-sm font-medium">
                  <span className="font-bold">Coins, XP & Rewards</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/user-login?redirect=/"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <button
                  onClick={() => setShowLoginCTA(false)}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Animated background shapes */}
      <div className="absolute top-20 left-20 w-32 h-32">
        <FloatingShape delay={0} />
      </div>
      <div className="absolute top-40 right-32 w-24 h-24">
        <FloatingShape delay={1} />
      </div>
      <div className="absolute bottom-32 left-40 w-40 h-40">
        <FloatingShape delay={3} />
      </div>
      <div className="absolute bottom-20 right-20 w-28 h-28">
        <FloatingShape delay={2.5} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pb-12">
        {/* User Action Buttons - Hide Sign In when orange banner is visible */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed ${!user && showLoginCTA ? 'top-12' : 'top-4'} right-4 z-40 transition-all duration-300`}
        >
          {user ? (
            <UserAccountButton 
              user={user} 
              onLogout={handleLogout} 
              onProfileClick={() => setShowProfile(true)}
              variant="dark"
            />
          ) : !showLoginCTA ? (
            <Link
              href="/auth/user-login?redirect=/"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl border border-white/30 hover:bg-white/30 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          ) : null}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`text-center ${!user && showLoginCTA ? 'mt-32' : 'mt-32'} mb-8 transition-all duration-300`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-4"
          >
            <Star className="w-10 h-10 text-yellow-300" fill="currentColor" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            SarayaQuizzes
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-lg"
          >
            By Saraya Solutions
          </motion.p>
        </motion.div>

        {/* Stats Section - Right after header, before quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-sm px-4 mb-8"
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              { 
                label: 'Active Quizzes', 
                value: stats.activeQuizzes >= 50 ? '50+' : (stats.activeQuizzes * 7).toString(),
              },
              { 
                label: 'Total Attempts', 
                value: stats.playersOnline >= 1000 ? `${(stats.playersOnline / 1000).toFixed(1)}K` : (stats.playersOnline * 7).toString(),
              },
              { 
                label: 'Today', 
                value: stats.completedToday >= 1000 ? `${(stats.completedToday / 1000).toFixed(1)}K` : (stats.completedToday * 7).toString(),
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center bg-white/10 backdrop-blur-md rounded-xl px-3 py-3 border border-white/20"
              >
                <div className="text-white text-xl font-bold">{stat.value}</div>
                <div className="text-white/70 text-[10px] leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quiz Cards Grid */}
        {quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/80 text-lg"
          >
            No active quizzes available at the moment
          </motion.div>
        ) : (
          <>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              {displayedQuizzes.map((quiz, index) => {
                const iconName = quiz.icon || 'Brain'
                const Icon = AVAILABLE_ICONS.find(i => i.name === iconName)?.component || AVAILABLE_ICONS[0].component
                const gradient = quiz.gradient || 'from-purple-500 to-pink-500'

                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group cursor-pointer"
                  >
                    <Link href={`/${quiz.slug}`}>
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden transition-all duration-300 hover:bg-white/15 hover:border-white/30">
                        {/* Card gradient overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                        
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} mb-6 shadow-lg`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {quiz.title}
                        </h3>
                        
                        {quiz.description && (
                          <p className="text-white/80 mb-6">
                            {quiz.description}
                          </p>
                        )}

                        {/* CTA */}
                        <div className="flex items-center text-white group-hover:gap-3 gap-2 transition-all duration-300">
                          <span className="text-white/90">Click to start</span>
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </div>

                        {/* Shine effect */}
                        <motion.div
                          className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                          animate={{
                            left: ['-100%', '200%']
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Show All Button */}
            {quizzes.length > 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-8 py-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white font-medium hover:bg-white/30 transition-all"
                >
                  {showAll ? 'Show Less' : `Show All (${quizzes.length})`}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
