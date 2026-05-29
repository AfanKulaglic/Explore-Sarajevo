'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Filter,
  Eye
} from 'lucide-react'

interface Order {
  id: string
  account_id: string
  account_email?: string
  reward_id: string
  quantity: number
  unit_price: number
  total_price: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'DENIED' | 'CANCELLED'
  shipping_address?: any
  notes?: string
  denied_reason?: string
  created_at: string
  updated_at: string
  reward: {
    id: string
    title: string
    image_url?: string
    type: string
    category: string
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [actionReason, setActionReason] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  async function fetchOrders() {
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, status: string, reason?: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, denied_reason: reason })
      })

      if (res.ok) {
        fetchOrders()
        setSelectedOrder(null)
        setActionReason('')
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.account_email?.toLowerCase().includes(search.toLowerCase()) ||
    order.reward?.title?.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  )

  const statusConfig = {
    PENDING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
    APPROVED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle },
    FULFILLED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle },
    DENIED: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: XCircle },
    CANCELLED: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: XCircle }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Orders</h1>
        <p className="text-sm sm:text-base text-white/60 mt-1">Manage reward redemptions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-12 pr-10 text-sm sm:text-base text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="FULFILLED">Fulfilled</option>
            <option value="DENIED">Denied</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table - Desktop */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => {
              const config = statusConfig[order.status]
              const StatusIcon = config.icon
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5 overflow-hidden">
                        {order.reward?.image_url ? (
                          <img
                            src={order.reward.image_url}
                            alt={order.reward.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-white/30" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{order.reward?.title}</p>
                        <p className="text-xs text-white/50">Qty: {order.quantity}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span className="hidden sm:inline">{order.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-white/50">Order: </span>
                      <span className="text-white/80 font-mono">{order.id.slice(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="text-white/50">Total: </span>
                      <span className="text-white font-medium">{order.total_price.toLocaleString()} {order.currency.toLowerCase()}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/50">User: </span>
                      <span className="text-white/80">{order.account_email || order.account_id.slice(0, 8) + '...'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/50">Date: </span>
                      <span className="text-white/60">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setActionReason('')
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Deny
                        </button>
                      </>
                    )}
                    {order.status === 'APPROVED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'FULFILLED')}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-white/50">
                No orders found
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden">
            <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Order</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Reward</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Total</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status]
                const StatusIcon = config.icon
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-white/80">
                        {order.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/5 overflow-hidden">
                          {order.reward?.image_url ? (
                            <img
                              src={order.reward.image_url}
                              alt={order.reward.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{order.reward?.title}</p>
                          <p className="text-xs text-white/50">Qty: {order.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/80">
                        {order.account_email || order.account_id.slice(0, 8) + '...'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {order.total_price.toLocaleString()} {order.currency.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/60">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'APPROVED')}
                              className="p-2 rounded-lg hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setActionReason('')
                              }}
                              className="p-2 rounded-lg hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {order.status === 'APPROVED' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'FULFILLED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-white/50">
              No orders found
            </div>
          )}
        </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-white/5 overflow-hidden shrink-0">
                  {selectedOrder.reward?.image_url ? (
                    <img
                      src={selectedOrder.reward.image_url}
                      alt={selectedOrder.reward.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm sm:text-base truncate">{selectedOrder.reward?.title}</p>
                  <p className="text-xs sm:text-sm text-white/60">Quantity: {selectedOrder.quantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-white/50">Order ID</p>
                  <p className="text-white font-mono text-xs truncate">{selectedOrder.id.slice(0, 16)}...</p>
                </div>
                <div>
                  <p className="text-white/50">Status</p>
                  <p className="text-white">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-white/50">User</p>
                  <p className="text-white truncate">{selectedOrder.account_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/50">Total</p>
                  <p className="text-white">{selectedOrder.total_price.toLocaleString()} {selectedOrder.currency.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-white/50">Date</p>
                  <p className="text-white">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/50">Type</p>
                  <p className="text-white">{selectedOrder.reward?.type}</p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-white/50 text-xs sm:text-sm mb-1">Shipping Address</p>
                  <p className="text-white text-xs sm:text-sm break-all">
                    {JSON.stringify(selectedOrder.shipping_address, null, 2)}
                  </p>
                </div>
              )}

              {selectedOrder.status === 'PENDING' && (
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Denial Reason (optional)</label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter reason if denying..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
              <button
                onClick={() => {
                  setSelectedOrder(null)
                  setActionReason('')
                }}
                className="sm:flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors order-last sm:order-first"
              >
                Close
              </button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'DENIED', actionReason)}
                    className="sm:flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-500 transition-colors"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'APPROVED')}
                    className="sm:flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
