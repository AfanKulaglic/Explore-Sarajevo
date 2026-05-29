'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Gift,
  ShoppingCart,
  Trophy,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coins
} from 'lucide-react'

interface DashboardStats {
  overview: {
    totalRewards: number
    totalOrders: number
    pendingOrders: number
    activeTournaments: number
    totalUsers: number
    totalRevenue: number
    thisMonthRevenue: number
  }
  ordersByStatus: {
    PENDING: number
    APPROVED: number
    FULFILLED: number
    DENIED: number
    CANCELLED: number
  }
  dailyOrders: Array<{
    date: string
    orders: number
    revenue: number
  }>
  topRewards: Array<{
    id: string
    title: string
    orders: number
  }>
  recentOrders: Array<{
    id: string
    account_email: string
    total_price: number
    currency: string
    status: string
    created_at: string
    reward: {
      title: string
      image_url: string
    }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-white/60 py-12">
        Failed to load dashboard stats
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Rewards',
      value: stats.overview.totalRewards,
      icon: Gift,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Total Orders',
      value: stats.overview.totalOrders,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Pending Orders',
      value: stats.overview.pendingOrders,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      title: 'Active Tournaments',
      value: stats.overview.activeTournaments,
      icon: Trophy,
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/20'
    },
    {
      title: 'Total Users',
      value: stats.overview.totalUsers,
      icon: Users,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    },
    {
      title: 'This Month Revenue',
      value: stats.overview.thisMonthRevenue.toLocaleString(),
      icon: Coins,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      suffix: ' coins'
    }
  ]

  const statusColors = {
    PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
    APPROVED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle },
    FULFILLED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    DENIED: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: XCircle },
    CANCELLED: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: XCircle }
  }

  // Calculate max value for chart scaling
  const maxOrders = Math.max(...stats.dailyOrders.map(d => d.orders), 1)
  
  // Calculate fulfillment rate
  const totalProcessed = stats.ordersByStatus.APPROVED + stats.ordersByStatus.FULFILLED + stats.ordersByStatus.DENIED
  const fulfillmentRate = stats.overview.totalOrders > 0 
    ? Math.round((stats.ordersByStatus.FULFILLED / Math.max(totalProcessed, 1)) * 100)
    : 0
  
  // Calculate approval rate
  const approvalRate = totalProcessed > 0
    ? Math.round(((stats.ordersByStatus.APPROVED + stats.ordersByStatus.FULFILLED) / totalProcessed) * 100)
    : 0

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-1 text-sm sm:text-base">Welcome to the Rewards Store admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl sm:rounded-2xl border ${stat.borderColor} ${stat.bgColor} p-4 sm:p-6`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-white/60 truncate">{stat.title}</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-1">
                  {stat.value}{stat.suffix || ''}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} shrink-0`}>
                <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Orders Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white">Orders Activity (Last 30 Days)</h2>
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          </div>
          <div className="h-48 sm:h-64 flex items-end gap-0.5 sm:gap-1">
            {stats.dailyOrders.map((day, index) => (
              <div
                key={day.date}
                className="flex-1 h-full flex items-end group relative"
              >
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{
                    height: `${Math.max((day.orders / maxOrders) * 100, 2)}%`,
                    minHeight: '4px'
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                    <p className="text-white font-medium">{day.date}</p>
                    <p className="text-blue-400">{day.orders} orders</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
          
          {/* Quick Stats Under Chart */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-emerald-400">{approvalRate}%</div>
              <div className="text-xs text-white/50">Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">{fulfillmentRate}%</div>
              <div className="text-xs text-white/50">Fulfillment Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Orders by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Orders by Status</h2>
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => {
              const config = statusColors[status as keyof typeof statusColors]
              const percentage = stats.overview.totalOrders > 0
                ? (count / stats.overview.totalOrders) * 100
                : 0
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className={`h-4 w-4 ${config.text}`} />
                      <span className="text-sm text-white/80">{status}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${config.bg.replace('/20', '')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Top Rewards</h2>
          <div className="space-y-3 sm:space-y-4">
            {stats.topRewards.length > 0 ? (
              stats.topRewards.map((reward, index) => (
                <div key={reward.id} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400 font-bold text-xs sm:text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white truncate">{reward.title}</p>
                    <p className="text-[10px] sm:text-xs text-white/50">{reward.orders} orders</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-xs sm:text-sm">No orders yet</p>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl sm:rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">Recent Orders</h2>
          <div className="space-y-3 sm:space-y-4">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order) => {
                const config = statusColors[order.status as keyof typeof statusColors]
                return (
                  <div key={order.id} className="flex items-center gap-3 sm:gap-4">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white/5 overflow-hidden shrink-0">
                      {order.reward?.image_url ? (
                        <img
                          src={order.reward.image_url}
                          alt={order.reward.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {order.reward?.title || 'Unknown Reward'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-white/50 truncate">
                        {order.account_email || 'Unknown User'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-medium text-white">
                        {order.total_price.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs ${config.text}`}>
                        <config.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">{order.status}</span>
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-white/50 text-xs sm:text-sm">No orders yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
