'use client';

import * as React from 'react';
import { Button, Card, Modal, Input, Alert, PageHeader } from '@/components/ui';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

interface TagItem {
  id: number;
  name: string;
  slug: string;
  name_en?: string;
}

function TagsContent() {
  const [tags, setTags] = React.useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<TagItem | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    name_en: ''
  });
  
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/pametno/tags');
      const data = await response.json();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchTags();
  }, []);
  
  const openModal = (tag?: TagItem) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        name: tag.name || '',
        slug: tag.slug || '',
        name_en: tag.name_en || ''
      });
    } else {
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        name_en: ''
      });
    }
    setShowEnglish(false);
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingTag 
      ? `/api/pametno/tags/${editingTag.id}` 
      : '/api/pametno/tags';
    const method = editingTag ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingTag ? 'Tag ažuriran' : 'Tag kreiran');
        setIsModalOpen(false);
        fetchTags();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (tag: TagItem) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${tag.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/pametno/tags/${tag.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Tag obrisan');
        fetchTags();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tagovi" 
        description="Pametno Odabrano tagovi za proizvode"
        action={
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Novi tag
          </Button>
        }
      />
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Učitavanje...</div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nema tagova</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Tag</th>
                <th className="text-left p-3 text-xs font-medium text-slate-500 uppercase">Slug</th>
                <th className="text-right p-3 text-xs font-medium text-slate-500 uppercase w-24">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium text-slate-900">{tag.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-500 text-sm font-mono">{tag.slug}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openModal(tag)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Uredi"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Obriši"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Uredi tag' : 'Novi tag'}
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
          
          {/* English Translation */}
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
              <div className="mt-3 pl-6 border-l-2 border-blue-200">
                <Input
                  label="Name (English)"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Tag name in English"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit">
              {editingTag ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function TagsPage() {
  return <TagsContent />;
}


