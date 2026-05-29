'use client';

import * as React from 'react';
import { Button, Card, Modal, Input, Textarea, ImageUpload, Checkbox, Alert, SearchFilter } from '@/components/ui';
import { Plus, Pencil, Trash2, Star, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  featured_category?: boolean;
  display_order?: number;
  // English translations
  name_en?: string;
  description_en?: string;
}

// Sortable Row Component
function SortableRow({ 
  category, 
  index,
  onEdit,
  onDelete 
}: { 
  category: Category;
  index: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        isDragging ? 'bg-blue-50 shadow-lg z-50 relative' : ''
      }`}
    >
      {/* Drag Handle */}
      <td className="w-10 px-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      
      {/* Category Info */}
      <td className="px-4 py-3">
        <div className="py-1">
          <div className="font-semibold text-slate-900">{category.name}</div>
          {category.description && (
            <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{category.description}</div>
          )}
        </div>
      </td>
      
      {/* Featured Status + Order */}
      <td className="px-4 py-3 w-32">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
            {index + 1}
          </span>
          {category.featured_category && (
            <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
              <Star className="w-3 h-3" />
            </span>
          )}
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3 w-16">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} className="w-full">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function CategoriesContent() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    featured_category: false,
    // English translations
    name_en: '',
    description_en: ''
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/explore/categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchCategories();
  }, []);
  
  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || '',
        image: category.image || '',
        featured_category: category.featured_category || false,
        name_en: category.name_en || '',
        description_en: category.description_en || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        featured_category: false,
        name_en: '',
        description_en: ''
      });
    }
    setShowEnglish(false);
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingCategory 
      ? `/api/explore/categories/${editingCategory.id}` 
      : '/api/explore/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      slug: formData.slug.trim() || undefined,
    };
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingCategory ? 'Category updated' : 'Category created');
        setIsModalOpen(false);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error saving');
      }
    } catch {
      setError('Error saving');
    }
  };
  
  const handleDelete = async (category: Category) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${category.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/categories/${category.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Category deleted');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Error deleting category');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);
    
    // Optimistically update UI
    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setCategories(newOrder);
    
    // Save new order to backend
    setIsSavingOrder(true);
    try {
      const orderedIds = newOrder.map(c => c.id);
      
      const response = await fetch('/api/explore/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: orderedIds }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        fetchCategories();
        setError('Error saving order');
      }
    } catch {
      fetchCategories();
      setError('Error saving order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          category.name?.toLowerCase().includes(query) ||
          category.slug?.toLowerCase().includes(query) ||
          category.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [categories, searchQuery]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Manage categories for Explore Sarajevo</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      {/* Search Filter */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search categories by name..."
        showDateFilter={false}
      />
      
      {/* Reorder hint */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
        <GripVertical className="w-4 h-4" />
        <span>Drag rows to change display order (affects featured categories on homepage)</span>
        {isSavingOrder && (
          <span className="ml-auto text-blue-600 flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        )}
      </div>
      
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No categories match your search' : 'No categories'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredCategories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-10 px-2 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                        # / Featured
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        index={index}
                        onEdit={openModal}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => {
              if (!formData.slug.trim() && formData.name.trim()) {
                const slug = formData.name
                  .toLowerCase()
                  .replace(/đ/g, 'd')
                  .replace(/[ćč]/g, 'c')
                  .replace(/š/g, 's')
                  .replace(/ž/g, 'z')
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/[\s_]+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-+|-+$/g, '');
                setFormData((prev) => ({ ...prev, slug }));
              }
            }}
            required
          />
          
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            helperText="URL-friendly version of the name"
          />
          
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <Input
            label="Icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          
          <ImageUpload
            label="Image"
            value={formData.image}
            onChange={(value) => setFormData({ ...formData, image: value as string })}
          />
          
          <Checkbox
            label="Featured Category"
            hint="Show on homepage category grid"
            checked={formData.featured_category}
            onChange={(e) => setFormData({ ...formData, featured_category: e.target.checked })}
          />
          
          {/* English Translations */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowEnglish(!showEnglish)}
              className="w-full flex items-center justify-between text-left hover:bg-slate-50 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🇬🇧</span>
                <span className="font-medium text-slate-700">English Translation</span>
              </div>
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform ${showEnglish ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showEnglish && (
              <div className="mt-3 space-y-3 pl-6 border-l-2 border-blue-200">
                <Input
                  label="Name (English)"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Category name in English"
                />
                
                <Textarea
                  label="Description (English)"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Category description in English"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CategoriesPage() {
  return <CategoriesContent />;
}


