'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { formatStatus, getStatusTone } from "@/lib/utils"
import { OrderStatus } from "@/lib/types"
import { Loader2, Package } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface Order {
  id: string
  reward_id: string
  quantity: number
  total_price: number
  unit_price: number
  currency: 'COINS' | 'TOKENS'
  status: OrderStatus
  created_at: string
  reward?: {
    id: string
    title: string
    image_url?: string
    type: string
    category: string
  }
}

const columns = ["Order", "Quantity", "Total", "Status", "Date"]

export default function OrdersPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Translated columns
  const translatedColumns = [t.orders.order, t.orders.quantity, t.orders.total, t.orders.status, t.orders.date]

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders?account_id=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setOrders(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  if (isLoading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-white/60">{t.orders.loadingOrders}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60">{t.orders.yourOrders}</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">{t.orders.orderHistory}</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/5 p-12 text-center">
          <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t.orders.noOrders}</h3>
          <p className="text-white/50">{t.orders.noOrdersDescription}</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{order.reward?.title || 'Reward'}</p>
                    <p className="text-xs text-white/50 mt-0.5">#{order.id.slice(0, 8)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusTone(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white/50 text-xs">{t.orders.qty}</p>
                      <p className="text-white">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs">{t.orders.total}</p>
                      <p className="text-white font-semibold">
                        {order.total_price.toLocaleString()} {order.currency === 'COINS' ? 'coins' : 'tokens'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">{t.orders.date}</p>
                    <p className="text-white/70">
                      {new Date(order.created_at).toLocaleDateString("en-US", { 
                        month: "short", 
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-white/5 bg-white/5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm text-white/80">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                  <tr>
                    {translatedColumns.map((column) => (
                      <th key={column} className="px-6 py-4">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-white/5">
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <p className="font-semibold">{order.reward?.title || 'Reward'}</p>
                          <p className="text-xs text-white/60">#{order.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{order.quantity}</td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {order.total_price.toLocaleString()} {order.currency === 'COINS' ? 'coins' : 'tokens'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(order.created_at).toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric", 
                          year: "numeric" 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
