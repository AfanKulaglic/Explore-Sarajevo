'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Sparkles,
  Clock,
  ShieldCheck,
  X,
  Upload,
  Loader2
} from 'lucide-react'

interface Reward {
  id: string
  title: string
  subtitle?: string
  description?: string
  image_url?: string
  type: 'PHYSICAL' | 'DIGITAL' | 'PERK'
  category: string
  price: number
  currency: 'COINS' | 'TOKENS'
  stock?: number
  requires_approval: boolean
  tags: string[]
  expires_at?: string
  is_active: boolean
  created_at: string
  // Bosnian translations
  title_bosnian?: string
  subtitle_bosnian?: string
  description_bosnian?: string
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<{
    title: string
    subtitle: string
    description: string
    image_url: string
    type: 'PHYSICAL' | 'DIGITAL' | 'PERK'
    category: string
    price: number
    currency: 'COINS' | 'TOKENS'
    stock: string
    requires_approval: boolean
    tags: string[]
    expires_at: string
    // Bosnian translations
    title_bosnian: string
    subtitle_bosnian: string
    description_bosnian: string
  }>({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    type: 'PHYSICAL',
    category: 'electronics',
    price: 0,
    currency: 'COINS',
    stock: '',
    requires_approval: false,
    tags: [],
    expires_at: '',
    // Bosnian translations
    title_bosnian: '',
    subtitle_bosnian: '',
    description_bosnian: ''
  })

  useEffect(() => {
    fetchRewards()
  }, [])

  async function fetchRewards() {
    try {
      const res = await fetch('/api/rewards?limit=100')
      const data = await res.json()
      setRewards(data.data || [])
    } catch (error) {
      console.error('Error fetching rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/rewards/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await res.json()
      
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }))
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const payload = {
      ...formData,
      stock: formData.stock ? parseInt(formData.stock) : null,
      expires_at: formData.expires_at || null
    }

    try {
      const url = editingReward ? `/api/rewards/${editingReward.id}` : '/api/rewards'
      const method = editingReward ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        fetchRewards()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving reward:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this reward?')) return
    
    try {
      const res = await fetch(`/api/rewards/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRewards()
      }
    } catch (error) {
      console.error('Error deleting reward:', error)
    }
  }

  function openModal(reward?: Reward) {
    if (reward) {
      setEditingReward(reward)
      setFormData({
        title: reward.title,
        subtitle: reward.subtitle || '',
        description: reward.description || '',
        image_url: reward.image_url || '',
        type: reward.type,
        category: reward.category,
        price: reward.price,
        currency: reward.currency,
        stock: reward.stock?.toString() || '',
        requires_approval: reward.requires_approval,
        tags: reward.tags || [],
        expires_at: reward.expires_at?.split('T')[0] || '',
        title_bosnian: reward.title_bosnian || '',
        subtitle_bosnian: reward.subtitle_bosnian || '',
        description_bosnian: reward.description_bosnian || ''
      })
    } else {
      setEditingReward(null)
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        type: 'PHYSICAL',
        category: 'electronics',
        price: 0,
        currency: 'COINS',
        stock: '',
        requires_approval: false,
        tags: [],
        expires_at: '',
        title_bosnian: '',
        subtitle_bosnian: '',
        description_bosnian: ''
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingReward(null)
  }

  function toggleTag(tag: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const filteredRewards = rewards.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  )

  const typeIcons = {
    PHYSICAL: Package,
    DIGITAL: Sparkles,
    PERK: ShieldCheck
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Rewards</h1>
          <p className="text-sm sm:text-base text-white/60 mt-1">Manage your reward catalog</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-500"
        >
          <Plus className="h-5 w-5" />
          Add Reward
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <input
          type="text"
          placeholder="Search rewards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Rewards Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredRewards.map((reward) => {
              const TypeIcon = typeIcons[reward.type]
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-white/5 overflow-hidden">
                      {reward.image_url ? (
                        <img
                          src={reward.image_url}
                          alt={reward.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white truncate">{reward.title}</p>
                      {reward.subtitle && (
                        <p className="text-xs text-white/50 truncate">{reward.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <TypeIcon className="h-3.5 w-3.5 text-white/60" />
                        <span className="text-xs text-white/60">{reward.type}</span>
                        <span className="text-xs text-white/40">•</span>
                        <span className="text-xs text-white/60 capitalize">{reward.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div>
                      <span className="text-white/50">Price: </span>
                      <span className="text-white font-medium">{reward.price.toLocaleString()} {reward.currency.toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="text-white/50">Stock: </span>
                      <span className="text-white/80">{reward.stock !== null ? reward.stock : '∞'}</span>
                    </div>
                  </div>

                  {reward.tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {reward.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            tag === 'FEATURED' ? 'bg-brand-500/20 text-brand-400' :
                            tag === 'LIMITED_TIME' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => openModal(reward)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              )
            })}
            {filteredRewards.length === 0 && (
              <div className="text-center py-12 text-white/50">
                No rewards found
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden">
            <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Reward</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Price</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Tags</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRewards.map((reward) => {
                const TypeIcon = typeIcons[reward.type]
                return (
                  <motion.tr
                    key={reward.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-white/5 overflow-hidden">
                          {reward.image_url ? (
                            <img
                              src={reward.image_url}
                              alt={reward.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{reward.title}</p>
                          {reward.subtitle && (
                            <p className="text-sm text-white/50">{reward.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-white/60" />
                        <span className="text-sm text-white/80">{reward.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/80 capitalize">{reward.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {reward.price.toLocaleString()} {reward.currency.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/80">
                        {reward.stock !== null ? reward.stock : '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {reward.tags?.map(tag => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              tag === 'FEATURED' ? 'bg-brand-500/20 text-brand-400' :
                              tag === 'LIMITED_TIME' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(reward)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reward.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {filteredRewards.length === 0 && (
            <div className="text-center py-12 text-white/50">
              No rewards found
            </div>
          )}
        </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Bosnian Translations Section */}
                <div className="sm:col-span-2 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                    🇧🇦 Bosnian Translations
                  </h3>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Title (Bosnian)</label>
                  <input
                    type="text"
                    value={formData.title_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_bosnian: e.target.value }))}
                    placeholder="Naslov na bosanskom..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Subtitle (Bosnian)</label>
                  <input
                    type="text"
                    value={formData.subtitle_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle_bosnian: e.target.value }))}
                    placeholder="Podnaslov na bosanskom..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Description (Bosnian)</label>
                  <textarea
                    rows={3}
                    value={formData.description_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_bosnian: e.target.value }))}
                    placeholder="Opis na bosanskom..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2 pb-2 border-b border-white/10"></div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Image</label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="Image URL or upload"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 sm:py-2.5 text-sm text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Upload size={18} />
                      )}
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="PHYSICAL">Physical</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="PERK">Perk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="electronics">Electronics</option>
                    <option value="apparel">Apparel</option>
                    <option value="accessories">Accessories</option>
                    <option value="experiences">Experiences</option>
                    <option value="gift-cards">Gift Cards</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Currency *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="COINS">Coins</option>
                    <option value="TOKENS">Tokens</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Stock (empty = unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {['FEATURED', 'LIMITED_TIME', 'REQUIRES_APPROVAL'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-brand-600 text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requires_approval}
                      onChange={(e) => setFormData(prev => ({ ...prev, requires_approval: e.target.checked }))}
                      className="rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs sm:text-sm text-white/80">Requires Approval</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="sm:flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors order-last sm:order-first"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sm:flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
                >
                  {editingReward ? 'Save Changes' : 'Create Reward'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
