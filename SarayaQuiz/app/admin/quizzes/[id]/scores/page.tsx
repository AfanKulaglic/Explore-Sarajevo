import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import Link from 'next/link'
import { createSupabaseServiceClient, fetchAccountsFromCentral } from '@/lib/supabase'
import { shortHash } from '@/lib/crypto'
import { DismissableWarning, ExpandableAccounts } from '@/components/admin/DeviceDetailsModal'
import { 
  ArrowLeft, 
  Target, 
  Trophy, 
  Smartphone, 
  Mail,
  BarChart3,
  Clock,
  Monitor,
  AlertTriangle
} from 'lucide-react'

// Helper to format date as DD.MM.YYYY
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Helper to format datetime
function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

interface PageProps {
  params: Promise<{ id: string }>
}

// Mobile-friendly stat card
function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  tooltip 
}: { 
  icon: any, 
  value: string | number, 
  label: string, 
  color: string,
  tooltip: string 
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-default relative">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              {label}
              <InfoTooltip text={tooltip} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ScoresPage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login')
  }

  const supabase = createSupabaseServiceClient()
  
  // Fetch quiz with related data
  const { data: quiz, error } = await supabase
    .from('posts')
    .select(`
      *,
      score_entries:score_entries(*),
      attempts:attempts(*)
    `)
    .eq('id', id)
    .single()

  if (error || !quiz) {
    notFound()
  }

  // Fetch device information for all device hashes
  const device_hashes = new Set<string>()
  quiz.attempts?.forEach((a: any) => a.device_hash && device_hashes.add(a.device_hash))
  quiz.score_entries?.forEach((s: any) => s.device_hash && device_hashes.add(s.device_hash))
  
  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .in('device_hash', Array.from(device_hashes))

  const deviceMap = new Map((devices || []).map((d: any) => [d.device_hash, d]))

  // Fetch account names for all account_ids from central account system
  const account_ids = new Set<string>()
  quiz.attempts?.forEach((a: any) => a.account_id && account_ids.add(a.account_id))
  quiz.score_entries?.forEach((s: any) => s.account_id && account_ids.add(s.account_id))
  
  // Use the central account system to fetch account details
  const accountMap = await fetchAccountsFromCentral(Array.from(account_ids))
  
  // Sort by created_at desc
  quiz.score_entries = (quiz.score_entries || []).sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  quiz.attempts = (quiz.attempts || []).sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Create a Set of attempt_ids that have saved scores
  const savedAttemptIds = new Set(quiz.score_entries.map((s: any) => s.attempt_id))

  // Calculate analytics
  const total_attempts = quiz.attempts.length
  const savedScores = quiz.score_entries.length
  const uniqueDevices = new Set(quiz.attempts.map((a: any) => a.device_hash)).size
  
  // Count unique emails from both score_entries (saved scores) and attempts (logged-in users)
  const allEmails = new Set<string>()
  quiz.score_entries.forEach((s: any) => {
    if (s.email_hash) allEmails.add(s.email_hash)
    else if (s.email) allEmails.add(s.email) // Fallback to plain email if hash missing
  })
  // Also count emails from attempts (for logged-in users who didn't explicitly save)
  quiz.attempts.forEach((a: any) => {
    if (a.player_email) allEmails.add(a.player_email)
  })
  const uniqueEmails = allEmails.size
  
  const completionRate = total_attempts > 0 
    ? ((savedScores / total_attempts) * 100).toFixed(1) 
    : '0.0'

  // Average score
  const completed_attempts = quiz.attempts.filter((a: any) => a.finished_at).length
  const avgScore = completed_attempts > 0
    ? (quiz.attempts
        .filter((a: any) => a.finished_at)
        .reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completed_attempts).toFixed(1)
    : '0.0'
  
  // Group attempts by device for per-device analytics
  // New structure: track signed-in accounts vs signed-out submissions separately
  const deviceStats = new Map<string, {
    device_hash: string
    attemptsCount: number
    savedScoresCount: number
    bestScore: number
    lastSeen: Date
    firstSeen: Date
    deviceInfo?: any
    account_ids: Set<string>
    // Signed in accounts with their stats
    signedInAccounts: Map<string, { name: string; email: string; attempts: number; saved: number }>
    // Signed out submissions (name/email from save form, not logged in)
    signedOutSubmissions: Map<string, { name: string; email: string; attempts: number; saved: number }>
  }>()
  
  quiz.attempts.forEach((attempt: any) => {
    const hash = attempt.device_hash
    if (!hash) return
    
    if (!deviceStats.has(hash)) {
      const deviceInfo = deviceMap.get(hash)
      deviceStats.set(hash, {
        device_hash: hash,
        attemptsCount: 0,
        savedScoresCount: 0,
        bestScore: 0,
        lastSeen: new Date(attempt.created_at),
        firstSeen: new Date(attempt.created_at),
        deviceInfo,
        account_ids: new Set(deviceInfo?.account_ids || []),
        signedInAccounts: new Map(),
        signedOutSubmissions: new Map()
      })
    }
    
    const stats = deviceStats.get(hash)!
    stats.attemptsCount++
    // Don't track best score from attempts - only from saved scores
    const attemptDate = new Date(attempt.created_at)
    if (attemptDate > stats.lastSeen) stats.lastSeen = attemptDate
    if (attemptDate < stats.firstSeen) stats.firstSeen = attemptDate
    
    // Track by account_id (signed in) OR by player_name (signed out)
    if (attempt.account_id) {
      stats.account_ids.add(attempt.account_id)
      const accountInfo = accountMap.get(attempt.account_id)
      const existing = stats.signedInAccounts.get(attempt.account_id)
      stats.signedInAccounts.set(attempt.account_id, {
        name: accountInfo?.name || 'Unknown',
        email: accountInfo?.email || '',
        attempts: (existing?.attempts || 0) + 1,
        saved: existing?.saved || 0
      })
    } else {
      // Signed out attempt - track by player_name + player_email combo
      const key = `${attempt.player_name || 'Anonymous'}|${attempt.player_email || ''}`
      const existing = stats.signedOutSubmissions.get(key)
      stats.signedOutSubmissions.set(key, {
        name: attempt.player_name || 'Anonymous',
        email: attempt.player_email || '',
        attempts: (existing?.attempts || 0) + 1,
        saved: existing?.saved || 0
      })
    }
  })
  
  // Add saved score info
  quiz.score_entries.forEach((entry: any) => {
    const hash = entry.device_hash
    if (hash && deviceStats.has(hash)) {
      const stats = deviceStats.get(hash)!
      stats.savedScoresCount++
      stats.bestScore = Math.max(stats.bestScore, entry.score || 0)  // Best from saved scores only
      
      const entryDate = new Date(entry.created_at)
      if (entryDate > stats.lastSeen) stats.lastSeen = entryDate
      if (entryDate < stats.firstSeen) stats.firstSeen = entryDate
      
      // Track by account_id (signed in) OR by name/email (signed out)
      if (entry.account_id) {
        stats.account_ids.add(entry.account_id)
        const accountInfo = accountMap.get(entry.account_id)
        const existing = stats.signedInAccounts.get(entry.account_id)
        if (existing) {
          existing.saved++
        } else {
          stats.signedInAccounts.set(entry.account_id, {
            name: accountInfo?.name || 'Unknown',
            email: accountInfo?.email || '',
            attempts: 0,
            saved: 1
          })
        }
      } else {
        // Signed out save - track by name + email combo
        const key = `${entry.name || 'Anonymous'}|${entry.email || ''}`
        const existing = stats.signedOutSubmissions.get(key)
        if (existing) {
          existing.saved++
        } else {
          stats.signedOutSubmissions.set(key, {
            name: entry.name || 'Anonymous',
            email: entry.email || '',
            attempts: 0,
            saved: 1
          })
        }
      }
    }
  })
  
  // Sort by lastSeen descending (most recent activity first) - ONLY sort once!
  const deviceStatsArray = Array.from(deviceStats.values())
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())

  // Count devices with multiple accounts (potential abuse) and get their hashes
  const multiAccountDeviceHashes = deviceStatsArray
    .filter(d => d.signedInAccounts.size > 1)
    .map(d => d.device_hash)
  const multiAccountDevices = multiAccountDeviceHashes.length

  // Quiz settings
  const max_attempts_per_device = quiz.max_attempts_per_device
  const hasAttemptLimit = max_attempts_per_device !== null && max_attempts_per_device !== undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-1 text-blue-600 hover:underline mb-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
            {quiz.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Scores &amp; Analytics</p>
          
          {/* Quiz Settings Info */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
            {hasAttemptLimit && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Limit: {max_attempts_per_device} attempts/device
              </span>
            )}
            {quiz.requiresLogin && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Requires Login
              </span>
            )}
          </div>
        </div>

        {/* KPI Cards - 2 rows of 3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-8">
          <StatCard 
            icon={Target} 
            value={total_attempts} 
            label="Attempts" 
            color="blue"
            tooltip="Total number of quiz starts including abandoned attempts"
          />
          <StatCard 
            icon={Trophy} 
            value={savedScores} 
            label="Saved" 
            color="green"
            tooltip="Completed quizzes with scores saved to leaderboard"
          />
          <StatCard 
            icon={Smartphone} 
            value={uniqueDevices} 
            label="Devices" 
            color="purple"
            tooltip="Unique devices that attempted this quiz"
          />
          <StatCard 
            icon={Mail} 
            value={uniqueEmails} 
            label="Emails" 
            color="indigo"
            tooltip="Unique email addresses with saved scores"
          />
          <StatCard 
            icon={BarChart3} 
            value={`${completionRate}%`} 
            label="Done" 
            color="pink"
            tooltip="Percentage of attempts that resulted in saved scores"
          />
          <StatCard 
            icon={Clock} 
            value={avgScore} 
            label="Avg" 
            color="orange"
            tooltip="Average score across all completed quiz attempts"
          />
        </div>

        {/* Alert for multi-account devices */}
        <DismissableWarning 
          count={multiAccountDevices} 
          storageKey={`quiz-${id}-warning`}
          device_hashes={multiAccountDeviceHashes}
        />

        {/* Saved Scores - Mobile Cards + Desktop Table */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Saved Scores
              <InfoTooltip text="All completed quiz submissions with saved scores" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedScores === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">No saved scores yet</p>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {quiz.score_entries.slice(0, 20).map((entry: any) => {
                    const device = deviceMap.get(entry.device_hash)
                    return (
                      <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900 truncate flex-1">{entry.name}</div>
                          <div className="font-bold text-green-600 ml-2">
                            {entry.score}/{entry.max_score}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 truncate mb-1">{entry.email}</div>
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                            {shortHash(entry.device_hash)}
                          </span>
                          {device?.browser && (
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {device.browser}
                            </span>
                          )}
                          {device?.platform && (
                            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                              {device.platform}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {formatDateTime(new Date(entry.created_at))}
                        </div>
                        {entry.account_id && (
                          <div className="text-xs text-blue-600 mt-1">
                            Account: {accountMap.get(entry.account_id)?.name || entry.account_id.slice(0, 8) + '...'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {quiz.score_entries.length > 20 && (
                    <p className="text-center text-xs text-gray-500 py-2">
                      Showing 20 of {quiz.score_entries.length} entries
                    </p>
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Account</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Device</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Browser</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Platform</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quiz.score_entries.slice(0, 50).map((entry: any) => {
                        const device = deviceMap.get(entry.device_hash)
                        return (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                              {formatDate(new Date(entry.created_at))}
                              <br />
                              <span className="text-xs">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="px-3 py-2">
                              {entry.account_id ? (
                                <span className="text-blue-600 font-medium">
                                  {accountMap.get(entry.account_id)?.name || 'Signed In'}
                                </span>
                              ) : (
                                <span className="text-gray-400">Guest</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-900 font-medium">{entry.name}</td>
                            <td className="px-3 py-2 text-gray-600 max-w-[150px] truncate">{entry.email}</td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-500">{shortHash(entry.device_hash)}</td>
                            <td className="px-3 py-2 text-gray-600">{device?.browser || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{device?.platform || '-'}</td>
                            <td className="px-3 py-2">
                              <span className="font-bold text-green-600">{entry.score}</span>
                              <span className="text-gray-400">/{entry.max_score}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {quiz.score_entries.length > 50 && (
                    <p className="text-center text-xs text-gray-500 py-3 border-t">
                      Showing 50 of {quiz.score_entries.length} entries
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Device Analytics */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Device Analytics
              <InfoTooltip text="Per-device stats: attempts, scores, browser, platform, and linked accounts" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceStatsArray.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">No device data yet</p>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {deviceStatsArray.slice(0, 20).map((stats) => {
                    const signedInAccounts = Array.from(stats.signedInAccounts.entries()).map(([id, data]) => ({
                      id, ...data
                    }))
                    const signedOutSubmissions = Array.from(stats.signedOutSubmissions.values())
                    const hasMultiAccounts = stats.signedInAccounts.size > 1
                    const totalSubmissions = signedInAccounts.length + signedOutSubmissions.length
                    
                    return (
                      <div 
                        key={stats.device_hash} 
                        className={`rounded-lg p-3 border ${hasMultiAccounts ? 'bg-amber-50 border-amber-200' : 'bg-gray-50'}`}
                      >
                        {/* Device Hash & Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded">
                            {shortHash(stats.device_hash)}
                          </span>
                          {stats.deviceInfo?.browser && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {stats.deviceInfo.browser}
                            </span>
                          )}
                          {stats.deviceInfo?.platform && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                              {stats.deviceInfo.platform}
                            </span>
                          )}
                          {stats.deviceInfo?.os && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                              {stats.deviceInfo.os}
                            </span>
                          )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-2 text-center text-sm">
                          <div className="bg-white rounded p-2">
                            <div className="font-bold text-blue-600">{stats.attemptsCount}</div>
                            <div className="text-xs text-gray-500">Attempts</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="font-bold text-green-600">{stats.savedScoresCount}</div>
                            <div className="text-xs text-gray-500">Saved</div>
                          </div>
                          <div className="bg-white rounded p-2">
                            <div className="font-bold text-orange-600">{stats.bestScore}</div>
                            <div className="text-xs text-gray-500">Best</div>
                          </div>
                        </div>

                        {/* Users (accounts + signed out) */}
                        {totalSubmissions > 0 && (
                          <div className={`text-xs rounded p-2 mb-2 ${hasMultiAccounts ? 'text-amber-700 bg-amber-100' : 'text-blue-700 bg-blue-50'}`}>
                            {hasMultiAccounts && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            <ExpandableAccounts 
                              signedInAccounts={signedInAccounts}
                              signedOutSubmissions={signedOutSubmissions}
                              device_hash={shortHash(stats.device_hash)}
                              browser={stats.deviceInfo?.browser}
                              platform={stats.deviceInfo?.platform}
                              os={stats.deviceInfo?.os}
                              attempts={stats.attemptsCount}
                              saved={stats.savedScoresCount}
                              best={stats.bestScore}
                              lastSeen={formatDate(stats.lastSeen)}
                              firstSeen={formatDate(stats.firstSeen)}
                              hasWarning={hasMultiAccounts}
                            />
                          </div>
                        )}

                        {/* Timestamps - Last first, then First */}
                        <div className="text-xs text-gray-400 mt-2 flex justify-between">
                          <span>Last: {formatDate(stats.lastSeen)}</span>
                          <span>First: {formatDate(stats.firstSeen)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Device</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Browser</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Platform</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">OS</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Attempts</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Saved</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Best</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Users</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Last/First</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deviceStatsArray.map((stats) => {
                        const signedInAccounts = Array.from(stats.signedInAccounts.entries()).map(([id, data]) => ({
                          id, ...data
                        }))
                        const signedOutSubmissions = Array.from(stats.signedOutSubmissions.values())
                        const hasMultiAccounts = stats.signedInAccounts.size > 1
                        const totalSubmissions = signedInAccounts.length + signedOutSubmissions.length
                        
                        return (
                          <tr key={stats.device_hash} className={hasMultiAccounts ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                            <td className="px-3 py-2 font-mono text-xs text-gray-500">
                              {shortHash(stats.device_hash)}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {stats.deviceInfo?.browser || '-'}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {stats.deviceInfo?.platform || '-'}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {stats.deviceInfo?.os || '-'}
                            </td>
                            <td className="px-3 py-2 font-medium text-blue-600">
                              {stats.attemptsCount}
                              {hasAttemptLimit && stats.attemptsCount >= max_attempts_per_device! && (
                                <span className="ml-1 text-xs text-red-500">(max)</span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-medium text-green-600">{stats.savedScoresCount}</td>
                            <td className="px-3 py-2 font-medium text-orange-600">{stats.bestScore}</td>
                            <td className="px-3 py-2 text-xs max-w-[220px]">
                              {totalSubmissions === 0 ? (
                                <span className="text-gray-400">-</span>
                              ) : (
                                <ExpandableAccounts
                                  signedInAccounts={signedInAccounts}
                                  signedOutSubmissions={signedOutSubmissions}
                                  device_hash={shortHash(stats.device_hash)}
                                  browser={stats.deviceInfo?.browser}
                                  platform={stats.deviceInfo?.platform}
                                  os={stats.deviceInfo?.os}
                                  attempts={stats.attemptsCount}
                                  saved={stats.savedScoresCount}
                                  best={stats.bestScore}
                                  lastSeen={formatDate(stats.lastSeen)}
                                  firstSeen={formatDate(stats.firstSeen)}
                                  hasWarning={hasMultiAccounts}
                                />
                              )}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-500">
                              <div className="font-medium">{formatDate(stats.lastSeen)}</div>
                              <div className="text-gray-400">{formatDate(stats.firstSeen)}</div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Recent Attempts
              <InfoTooltip text="All quiz starts including completed and abandoned attempts" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {total_attempts === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">No attempts yet</p>
            ) : (
              <>
                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {quiz.attempts.slice(0, 20).map((attempt: any) => {
                    const device = deviceMap.get(attempt.device_hash)
                    const isSaved = savedAttemptIds.has(attempt.id)
                    const isFinished = !!attempt.finished_at
                    
                    // Status: Saved (green) > Finished (blue) > Abandoned (red)
                    const status = isSaved ? 'Saved' : isFinished ? 'Finished' : 'Abandoned'
                    const statusColor = isSaved 
                      ? 'bg-green-100 text-green-800' 
                      : isFinished 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    
                    return (
                      <div key={attempt.id} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900 truncate flex-1">
                            {attempt.player_name || 'Anonymous'}
                          </div>
                          <div className={`font-bold ${isFinished ? 'text-green-600' : 'text-red-500'}`}>
                            {isFinished ? `${attempt.score}/${attempt.max_score}` : 'Exited'}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                            {shortHash(attempt.device_hash)}
                          </span>
                          {device?.browser && (
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {device.browser}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded ${statusColor}`}>
                            {status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(attempt.created_at).toLocaleDateString()} {new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Player</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Device</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Browser</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Platform</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Score</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {quiz.attempts.slice(0, 30).map((attempt: any) => {
                        const device = deviceMap.get(attempt.device_hash)
                        const isSaved = savedAttemptIds.has(attempt.id)
                        const isFinished = !!attempt.finished_at
                        
                        return (
                          <tr key={attempt.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                              {new Date(attempt.created_at).toLocaleDateString()}
                              <br />
                              <span className="text-xs">{new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="px-3 py-2 text-gray-900">{attempt.player_name || 'Anonymous'}</td>
                            <td className="px-3 py-2 font-mono text-xs text-gray-500">{shortHash(attempt.device_hash)}</td>
                            <td className="px-3 py-2 text-gray-600">{device?.browser || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{device?.platform || '-'}</td>
                            <td className="px-3 py-2">
                              {isFinished ? (
                                <>
                                  <span className="font-bold text-green-600">{attempt.score}</span>
                                  <span className="text-gray-400">/{attempt.max_score}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isSaved ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Saved
                                </span>
                              ) : isFinished ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Finished
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Abandoned
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {quiz.attempts.length > 30 && (
                    <p className="text-center text-xs text-gray-500 py-3 border-t">
                      Showing 30 of {quiz.attempts.length} attempts
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
