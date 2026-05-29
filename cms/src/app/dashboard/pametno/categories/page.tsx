'use client';

import * as React from 'react';
import { Button, Card, Modal, Input, Textarea, ImageUpload, Select, Alert, PageHeader } from '@/components/ui';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent_id?: number | null;
  display_order?: number;
  is_active?: boolean;
  // English translations
  name_en?: string;
  description_en?: string;
}

function PamettnoCategoriesContent() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parent_id: '',
    // English translations
    name_en: '',
    description_en: ''
  });
  
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/pametno/categories');
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
        image: category.image || '',
        parent_id: category.parent_id?.toString() || '',
        // English translations
        name_en: category.name_en || '',
        description_en: category.description_en || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        parent_id: '',
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
      ? `/api/pametno/categories/${editingCategory.id}` 
      : '/api/pametno/categories';
    const method = editingCategory ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id ? Number(formData.parent_id) : null
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingCategory ? 'Kategorija ažurirana' : 'Kategorija kreirana');
        setIsModalOpen(false);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (category: Category) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${category.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/pametno/categories/${category.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Kategorija obrisana');
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  // Get root categories for parent select
  const rootCategories = categories.filter(c => !c.parent_id);
  
  // Get children for a category
  const getChildren = (parentId: number) => categories.filter(c => c.parent_id === parentId);
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategorije"
        description="Pametno Odabrano kategorije proizvoda"
        breadcrumb="Pametno Odabrano"
        action={
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Nova kategorija
          </Button>
        }
      />
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nema kategorija
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kategorija
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Root categories first, then children */}
                {rootCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      {/* Category Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Image */}
                          {category.image ? (
                            <CmsThumbnail
                              src={category.image}
                              alt={category.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded bg-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded shrink-0 flex items-center justify-center">
                              <FolderTree className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">{category.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{category.slug}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-4 py-3 w-32">
                        {category.is_active !== false ? (
                          <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Aktivna
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                            Neaktivna
                          </span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-3 w-16">
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openModal(category)} className="w-full">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(category)} className="w-full">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Child categories */}
                    {getChildren(category.id).map((child) => (
                      <tr key={child.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors bg-slate-50/50">
                        {/* Child Category Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 pl-8">
                            <div className="w-4 h-4 border-l-2 border-b-2 border-slate-300 rounded-bl" />
                            
                            {child.image ? (
                              <CmsThumbnail
                                src={child.image}
                                alt={child.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 object-cover rounded bg-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-slate-100 rounded shrink-0" />
                            )}
                            
                            <div className="min-w-0">
                              <div className="font-medium text-slate-800">{child.name}</div>
                              <div className="text-xs text-slate-500">{child.slug}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Status */}
                        <td className="px-4 py-3 w-32">
                          {child.is_active !== false ? (
                            <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              Aktivna
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                              Neaktivna
                            </span>
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td className="px-4 py-3 w-16">
                          <div className="flex flex-col gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openModal(child)} className="w-full">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(child)} className="w-full">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Uredi kategoriju' : 'Nova kategorija'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Naziv"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          
          <Textarea
            label="Opis"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <Select
            label="Nadkategorija"
            value={formData.parent_id}
            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
            options={rootCategories
              .filter(c => c.id !== editingCategory?.id)
              .map(c => ({ value: c.id, label: c.name }))}
            placeholder="Bez nadkategorije"
          />
          
          <ImageUpload
            label="Slika"
            value={formData.image}
            onChange={(value) => setFormData({ ...formData, image: value as string })}
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
              Odustani
            </Button>
            <Button type="submit">
              {editingCategory ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function PametnoCategoriesPage() {
  return <PamettnoCategoriesContent />;
}


