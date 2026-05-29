'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Copy,
  Check,
  X,
  Percent,
  DollarSign
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: 'PERCENTAGE' | 'FIXED_COINS' | 'FREE_SHIPPING'
  discount_value: number
  min_purchase?: number
  max_discount?: number
  usage_limit?: number
  usage_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
  applicable_rewards?: string[]
  created_at: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    code: string
    description: string
    discount_type: 'PERCENTAGE' | 'FIXED_COINS' | 'FREE_SHIPPING'
    discount_value: number
    min_purchase: number
    max_discount: number
    usage_limit: number
    valid_from: string
    valid_until: string
    is_active: boolean
  }>({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 10,
    min_purchase: 0,
    max_discount: 0,
    usage_limit: 0,
    valid_from: '',
    valid_until: '',
    is_active: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      setCoupons(data.data || [])
    } catch (error) {
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const payload = {
      ...formData,
      min_purchase: formData.min_purchase || null,
      max_discount: formData.max_discount || null,
      usage_limit: formData.usage_limit || null
    }

    try {
      const url = editingCoupon ? `/api/coupons?id=${editingCoupon.id}` : '/api/coupons'
      const method = editingCoupon ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        fetchCoupons()
        closeModal()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save coupon')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (res.ok) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Error toggling coupon:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCoupons()
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
    }
  }

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code }))
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function openModal(coupon?: Coupon) {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase: coupon.min_purchase || 0,
        max_discount: coupon.max_discount || 0,
        usage_limit: coupon.usage_limit || 0,
        valid_from: coupon.valid_from?.split('T')[0] || '',
        valid_until: coupon.valid_until?.split('T')[0] || '',
        is_active: coupon.is_active
      })
    } else {
      setEditingCoupon(null)
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      setFormData({
        code: '',
        description: '',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        min_purchase: 0,
        max_discount: 0,
        usage_limit: 0,
        valid_from: today,
        valid_until: nextMonth.toISOString().split('T')[0],
        is_active: true
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingCoupon(null)
  }

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const discountTypeConfig = {
    PERCENTAGE: { icon: Percent, label: 'Percentage', suffix: '%' },
    FIXED_COINS: { icon: DollarSign, label: 'Fixed Coins', suffix: ' coins' },
    FREE_SHIPPING: { icon: Tag, label: 'Free Shipping', suffix: '' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coupons</h1>
          <p className="text-white/60 mt-1">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-500"
        >
          <Plus className="h-5 w-5" />
          Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <input
          type="text"
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Total Coupons</div>
          <div className="text-2xl font-bold text-white mt-1">{coupons.length}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Active</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {coupons.filter(c => c.is_active).length}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Total Uses</div>
          <div className="text-2xl font-bold text-white mt-1">
            {coupons.reduce((acc, c) => acc + (c.usage_count ?? 0), 0)}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/60">Expired</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {coupons.filter(c => new Date(c.valid_until) < new Date()).length}
          </div>
        </div>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCoupons.map((coupon) => {
            const config = discountTypeConfig[coupon.discount_type]
            const Icon = config.icon
            const isExpired = new Date(coupon.valid_until) < new Date()
            const isNotStarted = new Date(coupon.valid_from) > new Date()
            const usageFull = coupon.usage_limit && coupon.usage_count >= coupon.usage_limit

            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border bg-slate-900/50 p-4 ${
                  !coupon.is_active || isExpired || usageFull
                    ? 'border-white/5 opacity-60'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${
                    coupon.discount_type === 'PERCENTAGE'
                      ? 'bg-violet-500/20 text-violet-400'
                      : coupon.discount_type === 'FIXED_COINS'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-lg font-mono font-bold text-white">{coupon.code}</code>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {coupon.description && (
                      <p className="text-sm text-white/60 mt-0.5">{coupon.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                      <span>
                        {coupon.discount_type !== 'FREE_SHIPPING' && (
                          <span className="text-brand-400 font-semibold">
                            {coupon.discount_value}{config.suffix}
                          </span>
                        )}
                        {coupon.discount_type === 'FREE_SHIPPING' && (
                          <span className="text-emerald-400 font-semibold">Free Shipping</span>
                        )}
                        {' '}off
                      </span>
                      <span>•</span>
                      <span>Used {coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''} times</span>
                      <span>•</span>
                      <span>
                        Valid until {new Date(coupon.valid_until).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      {isExpired && (
                        <span className="px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium">
                          Expired
                        </span>
                      )}
                      {isNotStarted && (
                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                          Scheduled
                        </span>
                      )}
                      {usageFull && (
                        <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 text-xs font-medium">
                          Limit Reached
                        </span>
                      )}
                      {coupon.is_active && !isExpired && !usageFull && !isNotStarted && (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(coupon.id, coupon.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        coupon.is_active
                          ? 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                      }`}
                    >
                      {coupon.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => openModal(coupon)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {filteredCoupons.length === 0 && !loading && (
        <div className="text-center py-12 text-white/50">
          No coupons found
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white font-mono uppercase focus:border-brand-500 focus:outline-none"
                    placeholder="SUMMER2024"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Summer sale discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Discount Type *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value as any }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_COINS">Fixed Coins</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    {formData.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    required={formData.discount_type !== 'FREE_SHIPPING'}
                    disabled={formData.discount_type === 'FREE_SHIPPING'}
                    min="0"
                    max={formData.discount_type === 'PERCENTAGE' ? 100 : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Min Purchase (coins)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Max Discount (coins)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_discount: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Usage Limit (0 = unlimited)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-white/80">Active</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
