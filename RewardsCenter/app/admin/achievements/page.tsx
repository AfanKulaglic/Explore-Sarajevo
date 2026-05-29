'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Award,
  Trophy,
  Target,
  Zap,
  X
} from 'lucide-react'

interface Achievement {
  id: string
  slug: string
  title: string
  description?: string
  icon?: string
  category: 'SHOPPING' | 'SOCIAL' | 'TOURNAMENT' | 'LOYALTY' | 'SPECIAL'
  xp_reward: number
  coins_reward?: number
  tokens_reward?: number
  requirement_type?: string
  requirement_value?: number
  is_hidden: boolean
  is_active?: boolean
  created_at: string
  // Bosnian translations
  title_bosnian?: string
  description_bosnian?: string
}

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    icon: '🏆',
    category: 'SHOPPING' as 'SHOPPING' | 'SOCIAL' | 'TOURNAMENT' | 'LOYALTY' | 'SPECIAL',
    xp_reward: 100,
    coins_reward: 0,
    tokens_reward: 0,
    requirement_type: 'orders_count',
    requirement_value: 1,
    is_hidden: false,
    is_active: true,
    // Bosnian translations
    title_bosnian: '',
    description_bosnian: ''
  })

  const categories = ['ALL', 'SHOPPING', 'SOCIAL', 'TOURNAMENT', 'LOYALTY', 'SPECIAL']
  const requirementTypes = [
    { value: 'orders_count', label: 'Total Orders' },
    { value: 'coins_spent', label: 'Coins Spent' },
    { value: 'referrals_count', label: 'Referrals' },
    { value: 'tournaments_won', label: 'Tournaments Won' },
    { value: 'tournaments_joined', label: 'Tournaments Joined' },
    { value: 'level_reached', label: 'Level Reached' },
    { value: 'login_streak', label: 'Login Streak Days' },
    { value: 'first_purchase', label: 'First Purchase' },
    { value: 'custom', label: 'Custom (Manual)' }
  ]

  useEffect(() => {
    fetchAchievements()
  }, [categoryFilter])

  async function fetchAchievements() {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'ALL') params.set('category', categoryFilter)
      
      const res = await fetch(`/api/achievements?${params}`)
      const data = await res.json()
      setAchievements(data.data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const url = editingAchievement 
        ? `/api/achievements?id=${editingAchievement.id}` 
        : '/api/achievements'
      const method = editingAchievement ? 'PATCH' : 'POST'
      
      // Map title to name for the API
      const payload = {
        ...formData,
        name: formData.title // API expects 'name' but form uses 'title'
      }
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        fetchAchievements()
        closeModal()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save achievement')
      }
    } catch (error) {
      console.error('Error saving achievement:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this achievement?')) return
    
    try {
      const res = await fetch(`/api/achievements?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAchievements()
      }
    } catch (error) {
      console.error('Error deleting achievement:', error)
    }
  }

  async function toggleActive(achievement: Achievement) {
    try {
      const res = await fetch(`/api/achievements?id=${achievement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !achievement.is_active })
      })
      if (res.ok) {
        fetchAchievements()
      }
    } catch (error) {
      console.error('Error toggling achievement:', error)
    }
  }

  function openModal(achievement?: Achievement) {
    if (achievement) {
      setEditingAchievement(achievement)
      setFormData({
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description || '',
        icon: achievement.icon || '🏆',
        category: achievement.category,
        xp_reward: achievement.xp_reward,
        coins_reward: achievement.coins_reward ?? 0,
        tokens_reward: achievement.tokens_reward ?? 0,
        requirement_type: achievement.requirement_type || 'orders_count',
        requirement_value: achievement.requirement_value ?? 1,
        is_hidden: achievement.is_hidden,
        is_active: achievement.is_active ?? true,
        title_bosnian: achievement.title_bosnian || '',
        description_bosnian: achievement.description_bosnian || ''
      })
    } else {
      setEditingAchievement(null)
      setFormData({
        slug: '',
        title: '',
        description: '',
        icon: '🏆',
        category: 'SHOPPING',
        xp_reward: 100,
        coins_reward: 0,
        tokens_reward: 0,
        requirement_type: 'orders_count',
        requirement_value: 1,
        is_hidden: false,
        is_active: true,
        title_bosnian: '',
        description_bosnian: ''
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingAchievement(null)
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  }

  const filteredAchievements = achievements.filter(a =>
    (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.slug || '').toLowerCase().includes(search.toLowerCase())
  )

  const categoryConfig = {
    SHOPPING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Target },
    SOCIAL: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Award },
    TOURNAMENT: { bg: 'bg-violet-500/20', text: 'text-violet-400', icon: Trophy },
    LOYALTY: { bg: 'bg-rose-500/20', text: 'text-rose-400', icon: Zap },
    SPECIAL: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Award }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Achievements</h1>
          <p className="text-white/60 mt-1">Manage badges and achievements users can earn</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-500"
        >
          <Plus className="h-5 w-5" />
          Create Achievement
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryConfig).map(([cat, config]) => {
          const Icon = config.icon
          const count = achievements.filter(a => a.category === cat).length
          return (
            <div key={cat} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg} ${config.text}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-white/60">{cat}</div>
                  <div className="text-xl font-bold text-white">{count}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const config = categoryConfig[achievement.category] || { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Award }
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border bg-slate-900/50 p-4 ${
                  !achievement.is_active ? 'border-white/5 opacity-60' : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${config.bg} text-3xl flex-shrink-0`}>
                    {achievement.icon || '🏆'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">{achievement.title}</h3>
                      {achievement.is_hidden && (
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/40 text-xs">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-1 line-clamp-2">
                      {achievement.description || 'No description'}
                    </p>
                    
                    {/* Rewards */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {achievement.xp_reward > 0 && (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                          +{achievement.xp_reward} XP
                        </span>
                      )}
                      {(achievement.coins_reward ?? 0) > 0 && (
                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          +{achievement.coins_reward} Coins
                        </span>
                      )}
                      {(achievement.tokens_reward ?? 0) > 0 && (
                        <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs">
                          +{achievement.tokens_reward} Tokens
                        </span>
                      )}
                    </div>

                    {/* Category & Requirement */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-white/40">
                      <span className={`px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
                        {achievement.category}
                      </span>
                      <span>•</span>
                      <span>{achievement.requirement_type}: {achievement.requirement_value}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => toggleActive(achievement)}
                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      achievement.is_active
                        ? 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                  >
                    {achievement.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => openModal(achievement)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(achievement.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {filteredAchievements.length === 0 && !loading && (
        <div className="text-center py-12 text-white/50">
          No achievements found
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingAchievement ? 'Edit Achievement' : 'Create Achievement'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        title: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value)
                      }))
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                    placeholder="First Purchase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white font-mono text-sm focus:border-brand-500 focus:outline-none"
                    placeholder="first_purchase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none resize-none"
                    placeholder="Make your first purchase in the store"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white text-2xl text-center focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="SHOPPING">Shopping</option>
                    <option value="SOCIAL">Social</option>
                    <option value="TOURNAMENT">Tournament</option>
                    <option value="LOYALTY">Loyalty</option>
                    <option value="SPECIAL">Special</option>
                  </select>
                </div>

                {/* Rewards */}
                <div>
                  <label className="block text-sm text-white/60 mb-1">XP Reward</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xp_reward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Coin Reward</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coins_reward}
                    onChange={(e) => setFormData(prev => ({ ...prev, coins_reward: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Token Reward</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tokens_reward}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokens_reward: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Requirement */}
                <div>
                  <label className="block text-sm text-white/60 mb-1">Requirement Type *</label>
                  <select
                    value={formData.requirement_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirement_type: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  >
                    {requirementTypes.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Requirement Value *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.requirement_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirement_value: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                {/* Flags */}
                <div className="col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_hidden}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_hidden: e.target.checked }))}
                      className="rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-white/80">Hidden (surprise)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-white/80">Active</span>
                  </label>
                </div>

                {/* Bosnian Translations Section */}
                <div className="col-span-2 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                    🇧🇦 Bosnian Translations
                  </h3>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1">Title (Bosnian)</label>
                  <input
                    type="text"
                    value={formData.title_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_bosnian: e.target.value }))}
                    placeholder="Naslov na bosanskom..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-white/60 mb-1">Description (Bosnian)</label>
                  <textarea
                    rows={2}
                    value={formData.description_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_bosnian: e.target.value }))}
                    placeholder="Opis na bosanskom..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

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
                  {editingAchievement ? 'Save Changes' : 'Create Achievement'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
