'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getThemeStyle } from '@/lib/theme'
import { saveScore } from '@/app/actions/public-actions'
import { User, Mail, Phone, Trophy, Gift, LogIn, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface QuizResultsProps {
  attempt: {
    id: string
    player_name: string
    player_email?: string | null
    account_id?: string | null
    score: number
    max_score: number
    quizPost: {
      title: string
      theme: any
      slug: string
      reward_coins?: number
      reward_xp?: number
      reward_tokens?: number
      first_time_multiplier?: number
      full_marks_multiplier?: number
      questions: Array<{
        id: string
        text: string
        order: number
        choices: Array<{
          id: string
          text: string
          is_correct: boolean
        }>
      }>
    }
    answers: Array<{
      question_id: string
      selectedChoice: {
        id: string
        text: string
        is_correct: boolean
      } | null
    }>
  }
}

export function QuizResults({ attempt }: QuizResultsProps) {
  const searchParams = useSearchParams()
  const isRepeat = searchParams.get('repeat') === 'true'
  const noReward = searchParams.get('noReward') === 'true' // Server says no more rewards
  const isGuest = searchParams.get('guest') === 'true'
  const streakMultiplier = searchParams.get('streakMultiplier') ? parseFloat(searchParams.get('streakMultiplier')!) : null
  const streakDays = searchParams.get('streakDays') ? parseInt(searchParams.get('streakDays')!) : null
  
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const themeStyle = getThemeStyle(attempt.quizPost.theme)
  const percentage = attempt.max_score > 0 
    ? Math.round((attempt.score / attempt.max_score) * 100) 
    : 0

  // Calculate rewards from quiz settings
  const base_coins = attempt.quizPost.reward_coins ?? 10
  const base_xp = attempt.quizPost.reward_xp ?? 5
  const base_tokens = attempt.quizPost.reward_tokens ?? 0
  const first_time_multiplier = Number(attempt.quizPost.first_time_multiplier ?? 5)
  const full_marks_multiplier = Number(attempt.quizPost.full_marks_multiplier ?? 2)
  
  const isPerfect = percentage === 100
  const isFirstTime = !isRepeat
  
  // Calculate actual rewards (must match central-account.ts logic!)
  let coinsEarned = base_coins
  let xpEarned = base_xp
  let tokensEarned = base_tokens
  
  if (isFirstTime) {
    coinsEarned = Math.round(base_coins * first_time_multiplier)
    xpEarned = Math.round(base_xp * first_time_multiplier)
  }
  
  if (isPerfect) {
    coinsEarned = Math.round(coinsEarned * full_marks_multiplier)
    xpEarned = Math.round(xpEarned * full_marks_multiplier)
  }
  
  // Apply daily streak multiplier
  if (streakMultiplier && streakMultiplier > 1.0) {
    coinsEarned = Math.round(coinsEarned * streakMultiplier)
    xpEarned = Math.round(xpEarned * streakMultiplier)
  }
  
  // If noReward flag (exceeded max attempts), no rewards
  if (noReward) {
    coinsEarned = 0
    xpEarned = 0
    tokensEarned = 0
  }
  
  // If guest, rewards require sign in
  const guestNoRewards = isGuest && !attempt.account_id

  const handleSaveScore = async () => {
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')
      return
    }
    
    setSaving(true)
    setError(null)
    
    try {
      const result = await saveScore(attempt.id, attempt.player_name, email)
      
      if (result.success) {
        setSaved(true)
        setShowSaveForm(false)
      } else {
        setError(result.error || 'Failed to save score')
      }
    } catch (err) {
      setError('Failed to save score. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={themeStyle}>
      <div className="min-h-screen bg-black bg-opacity-30">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Score Card */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 border border-white/40 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white drop-shadow-lg">{attempt.quizPost.title}</h1>
            <p className="text-white/80 mb-6 drop-shadow-md">Results for {attempt.player_name}</p>
            
            <div className="flex justify-center items-center gap-6 sm:gap-8 mb-6">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                  {attempt.score}
                </div>
                <div className="text-white/70 mt-1 text-sm drop-shadow-md">out of {attempt.max_score}</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                  {percentage}%
                </div>
                <div className="text-white/70 mt-1 text-sm drop-shadow-md">correct</div>
              </div>
            </div>

            {/* Rewards Earned */}
            {attempt.quizPost.slug === 'quiz-play' ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl border border-amber-400/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="w-6 h-6 text-amber-300" />
                  <span className="text-xl font-bold text-white drop-shadow-lg">You earned a reward!</span>
                </div>
                <p className="text-white/80 text-sm mb-4">Design your own personalized T-shirt for free</p>
                <a
                  href="https://print.bsc.ba/editor?model=%2Fshirt%2Fscene.gltf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg text-lg"
                >
                  🎁 Redeem Your Reward
                </a>
              </div>
            ) : noReward ? (
              <div className="mb-6 p-4 bg-blue-500/20 backdrop-blur-lg rounded-2xl border border-blue-400/50">
                <div className="text-white font-semibold mb-2 drop-shadow-md">ℹ️ Max Rewards Claimed</div>
                <div className="text-white/80 text-sm drop-shadow-md">
                  You've already earned the maximum rewards for this quiz. Keep playing to improve your score!
                </div>
              </div>
            ) : guestNoRewards ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl border border-amber-400/50">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-amber-300" />
                  <span className="text-amber-300 font-semibold">Rewards Earned:</span>
                </div>
                <div className="flex justify-center gap-4 flex-wrap mb-3">
                  <div className="text-white drop-shadow-md">
                    💰 <span className="font-bold">{coinsEarned}</span> Coins
                  </div>
                  <div className="text-white drop-shadow-md">
                    ⚡ <span className="font-bold">{xpEarned}</span> XP
                  </div>
                  {tokensEarned > 0 && (
                    <div className="text-white drop-shadow-md">
                      💎 <span className="font-bold">{tokensEarned}</span> Token{tokensEarned !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <p className="text-white/70 text-sm mb-3">Sign in to claim your rewards!</p>
                  <Link
                    href={`/auth/user-login?redirect=/${attempt.quizPost.slug}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In to Claim
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-green-400/50">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-green-300 font-semibold">🎉 Rewards Earned:</span>
                </div>
                <div className="flex justify-center gap-4 flex-wrap">
                  <div className="text-white drop-shadow-md">
                    💰 <span className="font-bold">{coinsEarned}</span> Coins
                  </div>
                  <div className="text-white drop-shadow-md">
                    ⚡ <span className="font-bold">{xpEarned}</span> XP
                  </div>
                  {tokensEarned > 0 && (
                    <div className="text-white drop-shadow-md">
                      💎 <span className="font-bold">{tokensEarned}</span> Token{tokensEarned !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                {isFirstTime && (
                  <p className="text-amber-300 text-xs mt-2">
                    ✨ First time bonus applied ({first_time_multiplier}x)
                    {isPerfect && ` + Perfect score bonus (${full_marks_multiplier}x)`}
                    {streakMultiplier && streakMultiplier > 1.0 && ` + Daily streak bonus (${streakMultiplier}x)`}
                  </p>
                )}
                {!isFirstTime && (isPerfect || (streakMultiplier && streakMultiplier > 1.0)) && (
                  <p className="text-amber-300 text-xs mt-2">
                    ✨ {isPerfect ? `Perfect score bonus (${full_marks_multiplier}x)` : ''}
                    {isPerfect && streakMultiplier && streakMultiplier > 1.0 ? ' + ' : ''}
                    {streakMultiplier && streakMultiplier > 1.0 ? `Daily streak bonus (${streakMultiplier}x)` : ''}
                  </p>
                )}
              </div>
            )}

            {/* Save Score Form for Guests */}
            {isGuest && !saved && !showSaveForm && (
              <div className="mb-4">
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition font-medium border border-white/30"
                >
                  <Trophy className="w-4 h-4" />
                  Save My Score
                </button>
              </div>
            )}

            {showSaveForm && !saved && (
              <div className="mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Save Your Score
                </h3>
                <div className="space-y-3 max-w-sm mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email *"
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                    required
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (optional)"
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                  {error && (
                    <p className="text-red-300 text-sm">{error}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSaveForm(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveScore}
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl transition font-semibold disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Score'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {saved && (
              <div className="mb-4 p-3 bg-green-500/20 backdrop-blur-lg rounded-xl border border-green-400/50">
                <p className="text-green-300 font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Score saved successfully!
                </p>
              </div>
            )}

            {/* Back to Quizzes Button */}
            <div className="mt-4">
              <a
                href="/"
                className="inline-block bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition font-medium shadow-xl border border-white/40"
              >
                ← Back to Quizzes
              </a>
            </div>
          </div>

          {/* Question Review */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 drop-shadow-lg">Review Answers</h2>
          <div className="space-y-4">
            {attempt.quizPost.questions.map((question, qIndex) => {
              const answer = attempt.answers.find(a => a.question_id === question.id)
              const correctChoice = question.choices.find(c => c.is_correct)
              const is_correct = answer?.selectedChoice?.is_correct || false

              return (
                <div key={question.id} className="bg-white/20 backdrop-blur-2xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/40">
                  <div className="flex items-start gap-3">
                    <span className={`text-xl sm:text-2xl ${is_correct ? 'text-green-400' : 'text-red-400'} drop-shadow-lg`}>
                      {is_correct ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-white drop-shadow-md">
                        {qIndex + 1}. {question.text}
                      </h3>
                      
                      <div className="space-y-2">
                        {answer?.selectedChoice && (
                          <div className={`p-3 rounded-lg ${
                            is_correct ? 'bg-green-500/20 border border-green-400/50' : 'bg-red-500/20 border border-red-400/50'
                          }`}>
                            <div className="text-xs sm:text-sm font-medium mb-1 text-white/70">Your answer:</div>
                            <div className="text-white text-sm sm:text-base">{answer.selectedChoice.text}</div>
                          </div>
                        )}
                        
                        {!is_correct && correctChoice && (
                          <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/50">
                            <div className="text-xs sm:text-sm font-medium mb-1 text-white/70">Correct answer:</div>
                            <div className="text-white text-sm sm:text-base">{correctChoice.text}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 text-center bg-white/20 backdrop-blur-2xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/40">
            <div className="flex justify-center gap-3 flex-wrap">
              <a
                href={`/${attempt.quizPost.slug}`}
                className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition font-medium shadow-lg"
              >
                Take Quiz Again
              </a>
              <a
                href="/"
                className="inline-block bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl transition font-medium border border-white/30"
              >
                All Quizzes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
