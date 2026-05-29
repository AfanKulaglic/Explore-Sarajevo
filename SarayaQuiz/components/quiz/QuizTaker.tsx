'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { getThemeStyle } from '@/lib/theme'
import { startQuiz, submitQuiz } from '@/app/actions/public-actions'
import { getDeviceIdSync } from '@/lib/device'
import { refreshSarayaAccount } from '@/lib/saraya-account'
import { Gift, User, Star, Sparkles, Clock } from 'lucide-react'
import Link from 'next/link'

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface QuizTakerProps {
  quiz: {
    id: string
    slug: string
    title: string
    description: string | null
    theme: any
    allow_anonymous?: boolean
    requires_account?: boolean
    reward_coins?: number
    reward_xp?: number
    reward_tokens?: number
    first_time_multiplier?: number
    questions: Array<{
      id: string
      text: string
      order: number
      choices: Array<{
        id: string
        text: string
        order: number
      }>
    }>
  }
  user: {
    name: string
    email: string
    account_id?: string
  } | null
}

export function QuizTaker({ quiz, user }: QuizTakerProps) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [attempt_id, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [playAsGuest, setPlayAsGuest] = useState(false)
  const startTimeRef = useRef<number>(0)

  // Shuffle questions and their choices once when component mounts
  const shuffledQuestions = useMemo(() => {
    // Shuffle the questions order
    const shuffledQ = shuffleArray(quiz.questions)
    // Shuffle choices within each question
    return shuffledQ.map(question => ({
      ...question,
      choices: shuffleArray(question.choices)
    }))
  }, [quiz.questions])

  const themeStyle = getThemeStyle(quiz.theme)
  const allow_anonymous = quiz.allow_anonymous !== false // Default true
  const requires_account = quiz.requires_account === true // Default false
  
  // Reward display values
  const base_coins = quiz.reward_coins ?? 10
  const base_xp = quiz.reward_xp ?? 5
  const base_tokens = quiz.reward_tokens ?? 0
  const multiplier = quiz.first_time_multiplier ?? 5

  // Redirect to login if requires account and not logged in
  useEffect(() => {
    if (requires_account && !user) {
      router.push(`/auth/user-login?redirect=/${quiz.slug}`)
    }
  }, [user, router, quiz.slug, requires_account])

  // Helper to detect browser/platform info
  const getDeviceMetadata = () => {
    if (typeof window === 'undefined') return undefined
    
    const ua = navigator.userAgent
    let browser = 'Unknown'
    let platform = 'Unknown'
    let os = 'Unknown'
    
    // Detect browser (order matters - check specific first)
    if (ua.includes('Firefox/')) browser = 'Firefox'
    else if (ua.includes('Edg/')) browser = 'Edge'
    else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera'
    else if (ua.includes('Brave/')) browser = 'Brave'
    else if (ua.includes('SamsungBrowser/')) browser = 'Samsung'
    else if (ua.includes('Chrome/') && !ua.includes('Chromium/')) browser = 'Chrome'
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari'
    else if (ua.includes('Chromium/')) browser = 'Chromium'
    
    // Detect OS (check Android/iOS before generic Linux/Mac)
    if (ua.includes('Android')) os = 'Android'
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
    else if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac')) os = 'macOS'
    else if (ua.includes('CrOS')) os = 'ChromeOS'
    else if (ua.includes('Linux')) os = 'Linux'
    
    // Detect platform based on OS and UA hints
    if (os === 'Android' || os === 'iOS') {
      platform = /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Mobile'
    } else if (/Mobi/i.test(ua)) {
      platform = 'Mobile'
    } else {
      platform = 'Desktop'
    }
    
    return { user_agent: ua, browser, platform, os }
  }

  const handleStart = async () => {
    const player_name = user?.name || guestName || 'Guest'
    const player_email = user?.email || null
    const deviceId = getDeviceIdSync()
    
    if (!deviceId) {
      alert('Could not identify device')
      return
    }

    if (!user && !guestName.trim()) {
      alert('Please enter your name to play')
      return
    }

    setSubmitting(true)
    startTimeRef.current = Date.now()
    
    try {
      const deviceMetadata = getDeviceMetadata()
      const result = await startQuiz(quiz.slug, player_name, deviceId, deviceMetadata, player_email)
      
      if (result.success && result.attempt_id) {
        setAttemptId(result.attempt_id)
        setStarted(true)
      } else {
        alert(result.error || 'Failed to start quiz')
      }
    } catch (error) {
      console.error('Start error:', error)
      alert('Failed to start quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswerChange = (question_id: string, choice_id: string) => {
    setAnswers(prev => ({ ...prev, [question_id]: choice_id }))
  }

  const handleSubmit = async () => {
    // Check all questions answered
    const unanswered = shuffledQuestions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`)
      return
    }

    if (!attempt_id) {
      alert('Invalid attempt')
      return
    }

    setSubmitting(true)
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
    
    try {
      const answersArray = Object.entries(answers).map(([question_id, choice_id]) => ({
        question_id,
        choice_id,
      }))

      const result = await submitQuiz(attempt_id, quiz.slug, answersArray, timeSpent)
      
      if (result.success) {
        // Refresh account data to get updated coins/XP/tokens
        if (result.isEligibleForRewards) {
          await refreshSarayaAccount()
        }
        
        // Pass along flags via URL params
        const params = new URLSearchParams()
        if (result.attemptNumber && result.attemptNumber > 1) params.set('repeat', 'true')
        if (!result.isEligibleForRewards) params.set('noReward', 'true')
        if (!user) params.set('guest', 'true')
        if (result.streakMultiplier) params.set('streakMultiplier', result.streakMultiplier.toString())
        if (result.streakDays) params.set('streakDays', result.streakDays.toString())
        
        const url = `/${quiz.slug}/results/${result.attempt_id}${params.toString() ? '?' + params.toString() : ''}`
        router.push(url)
      } else {
        alert(result.error || 'Failed to submit quiz')
        setSubmitting(false)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to submit quiz')
      setSubmitting(false)
    }
  }

  // Loading state while checking auth for required-account quizzes
  if (requires_account && !user) {
    return (
      <div className="min-h-screen" style={themeStyle}>
        <div className="min-h-screen bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/40">
            <h1 className="text-3xl font-bold mb-4 text-center text-white drop-shadow-lg">Loading...</h1>
            <p className="text-white text-center drop-shadow-md">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  // Pre-quiz start screen
  if (!started) {
    return (
      <div className="min-h-screen" style={themeStyle}>
        <div className="min-h-screen bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/40">
            <h1 className="text-3xl font-bold mb-4 text-center text-white drop-shadow-lg">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-white mb-6 text-center drop-shadow-md">{quiz.description}</p>
            )}
            
            {/* Reward Preview */}
            {quiz.slug !== 'quiz-play' && (
            <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-amber-300" />
                <span className="text-amber-300 font-semibold">Rewards Preview</span>
              </div>
              <div className="flex justify-center gap-4 sm:gap-6 text-center">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-amber-300">{base_coins}</p>
                  <p className="text-xs text-white/70">Coins</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-300">{base_xp}</p>
                  <p className="text-xs text-white/70">XP</p>
                </div>
                {base_tokens > 0 && (
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-pink-300">{base_tokens}</p>
                    <p className="text-xs text-white/70">Tokens</p>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full px-3 py-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-300 font-semibold text-sm">
                    First time: {multiplier}x bonus!
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* User Status / Guest Name Input */}
            {user ? (
              <div className="mb-6 text-center bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <User className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-sm">Playing as</span>
                </div>
                <p className="text-xl font-bold text-white drop-shadow-lg">{user.name}</p>
                <p className="text-xs text-white/60 mt-1">Rewards will be added to your account</p>
              </div>
            ) : allow_anonymous ? (
              <div className="mb-6 space-y-3">
                <Link
                  href={`/auth/user-login?redirect=/${quiz.slug}`}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3 px-4 rounded-xl transition"
                >
                  <User className="w-5 h-5" />
                  {quiz.slug === 'quiz-play' ? 'Sign In' : 'Sign In to Earn Rewards'}
                </Link>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  maxLength={50}
                />
              </div>
            ) : null}

            <Button 
              onClick={handleStart} 
              disabled={submitting || (!user && !guestName.trim())} 
              className="w-full" 
              size="lg"
            >
              {submitting ? 'Starting...' : 'Start Quiz'}
            </Button>
            
            <div className="flex items-center justify-center gap-4 mt-4 text-white/60 text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {quiz.questions.length} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{Math.ceil(quiz.questions.length * 0.5)} min
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / shuffledQuestions.length) * 100

  return (
    <div className="min-h-screen" style={themeStyle}>
      <div className="min-h-screen bg-black bg-opacity-30">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Progress Bar */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 mb-6 border border-white/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white drop-shadow-md">
                Progress: {answeredCount} / {quiz.questions.length}
              </span>
              <span className="text-sm font-medium text-white drop-shadow-md">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {shuffledQuestions.map((question, qIndex) => (
              <div key={question.id} className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/40">
                <h2 className="text-xl font-semibold mb-4 text-white drop-shadow-md">
                  {qIndex + 1}. {question.text}
                </h2>
                <div className="space-y-3">
                  {question.choices.map((choice, cIndex) => {
                      const isSelected = answers[question.id] === choice.id
                      return (
                        <label
                          key={choice.id}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                            isSelected
                              ? 'border-blue-500'
                              : 'border-white/30 hover:border-white/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={choice.id}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(question.id, choice.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className={`font-medium mx-3 ${isSelected ? 'text-blue-500' : 'text-white'}`}>
                            {String.fromCharCode(65 + cIndex)}.
                          </span>
                          <span className={`flex-1 ${isSelected ? 'text-blue-500' : 'text-white'}`}>{choice.text}</span>
                        </label>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 border border-white/40">
            <Button
              onClick={handleSubmit}
              disabled={submitting || answeredCount < shuffledQuestions.length}
              className="w-full"
              size="lg"
            >
              {submitting
                ? 'Submitting...'
                : answeredCount < shuffledQuestions.length
                ? `Answer all questions (${shuffledQuestions.length - answeredCount} remaining)`
                : 'Submit Quiz'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
