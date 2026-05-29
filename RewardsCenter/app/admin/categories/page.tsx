'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  GripVertical,
  X,
  ChevronDown
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📦',
    color: '#6366f1',
    sort_order: 0,
    is_active: true
  })

  const colorOptions = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/categories?id=${editingCategory.id}` 
        : '/api/categories'
      const method = editingCategory ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        fetchCategories()
        closeModal()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this category? Rewards in this category will become uncategorized.')) return
    
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  async function toggleActive(category: Category) {
    try {
      const res = await fetch(`/api/categories?id=${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !category.is_active })
      })
      if (res.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error toggling category:', error)
    }
  }

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function openModal(category?: Category) {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '📦',
        color: category.color || '#6366f1',
        sort_order: category.sort_order,
        is_active: category.is_active
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '📦',
        color: '#6366f1',
        sort_order: categories.length,
        is_active: true
      })
    }
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingCategory(null)
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Categories</h1>
          <p className="text-sm sm:text-base text-white/60 mt-1">Organize your rewards into categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-brand-500"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md rounded-xl border border-white/10 bg-white/5 py-2.5 sm:py-3 pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-white/60">Total Categories</div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{categories.length}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-white/60">Active</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {categories.filter(c => c.is_active).length}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-white/60">Inactive</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-400 mt-1">
            {categories.filter(c => !c.is_active).length}
          </div>
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category, index) => {
              const isExpanded = expandedId === category.id
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl border bg-slate-900/50 overflow-hidden ${
                    !category.is_active ? 'border-white/5 opacity-60' : 'border-white/10'
                  }`}
                >
                  {/* Mobile View */}
                  <div className="lg:hidden">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : category.id)}
                      className="w-full p-3 sm:p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-white truncate">{category.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          category.is_active
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-white/40 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 border-t border-white/5 pt-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-white/50">Slug: </span>
                                <span className="text-white/80 font-mono">{category.slug}</span>
                              </div>
                              <div>
                                <span className="text-white/50">Order: </span>
                                <span className="text-white/80">#{category.sort_order + 1}</span>
                              </div>
                            </div>
                            {category.description && (
                              <p className="text-xs text-white/60">{category.description}</p>
                            )}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleActive(category); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  category.is_active
                                    ? 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                }`}
                              >
                                {category.is_active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openModal(category); }}
                                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(category.id); }}
                                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:block p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <div className="text-white/20 cursor-grab">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      {/* Icon & Color */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon || '📦'}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{category.name}</h3>
                          <span className="text-xs text-white/40 font-mono">{category.slug}</span>
                        </div>
                        {category.description && (
                          <p className="text-sm text-white/60 mt-0.5 truncate">
                            {category.description}
                          </p>
                        )}
                      </div>

                      {/* Color Indicator */}
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />

                      {/* Order */}
                      <span className="text-sm text-white/40 w-8 text-center">
                        #{category.sort_order + 1}
                      </span>

                      {/* Status */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.is_active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(category)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            category.is_active
                              ? 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                          }`}
                        >
                          {category.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => openModal(category)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </div>
      )}

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12 text-white/50">
          <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No categories found</p>
          <p className="text-sm mt-1">Create your first category to organize rewards</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
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
                <label className="block text-xs sm:text-sm text-white/60 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug || generateSlug(e.target.value)
                    }))
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Gift Cards"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/60 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white font-mono focus:border-brand-500 focus:outline-none"
                  placeholder="gift-cards"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/60 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  placeholder="Redeemable gift cards for popular stores"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Icon (emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-white text-xl sm:text-2xl text-center focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-white/60 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-white/60 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-transform ${
                        formData.color === color ? 'scale-110 ring-2 ring-white/50' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-white/20 bg-white/5 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs sm:text-sm text-white/80">Active</span>
              </label>

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
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
