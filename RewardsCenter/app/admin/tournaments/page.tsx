'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Trophy,
  Users,
  Calendar,
  Flame,
  Clock,
  X,
  Award
} from 'lucide-react'

interface Tournament {
  id: string
  title: string
  description?: string
  image_url?: string
  type: 'SOLO' | 'TEAM' | 'BRACKET'
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
  start_date: string
  end_date: string
  entry_fee: number
  entry_currency: 'COINS' | 'TOKENS'
  max_participants: number
  current_participants: number
  team_size: number
  rules: string[]
  xp_reward: number
  featured: boolean
  prizes?: Array<{
    place: number
    coins: number
    xp: number
    tokens: number
    badge?: string
  }>
  created_at: string
  // Bosnian translations
  title_bosnian?: string
  description_bosnian?: string
  rules_bosnian?: string[]
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    image_url: string
    type: 'SOLO' | 'TEAM' | 'BRACKET'
    start_date: string
    end_date: string
    entry_fee: number
    entry_currency: 'COINS' | 'TOKENS'
    max_participants: number
    team_size: number
    rules: string
    xp_reward: number
    featured: boolean
    prizes: Array<{ place: number; coins: number; xp: number; tokens: number; badge: string }>
    // Bosnian translations
    title_bosnian: string
    description_bosnian: string
    rules_bosnian: string
  }>({
    title: '',
    description: '',
    image_url: '',
    type: 'SOLO',
    start_date: '',
    end_date: '',
    entry_fee: 0,
    entry_currency: 'COINS',
    max_participants: 100,
    team_size: 1,
    rules: '',
    xp_reward: 0,
    featured: false,
    prizes: [
      { place: 1, coins: 10000, xp: 1000, tokens: 0, badge: '🏆' },
      { place: 2, coins: 5000, xp: 500, tokens: 0, badge: '🥈' },
      { place: 3, coins: 2500, xp: 250, tokens: 0, badge: '🥉' }
    ],
    title_bosnian: '',
    description_bosnian: '',
    rules_bosnian: ''
  })

  useEffect(() => {
    fetchTournaments()
  }, [statusFilter])

  async function fetchTournaments() {
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      
      const res = await fetch(`/api/tournaments?${params}`)
      const data = await res.json()
      setTournaments(data.data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const payload = {
      ...formData,
      rules: formData.rules.split('\n').filter(r => r.trim()),
      rules_bosnian: formData.rules_bosnian.split('\n').filter(r => r.trim()),
      prizes: formData.prizes
    }

    try {
      const url = editingTournament ? `/api/tournaments/${editingTournament.id}` : '/api/tournaments'
      const method = editingTournament ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        fetchTournaments()
        closeModal()
      }
    } catch (error) {
      console.error('Error saving tournament:', error)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        fetchTournaments()
      }
    } catch (error) {
      console.error('Error updating tournament:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tournament?')) return
    
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTournaments()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete tournament')
      }
    } catch (error) {
      console.error('Error deleting tournament:', error)
    }
  }

  function openModal(tournament?: Tournament) {
    if (tournament) {
      setEditingTournament(tournament)
      setFormData({
        title: tournament.title,
        description: tournament.description || '',
        image_url: tournament.image_url || '',
        type: tournament.type,
        start_date: tournament.start_date?.split('T')[0] || '',
        end_date: tournament.end_date?.split('T')[0] || '',
        entry_fee: tournament.entry_fee,
        entry_currency: tournament.entry_currency,
        max_participants: tournament.max_participants,
        team_size: tournament.team_size,
        rules: tournament.rules?.join('\n') || '',
        xp_reward: tournament.xp_reward,
        featured: tournament.featured,
        prizes: tournament.prizes?.map(p => ({ ...p, badge: p.badge || '🏅' })) || [
          { place: 1, coins: 10000, xp: 1000, tokens: 0, badge: '🏆' },
          { place: 2, coins: 5000, xp: 500, tokens: 0, badge: '🥈' },
          { place: 3, coins: 2500, xp: 250, tokens: 0, badge: '🥉' }
        ],
        title_bosnian: tournament.title_bosnian || '',
        description_bosnian: tournament.description_bosnian || '',
        rules_bosnian: tournament.rules_bosnian?.join('\n') || ''
      })
    } else {
      setEditingTournament(null)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 8)
      
      setFormData({
        title: '',
        description: '',
        image_url: '',
        type: 'SOLO',
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        entry_fee: 0,
        entry_currency: 'COINS',
        max_participants: 100,
        team_size: 1,
        rules: '',
        xp_reward: 100,
        featured: false,
        prizes: [
          { place: 1, coins: 10000, xp: 1000, tokens: 0, badge: '🏆' },
          { place: 2, coins: 5000, xp: 500, tokens: 0, badge: '🥈' },
          { place: 3, coins: 2500, xp: 250, tokens: 0, badge: '🥉' }
        ],
        title_bosnian: '',
        description_bosnian: '',
        rules_bosnian: ''
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingTournament(null)
  }

  function updatePrize(index: number, field: string, value: any) {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }))
  }

  const filteredTournaments = tournaments.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const statusConfig = {
    UPCOMING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Calendar },
    LIVE: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Flame },
    COMPLETED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Trophy },
    CANCELLED: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tournaments</h1>
          <p className="text-sm sm:text-base text-white/60 mt-1">Manage competitions and prizes</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-500"
        >
          <Plus className="h-5 w-5" />
          Create Tournament
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'UPCOMING', 'LIVE', 'COMPLETED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => {
            const config = statusConfig[tournament.status]
            const StatusIcon = config.icon
            return (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden"
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-brand-600/20 to-violet-600/20 relative">
                  {tournament.image_url && (
                    <img
                      src={tournament.image_url}
                      alt={tournament.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {tournament.featured && (
                      <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                        Featured
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full ${config.bg} ${config.text} text-xs font-medium flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {tournament.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-white">{tournament.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {tournament.current_participants}/{tournament.max_participants}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      {tournament.type}
                    </span>
                  </div>

                  <div className="text-sm text-white/60">
                    {tournament.entry_fee > 0 ? (
                      <span>{tournament.entry_fee} {tournament.entry_currency.toLowerCase()} entry</span>
                    ) : (
                      <span className="text-emerald-400">Free entry</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {tournament.status === 'UPCOMING' && (
                      <button
                        onClick={() => updateStatus(tournament.id, 'LIVE')}
                        className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {tournament.status === 'LIVE' && (
                      <button
                        onClick={() => updateStatus(tournament.id, 'COMPLETED')}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => openModal(tournament)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tournament.id)}
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

      {filteredTournaments.length === 0 && !loading && (
        <div className="text-center py-12 text-white/50">
          No tournaments found
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-0 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {editingTournament ? 'Edit Tournament' : 'Create Tournament'}
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
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="SOLO">Solo</option>
                    <option value="TEAM">Team</option>
                    <option value="BRACKET">Bracket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Max Participants *</label>
                  <input
                    type="number"
                    required
                    min="2"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 100 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Entry Fee</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.entry_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, entry_fee: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Entry Currency</label>
                  <select
                    value={formData.entry_currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, entry_currency: e.target.value as any }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="COINS">Coins</option>
                    <option value="TOKENS">Tokens</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Participation XP</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xp_reward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer h-full pt-0 sm:pt-6">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs sm:text-sm text-white/80">Featured Tournament</span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Rules (one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.rules}
                    onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                    placeholder="Enter rules, one per line..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none resize-none"
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
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Description (Bosnian)</label>
                  <textarea
                    rows={2}
                    value={formData.description_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_bosnian: e.target.value }))}
                    placeholder="Opis na bosanskom..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Rules (Bosnian - one per line)</label>
                  <textarea
                    rows={3}
                    value={formData.rules_bosnian}
                    onChange={(e) => setFormData(prev => ({ ...prev, rules_bosnian: e.target.value }))}
                    placeholder="Unesite pravila, jedno po liniji..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none resize-none"
                  />
                </div>
                <div className="sm:col-span-2 pb-2 border-b border-white/10"></div>

                {/* Prizes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm text-white/60 mb-2">Prizes</label>
                  <div className="space-y-3">
                    {formData.prizes.map((prize, index) => (
                      <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/5 text-base sm:text-lg">
                          {prize.badge}
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={prize.coins}
                          onChange={(e) => updatePrize(index, 'coins', parseInt(e.target.value) || 0)}
                          placeholder="Coins"
                          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          value={prize.xp}
                          onChange={(e) => updatePrize(index, 'xp', parseInt(e.target.value) || 0)}
                          placeholder="XP"
                          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          value={prize.tokens}
                          onChange={(e) => updatePrize(index, 'tokens', parseInt(e.target.value) || 0)}
                          placeholder="Tokens"
                          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
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
                  {editingTournament ? 'Save Changes' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
