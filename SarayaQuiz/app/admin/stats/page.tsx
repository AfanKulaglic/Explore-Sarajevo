import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { AdminStatsClient } from '@/components/admin/AdminStatsClient'
import { getQuizStatus, isQuizLive } from '@/lib/quiz-schema'

export default async function AdminStatsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login?redirect=/admin/stats')
  }

  const adminEmailsStr = process.env.ADMIN_EMAILS || ''
  const adminEmails = adminEmailsStr
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = session.user?.email?.toLowerCase()
  if (!userEmail || !adminEmails.includes(userEmail)) {
    redirect('/auth/unauthorized')
  }

  const supabase = createSupabaseServiceClient()

  // Fetch all stats data
  const [
    quizzesResult,
    attemptsResult,
    devicesResult,
    completionsResult,
    score_entriesResult,
  ] = await Promise.all([
    supabase.from('posts').select('id, title, published_at, is_active, reward_coins, reward_xp, created_at'),
    supabase.from('attempts').select('*'),
    supabase.from('devices').select('*'),
    supabase.from('completions').select('*'),
    supabase.from('score_entries').select('*'),
  ])

  // Extract data with fallbacks for tables that might not exist
  const quizzes = quizzesResult.data || []
  const attempts = attemptsResult.data || []
  const devices = devicesResult.data || []
  const completions = completionsResult.data || []
  const score_entries = score_entriesResult.data || []

  // Process stats
  const totalQuizzes = quizzes.length
  const activeQuizzes = quizzes.filter((q: any) => isQuizLive(q)).length
  const total_attempts = attempts.length
  const completed_attempts = attempts.filter((a: any) => a.finished_at).length
  
  // Unique devices from ATTEMPT table (device_hash), not Device table
  const uniqueDeviceHashes = new Set(attempts.filter((a: any) => a.device_hash).map((a: any) => a.device_hash))
  const totalDevices = uniqueDeviceHashes.size
  
  // Device records count (for browser/platform tracking)
  const deviceRecordsCount = devices.length
  
  // Total unique accounts (all time)
  const allAccountIds = attempts.filter((a: any) => a.account_id).map((a: any) => a.account_id)
  const uniqueAccounts = new Set(allAccountIds).size
  const anonymousPlays = attempts.filter((a: any) => a.is_anonymous || !a.account_id).length

  // Time-based stats
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const attemptsToday = attempts.filter((a: any) => new Date(a.created_at) >= today).length
  const attemptsThisWeek = attempts.filter((a: any) => new Date(a.created_at) >= thisWeek).length
  
  // Unique accounts per time period
  const accountsToday = new Set(
    attempts.filter((a: any) => a.account_id && new Date(a.created_at) >= today).map((a: any) => a.account_id)
  ).size
  const accountsThisWeek = new Set(
    attempts.filter((a: any) => a.account_id && new Date(a.created_at) >= thisWeek).map((a: any) => a.account_id)
  ).size
  const accountsThisMonth = new Set(
    attempts.filter((a: any) => a.account_id && new Date(a.created_at) >= thisMonth).map((a: any) => a.account_id)
  ).size
  const attemptsThisMonth = attempts.filter((a: any) => new Date(a.created_at) >= thisMonth).length

  // Calculate completion rate
  const completionRate = total_attempts > 0 ? Math.round((completed_attempts / total_attempts) * 100) : 0

  // Average score
  const completedScores = attempts.filter((a: any) => a.finished_at && a.max_score > 0)
  const avgScore = completedScores.length > 0 
    ? Math.round(completedScores.reduce((sum: number, a: any) => sum + (a.score / a.max_score * 100), 0) / completedScores.length)
    : 0

  // Per-quiz stats
  const quizStats = quizzes.map((quiz: any) => {
    const quizAttempts = attempts.filter((a: any) => a.quiz_post_id === quiz.id)
    const quizCompletions = quizAttempts.filter((a: any) => a.finished_at)
    const quizDevices = new Set(quizAttempts.map((a: any) => a.device_hash)).size
    const quizAccounts = new Set(quizAttempts.filter((a: any) => a.account_id).map((a: any) => a.account_id)).size
    const quizScores = quizCompletions.filter((a: any) => a.max_score > 0)
    const avgQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((sum: number, a: any) => sum + (a.score / a.max_score * 100), 0) / quizScores.length)
      : 0

    return {
      id: quiz.id,
      title: quiz.title,
      status: getQuizStatus(quiz),
      is_active: quiz.is_active,
      total_attempts: quizAttempts.length,
      completions: quizCompletions.length,
      uniqueDevices: quizDevices,
      uniqueAccounts: quizAccounts,
      avgScore: avgQuizScore,
      completionRate: quizAttempts.length > 0 
        ? Math.round((quizCompletions.length / quizAttempts.length) * 100) 
        : 0,
    }
  })

  // Device stats with browser/platform breakdown
  // Use devices.length as total for percentages (since browsers/platforms come from Device table)
  const deviceRecordsWithData = devices.filter((d: any) => d.browser || d.platform).length
  const deviceStats = {
    total: deviceRecordsWithData || 1, // Use count of Device records with data for percentage calculations
    browsers: {} as Record<string, number>,
    platforms: {} as Record<string, number>,
    multiAccountDevices: devices.filter((d: any) => d.linked_accounts_count > 1).length,
  }

  devices.forEach((d: any) => {
    if (d.browser) {
      deviceStats.browsers[d.browser] = (deviceStats.browsers[d.browser] || 0) + 1
    }
    if (d.platform) {
      deviceStats.platforms[d.platform] = (deviceStats.platforms[d.platform] || 0) + 1
    }
  })

  // Total rewards granted (from completions)
  const total_coinsGranted = completions.reduce((sum: number, c: any) => sum + (c.total_coins || 0), 0)
  const total_xpGranted = completions.reduce((sum: number, c: any) => sum + (c.total_xp || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="text-blue-600 hover:underline text-sm sm:text-base">
                ← Back to Quizzes
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Comprehensive statistics and device tracking
            </p>
          </div>
        </div>

        <AdminStatsClient
          globalStats={{
            totalQuizzes,
            activeQuizzes,
            total_attempts,
            completed_attempts,
            completionRate,
            avgScore,
            totalDevices,
            uniqueAccounts,
            anonymousPlays,
            attemptsToday,
            attemptsThisWeek,
            attemptsThisMonth,
            total_coinsGranted,
            total_xpGranted,
            accountsToday,
            accountsThisWeek,
            accountsThisMonth,
          }}
          quizStats={quizStats}
          deviceStats={deviceStats}
          recentAttempts={
            // Sort by created_at descending (newest first) and take top 20
            [...attempts]
              .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 20)
              .map((a: any) => ({
                ...a,
                quizTitle: quizzes.find((q: any) => q.id === a.quiz_post_id)?.title || 'Unknown Quiz'
              }))
          }
        />
      </div>
    </div>
  )
}
