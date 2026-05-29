'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { 
  BarChart3, 
  Users, 
  Smartphone, 
  Monitor, 
  Globe, 
  TrendingUp, 
  Clock, 
  Target,
  Coins,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react'

interface GlobalStats {
  totalQuizzes: number
  activeQuizzes: number
  total_attempts: number
  completed_attempts: number
  completionRate: number
  avgScore: number
  totalDevices: number
  uniqueAccounts: number
  anonymousPlays: number
  attemptsToday: number
  attemptsThisWeek: number
  attemptsThisMonth: number
  total_coinsGranted: number
  total_xpGranted: number
  accountsToday: number
  accountsThisWeek: number
  accountsThisMonth: number
}

interface QuizStat {
  id: string
  title: string
  status: string
  is_active: boolean
  total_attempts: number
  completions: number
  uniqueDevices: number
  uniqueAccounts: number
  avgScore: number
  completionRate: number
}

interface DeviceStats {
  total: number
  browsers: Record<string, number>
  platforms: Record<string, number>
  multiAccountDevices: number
}

interface RecentAttempt {
  id: string
  player_name: string
  player_email?: string
  device_hash: string
  account_id?: string
  score: number
  max_score: number
  finished_at?: string
  created_at: string
  is_anonymous?: boolean
  platform?: string
  quizTitle?: string
}

interface AdminStatsClientProps {
  globalStats: GlobalStats
  quizStats: QuizStat[]
  deviceStats: DeviceStats
  recentAttempts: RecentAttempt[]
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext,
  color = 'blue',
  trend
}: { 
  icon: any
  label: string
  value: string | number
  subtext?: string
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'gray'
  trend?: { value: number; label: string }
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  }

  return (
    <div className={`p-2 sm:p-4 rounded-lg sm:rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-500 truncate">{label}</p>
          <p className="text-base sm:text-xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-[10px] sm:text-xs text-gray-500 truncate">{subtext}</p>}
        </div>
      </div>
      {trend && (
        <div className="mt-1 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs">
          <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className={trend.value >= 0 ? 'text-green-600' : 'text-red-600'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

function QuizStatsTable({ quizStats }: { quizStats: QuizStat[] }) {
  const [expanded, setExpanded] = useState(false)
  const displayedQuizzes = expanded ? quizStats : quizStats.slice(0, 5)

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Per-Quiz Statistics
          </h3>
        </div>

        {/* Mobile Cards View */}
        <div className="sm:hidden space-y-3">
          {displayedQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-50 rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate flex-1 mr-2">
                  {quiz.title}
                </h4>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  quiz.status === 'PUBLISHED' && quiz.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {quiz.status === 'PUBLISHED' && quiz.is_active ? 'Live' : 'Draft'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Attempts:</span>
                  <span className="ml-1 font-medium">{quiz.total_attempts}</span>
                </div>
                <div>
                  <span className="text-gray-500">Completions:</span>
                  <span className="ml-1 font-medium">{quiz.completions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Devices:</span>
                  <span className="ml-1 font-medium">{quiz.uniqueDevices}</span>
                </div>
                <div>
                  <span className="text-gray-500">Accounts:</span>
                  <span className="ml-1 font-medium">{quiz.uniqueAccounts}</span>
                </div>
                <div>
                  <span className="text-gray-500">Avg Score:</span>
                  <span className="ml-1 font-medium">{quiz.avgScore}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Completion:</span>
                  <span className="ml-1 font-medium">{quiz.completionRate}%</span>
                </div>
              </div>
              <Link 
                href={`/admin/quizzes/${quiz.id}/scores`}
                className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                View Details
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Quiz</th>
                <th className="pb-3 font-medium text-right">Attempts</th>
                <th className="pb-3 font-medium text-right">Completions</th>
                <th className="pb-3 font-medium text-right">Devices</th>
                <th className="pb-3 font-medium text-right">Accounts</th>
                <th className="pb-3 font-medium text-right">Avg Score</th>
                <th className="pb-3 font-medium text-right">Rate</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {displayedQuizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        quiz.status === 'PUBLISHED' && quiz.is_active
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`} />
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {quiz.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-700">{quiz.total_attempts}</td>
                  <td className="py-3 text-right text-gray-700">{quiz.completions}</td>
                  <td className="py-3 text-right text-gray-700">{quiz.uniqueDevices}</td>
                  <td className="py-3 text-right text-gray-700">{quiz.uniqueAccounts}</td>
                  <td className="py-3 text-right">
                    <span className={`font-medium ${
                      quiz.avgScore >= 80 ? 'text-green-600' :
                      quiz.avgScore >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {quiz.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-600">{quiz.completionRate}%</td>
                  <td className="py-3 text-right">
                    <Link 
                      href={`/admin/quizzes/${quiz.id}/scores`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {quizStats.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            {expanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show All ({quizStats.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function DeviceBreakdown({ deviceStats }: { deviceStats: DeviceStats }) {
  const sortedBrowsers = Object.entries(deviceStats.browsers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
  
  const sortedPlatforms = Object.entries(deviceStats.platforms)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const platformIcons: Record<string, any> = {
    'web': Globe,
    'mobile': Smartphone,
    'tablet': Monitor,
    'desktop': Monitor,
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-purple-600" />
          Device Analytics
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Platform Distribution</h4>
            {sortedPlatforms.length > 0 ? (
              <div className="space-y-2">
                {sortedPlatforms.map(([platform, count]) => {
                  const percentage = Math.round((count / deviceStats.total) * 100) || 0
                  const Icon = platformIcons[platform.toLowerCase()] || Globe
                  return (
                    <div key={platform} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 w-20 truncate">{platform}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No platform data yet</p>
            )}
          </div>

          {/* Browser Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Browser Distribution</h4>
            {sortedBrowsers.length > 0 ? (
              <div className="space-y-2">
                {sortedBrowsers.map(([browser, count]) => {
                  const percentage = Math.round((count / deviceStats.total) * 100) || 0
                  return (
                    <div key={browser} className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 w-20 truncate">{browser}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No browser data yet</p>
            )}
          </div>
        </div>

        {deviceStats.multiAccountDevices > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-amber-800">
                {deviceStats.multiAccountDevices} device{deviceStats.multiAccountDevices > 1 ? 's' : ''} 
              </span>
              <span className="text-amber-700"> with multiple accounts detected</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RecentAttemptsTable({ attempts }: { attempts: RecentAttempt[] }) {
  if (attempts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No recent attempts
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-green-600" />
          Recent Attempts
        </h3>

        {/* Mobile View */}
        <div className="sm:hidden space-y-3">
          {attempts.slice(0, 10).map((attempt) => (
            <div key={attempt.id} className="bg-gray-50 rounded-lg p-3 border text-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-900">{attempt.player_name}</span>
                  {attempt.is_anonymous && (
                    <span className="ml-2 text-xs text-gray-400">(Anonymous)</span>
                  )}
                </div>
                {attempt.finished_at ? (
                  <span className={`font-medium ${
                    attempt.max_score > 0 && (attempt.score / attempt.max_score) >= 0.8 
                      ? 'text-green-600' 
                      : 'text-gray-700'
                  }`}>
                    {attempt.score}/{attempt.max_score}
                  </span>
                ) : (
                  <span className="text-amber-600 text-xs">In Progress</span>
                )}
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                {attempt.quizTitle && <div className="text-blue-600 font-medium">{attempt.quizTitle}</div>}
                <div>Device: {attempt.device_hash?.substring(0, 8) || 'N/A'}...</div>
                {attempt.account_id && <div>Account: {attempt.account_id.substring(0, 8)}...</div>}
                <div>{new Date(attempt.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 font-medium">Quiz</th>
                <th className="pb-3 font-medium">Account</th>
                <th className="pb-3 font-medium text-center">Score</th>
                <th className="pb-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {attempts.slice(0, 10).map((attempt) => (
                <tr key={attempt.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{attempt.player_name}</span>
                      {attempt.is_anonymous && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Anon
                        </span>
                      )}
                    </div>
                    {attempt.player_email && (
                      <div className="text-xs text-gray-500">{attempt.player_email}</div>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-blue-600 font-medium truncate max-w-[150px] block">
                      {attempt.quizTitle || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3">
                    {attempt.account_id ? (
                      <code className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        {attempt.account_id.substring(0, 12)}...
                      </code>
                    ) : (
                      <span className="text-gray-400">Guest</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {attempt.finished_at ? (
                      <span className={`font-medium ${
                        attempt.max_score > 0 && (attempt.score / attempt.max_score) >= 0.8 
                          ? 'text-green-600' 
                          : 'text-gray-700'
                      }`}>
                        {attempt.score}/{attempt.max_score}
                      </span>
                    ) : (
                      <span className="text-amber-600">In Progress</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-gray-500 text-xs">
                    {new Date(attempt.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminStatsClient({ globalStats, quizStats, deviceStats, recentAttempts }: AdminStatsClientProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Global Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Quizzes"
          value={globalStats.totalQuizzes}
          subtext={`${globalStats.activeQuizzes} active`}
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Total Attempts"
          value={globalStats.total_attempts.toLocaleString()}
          subtext={`${globalStats.completed_attempts.toLocaleString()} completed`}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Unique Accounts"
          value={globalStats.uniqueAccounts}
          subtext={`${globalStats.anonymousPlays} anonymous`}
          color="purple"
        />
        <StatCard
          icon={Smartphone}
          label="Unique Devices"
          value={globalStats.totalDevices}
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={`${globalStats.avgScore}%`}
          subtext={`${globalStats.completionRate}% completion`}
          color="green"
        />
      </div>

      {/* Time-based Stats - Attempts */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          icon={Clock}
          label="Today"
          value={globalStats.attemptsToday}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="This Week"
          value={globalStats.attemptsThisWeek}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="This Month"
          value={globalStats.attemptsThisMonth}
          color="blue"
        />
      </div>

      {/* Time-based Stats - Unique Accounts */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Unique Players (Logged In)
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-700">{globalStats.accountsToday}</div>
              <div className="text-xs text-purple-600">Today</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-700">{globalStats.accountsThisWeek}</div>
              <div className="text-xs text-purple-600">This Week</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-xl font-bold text-purple-700">{globalStats.accountsThisMonth}</div>
              <div className="text-xs text-purple-600">This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <StatCard
          icon={Coins}
          label="Coins Granted"
          value={globalStats.total_coinsGranted.toLocaleString()}
          color="amber"
        />
        <StatCard
          icon={Sparkles}
          label="XP Granted"
          value={globalStats.total_xpGranted.toLocaleString()}
          color="purple"
        />
      </div>

      {/* Per-Quiz Stats */}
      <QuizStatsTable quizStats={quizStats} />

      {/* Device Analytics */}
      <DeviceBreakdown deviceStats={deviceStats} />

      {/* Recent Attempts */}
      <RecentAttemptsTable attempts={recentAttempts} />
    </div>
  )
}
