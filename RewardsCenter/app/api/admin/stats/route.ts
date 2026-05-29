import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAllAccounts } from '@/lib/central-account'

/**
 * Admin Dashboard Stats API
 * GET /api/admin/stats
 */

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check

    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Parallel queries for performance
    const [
      rewardsResult,
      ordersResult,
      pendingOrdersResult,
      tournamentsResult,
      recentOrdersResult,
      ordersByStatusResult,
      dailyOrdersResult,
      topRewardsResult,
      accountsResult
    ] = await Promise.all([
      // Total rewards
      supabaseAdmin.from('rewards').select('*', { count: 'exact' }).eq('is_active', true),
      
      // Total orders
      supabaseAdmin.from('reward_orders').select('*', { count: 'exact' }),
      
      // Pending orders
      supabaseAdmin.from('reward_orders').select('*', { count: 'exact' }).eq('status', 'PENDING'),
      
      // Active tournaments
      supabaseAdmin.from('tournaments').select('*', { count: 'exact' }).in('status', ['UPCOMING', 'LIVE']),
      
      // Recent orders (last 10)
      supabaseAdmin
        .from('reward_orders')
        .select(`
          *,
          reward:rewards(title, image_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Orders by status
      supabaseAdmin.from('reward_orders').select('status'),
      
      // Daily orders for the last 30 days
      supabaseAdmin
        .from('reward_orders')
        .select('created_at, total_price, currency')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      // Top rewards by order count
      supabaseAdmin
        .from('reward_orders')
        .select('reward_id, reward:rewards(title)')
        .limit(1000),

      // Get accounts from Account-System
      getAllAccounts()
    ])

    // Calculate order stats by status
    const ordersByStatus = {
      PENDING: 0,
      APPROVED: 0,
      FULFILLED: 0,
      DENIED: 0,
      CANCELLED: 0
    }
    ordersByStatusResult.data?.forEach((order: any) => {
      if (order.status in ordersByStatus) {
        ordersByStatus[order.status as keyof typeof ordersByStatus]++
      }
    })

    // Calculate daily revenue for chart
    const dailyStats: Record<string, { orders: number; revenue: number }> = {}
    const last30Days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dailyStats[dateStr] = { orders: 0, revenue: 0 }
      last30Days.push(dateStr)
    }

    dailyOrdersResult.data?.forEach((order: any) => {
      const dateStr = new Date(order.created_at).toISOString().split('T')[0]
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].orders++
        dailyStats[dateStr].revenue += order.total_price || 0
      }
    })

    const dailyOrdersChart = last30Days.map(date => ({
      date,
      orders: dailyStats[date].orders,
      revenue: dailyStats[date].revenue
    }))

    // Calculate top rewards
    const rewardCounts: Record<string, { count: number; title: string }> = {}
    topRewardsResult.data?.forEach((order: any) => {
      if (!rewardCounts[order.reward_id]) {
        rewardCounts[order.reward_id] = { 
          count: 0, 
          title: order.reward?.title || 'Unknown' 
        }
      }
      rewardCounts[order.reward_id].count++
    })

    const topRewards = Object.entries(rewardCounts)
      .map(([id, data]) => ({ id, title: data.title, orders: data.count }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)

    // Calculate total revenue
    const totalRevenue = ordersResult.data?.reduce((sum: number, order: any) => {
      return sum + (order.total_price || 0)
    }, 0) || 0

    // Calculate this month's revenue
    const thisMonthRevenue = dailyOrdersResult.data?.reduce((sum: number, order: any) => {
      return sum + (order.total_price || 0)
    }, 0) || 0

    return NextResponse.json({
      overview: {
        totalRewards: rewardsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
        activeTournaments: tournamentsResult.count || 0,
        totalUsers: accountsResult.length || 0,
        totalRevenue,
        thisMonthRevenue
      },
      ordersByStatus,
      dailyOrders: dailyOrdersChart,
      topRewards,
      recentOrders: recentOrdersResult.data || []
    })
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
