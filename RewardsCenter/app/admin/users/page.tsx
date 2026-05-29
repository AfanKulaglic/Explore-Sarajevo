'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  Coins,
  Sparkles,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  coins?: number
  tokens?: number
  xp?: number
  level?: number
  created_at: string
  last_seen?: string
  is_banned?: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const limit = 20

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  async function fetchUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      if (search) params.set('search', search)
      
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      
      setUsers(data.data || [])
      setTotalPages(Math.ceil((data.total || 0) / limit))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Users</h1>
          <p className="text-sm sm:text-base text-white/60 mt-1">View and manage user accounts from Account-System</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <input
          type="text"
          placeholder="Search by email or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
        />
      </form>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-brand-500/20 text-brand-400">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/60">Total Users</div>
              <div className="text-lg sm:text-xl font-bold text-white">{users.length > 0 ? `${users.length}+` : '0'}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/60">Avg Coins</div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {users.length > 0 
                  ? Math.round(users.reduce((acc, u) => acc + (u.coins || 0), 0) / users.length).toLocaleString()
                  : '0'
                }
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/20 text-violet-400">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/60">Avg XP</div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {users.length > 0 
                  ? Math.round(users.reduce((acc, u) => acc + (u.xp || 0), 0) / users.length).toLocaleString()
                  : '0'
                }
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm text-white/60">Avg Level</div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {users.length > 0 
                  ? Math.round(users.reduce((acc, u) => acc + (u.level || 1), 0) / users.length)
                  : '1'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table/Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {users.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedUser(user)}
                className="rounded-xl border border-white/10 bg-slate-900/50 p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-white font-medium">
                        {(user.name || user.email || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white truncate">
                      {user.name || user.email?.split('@')[0] || 'Anonymous'}
                    </div>
                    <div className="text-xs text-white/50 truncate">{user.email}</div>
                  </div>
                  {user.is_banned ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium shrink-0">
                      Banned
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <div className="text-amber-400 font-medium">{(user.coins || 0).toLocaleString()}</div>
                    <div className="text-white/40">Coins</div>
                  </div>
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <div className="text-violet-400 font-medium">{(user.tokens || 0).toLocaleString()}</div>
                    <div className="text-white/40">Tokens</div>
                  </div>
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <div className="text-emerald-400 font-medium">{(user.xp || 0).toLocaleString()}</div>
                    <div className="text-white/40">XP</div>
                  </div>
                  <div className="rounded-lg bg-white/5 py-1.5">
                    <div className="text-blue-400 font-medium">Lv.{user.level || 1}</div>
                    <div className="text-white/40">Level</div>
                  </div>
                </div>
              </motion.div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-12 text-white/50">
                No users found
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-white/60">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Email</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-white/60">Coins</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-white/60">Tokens</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-white/60">XP / Level</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Joined</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-white font-medium">
                              {(user.name || user.email || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.name || user.email?.split('@')[0] || 'Anonymous'}
                          </div>
                          <div className="text-xs text-white/40">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80">{user.email}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-amber-400 font-medium">
                        {(user.coins || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-violet-400 font-medium">
                        {(user.tokens || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-medium">
                        {(user.xp || 0).toLocaleString()}
                      </span>
                      <span className="text-white/40 ml-1">/ Lv.{user.level || 1}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_banned ? (
                        <span className="px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                          Active
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12 text-white/50">
                No users found
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
                <div className="text-sm text-white/60">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Pagination */}
          {totalPages > 1 && (
            <div className="lg:hidden flex items-center justify-between px-2 py-3 border-t border-white/10">
              <div className="text-sm text-white/60">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white text-xl sm:text-2xl font-medium">
                    {(selectedUser.name || selectedUser.email || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                  {selectedUser.name || selectedUser.email?.split('@')[0] || 'Anonymous'}
                </h3>
                <p className="text-white/60 text-xs sm:text-sm truncate">{selectedUser.email}</p>
                <p className="text-white/40 text-xs mt-1 truncate">ID: {selectedUser.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="rounded-xl bg-white/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Coins</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {(selectedUser.coins || 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Tokens</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {(selectedUser.tokens || 0).toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">Level</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {selectedUser.level || 1}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">XP</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {(selectedUser.xp || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm border-t border-white/10 pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between">
                <span className="text-white/60">Joined</span>
                <span className="text-white">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
              {selectedUser.last_seen && (
                <div className="flex justify-between">
                  <span className="text-white/60">Last seen</span>
                  <span className="text-white">{new Date(selectedUser.last_seen).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/60">Status</span>
                <span className={selectedUser.is_banned ? 'text-rose-400' : 'text-emerald-400'}>
                  {selectedUser.is_banned ? 'Banned' : 'Active'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors order-last sm:order-first"
              >
                Close
              </button>
              <a
                href={`/admin/orders?user=${selectedUser.id}`}
                className="sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-500 transition-colors"
              >
                View Orders
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
