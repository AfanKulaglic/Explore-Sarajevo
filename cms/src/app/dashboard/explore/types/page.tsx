'use client';

import * as React from 'react';
import { Button, Table, Card, Modal, Input, Textarea, ImageUpload, Select, Alert, SearchFilter } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

interface Type {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  category_id?: number;
  category_name?: string;
  // English translations
  name_en?: string;
  description_en?: string;
}

interface Category {
  id: number;
  name: string;
}

function TypesContent() {
  const [types, setTypes] = React.useState<Type[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingType, setEditingType] = React.useState<Type | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    category_id: '',
    // English translations
    name_en: '',
    description_en: ''
  });
  
  const fetchData = async () => {
    try {
      const [typesRes, categoriesRes] = await Promise.all([
        fetch('/api/explore/types'),
        fetch('/api/explore/categories')
      ]);
      const [typesData, categoriesData] = await Promise.all([
        typesRes.json(),
        categoriesRes.json()
      ]);
      setTypes(Array.isArray(typesData) ? typesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchData();
  }, []);
  
  const openModal = (type?: Type) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name || '',
        slug: type.slug || '',
        description: type.description || '',
        icon: type.icon || '',
        image: type.image || '',
        category_id: type.category_id?.toString() || '',
        name_en: type.name_en || '',
        description_en: type.description_en || ''
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        category_id: '',
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
    
    const url = editingType ? `/api/explore/types/${editingType.id}` : '/api/explore/types';
    const method = editingType ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id ? Number(formData.category_id) : null
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingType ? 'Tip ažuriran' : 'Tip kreiran');
        setIsModalOpen(false);
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (type: Type) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${type.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/types/${type.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Tip obrisan');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  const columns: Column<Type>[] = [
    { key: 'name', header: 'Naziv' },
    { 
      key: 'category_name', 
      header: 'Kategorija',
      render: (type) => type.category_name ? (
        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
          {type.category_name}
        </span>
      ) : <span className="text-slate-400">—</span>
    },
    {
      key: 'actions',
      header: 'Akcije',
      render: (type) => (
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => openModal(type)} className="w-full">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(type)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
      className: 'w-16'
    }
  ];

  // Filter types based on search query
  const filteredTypes = React.useMemo(() => {
    return types.filter(type => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          type.name?.toLowerCase().includes(query) ||
          type.slug?.toLowerCase().includes(query) ||
          type.description?.toLowerCase().includes(query) ||
          type.category_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [types, searchQuery]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipovi</h1>
          <p className="text-gray-500 mt-1">Podkategorije za Explore Sarajevo</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novi tip
        </Button>
      </div>
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      {/* Search Filter */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search types by name, category..."
        showDateFilter={false}
      />
      
      <Card padding="none">
        <Table
          columns={columns}
          data={filteredTypes}
          keyExtractor={(t) => t.id}
          isLoading={isLoading}
          emptyMessage={searchQuery ? 'No types match your search' : 'Nema tipova'}
        />
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? 'Uredi tip' : 'Novi tip'}
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
            label="Kategorija"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Odaberi kategoriju"
          />
          
          <Input
            label="Ikona"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
                  placeholder="Type name in English"
                />
                
                <Textarea
                  label="Description (English)"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Type description in English"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit">
              {editingType ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function TypesPage() {
  return <TypesContent />;
}


