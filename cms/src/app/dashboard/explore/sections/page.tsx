'use client';

import * as React from 'react';
import { Button, Table, Card, Modal, Input, Textarea, ImageUpload, Checkbox, Alert } from '@/components/ui';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import type { Column } from '@/components/ui/Table';

interface Section {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  is_active?: boolean;
  display_order?: number;
}

function SectionsContent() {
  const [sections, setSections] = React.useState<Section[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<Section | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    is_active: true,
    display_order: 0
  });
  
  const fetchSections = async () => {
    try {
      const response = await fetch('/api/explore/sections');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchSections();
  }, []);
  
  const openModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        name: section.name || '',
        slug: section.slug || '',
        description: section.description || '',
        icon: section.icon || '',
        image: section.image || '',
        is_active: section.is_active !== false,
        display_order: section.display_order || 0
      });
    } else {
      setEditingSection(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        image: '',
        is_active: true,
        display_order: sections.length
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingSection ? `/api/explore/sections/${editingSection.id}` : '/api/explore/sections';
    const method = editingSection ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingSection ? 'Sekcija ažurirana' : 'Sekcija kreirana');
        setIsModalOpen(false);
        fetchSections();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (section: Section) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${section.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/sections/${section.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Sekcija obrisana');
        fetchSections();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  const columns: Column<Section>[] = [
    { 
      key: 'order', 
      header: '',
      render: () => <GripVertical className="w-4 h-4 text-gray-400" />,
      className: 'w-8'
    },
    { key: 'name', header: 'Naziv' },
    { 
      key: 'is_active', 
      header: 'Aktivna',
      render: (s) => s.is_active !== false ? (
        <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">✓</span>
      ) : <span className="text-slate-400">—</span>,
      className: 'w-24'
    },
    { 
      key: 'display_order', 
      header: '#',
      render: (s) => (
        <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
          {s.display_order || 0}
        </span>
      ),
      className: 'w-16'
    },
    {
      key: 'actions',
      header: 'Akcije',
      render: (section) => (
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => openModal(section)} className="w-full">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(section)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
      className: 'w-16'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sekcije</h1>
          <p className="text-gray-500 mt-1">Sekcije za početnu stranicu Explore Sarajevo</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova sekcija
        </Button>
      </div>
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      <Card padding="none">
        <Table
          columns={columns}
          data={sections}
          keyExtractor={(s) => s.id}
          isLoading={isLoading}
          emptyMessage="Nema sekcija"
        />
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSection ? 'Uredi sekciju' : 'Nova sekcija'}
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
          
          <Input
            label="Redoslijed"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
          />
          
          <Checkbox
            label="Aktivna sekcija"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit">
              {editingSection ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function SectionsPage() {
  return <SectionsContent />;
}


