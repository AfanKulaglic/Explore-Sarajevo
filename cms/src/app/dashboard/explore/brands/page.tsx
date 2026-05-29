'use client';

import * as React from 'react';
import { Button, Table, Card, Modal, Input, Textarea, ImageUpload, Alert } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';
import type { Column } from '@/components/ui/Table';

interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
}

function BrandsContent() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBrand, setEditingBrand] = React.useState<Brand | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: ''
  });
  
  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/explore/brands');
      const data = await response.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchBrands();
  }, []);
  
  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name || '',
        slug: brand.slug || '',
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || ''
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        website: ''
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingBrand ? `/api/explore/brands/${editingBrand.id}` : '/api/explore/brands';
    const method = editingBrand ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingBrand ? 'Brend ažuriran' : 'Brend kreiran');
        setIsModalOpen(false);
        fetchBrands();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${brand.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/brands/${brand.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Brend obrisan');
        fetchBrands();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  const columns: Column<Brand>[] = [
    { 
      key: 'logo', 
      header: '',
      render: (b) => b.logo ? (
        <CmsThumbnail
          src={b.logo}
          alt={b.name}
          width={40}
          height={40}
          className="w-10 h-10 object-contain rounded"
        />
      ) : <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">—</div>,
      className: 'w-16'
    },
    { key: 'name', header: 'Naziv' },
    { 
      key: 'website', 
      header: 'Web',
      render: (b) => {
        if (!b.website) return <span className="text-slate-400">—</span>;
        try {
          return (
            <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              {new URL(b.website).hostname}
            </a>
          );
        } catch {
          return <span className="text-slate-400">—</span>;
        }
      }
    },
    {
      key: 'actions',
      header: 'Akcije',
      render: (brand) => (
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => openModal(brand)} className="w-full">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(brand)} className="w-full">
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
          <h1 className="text-2xl font-bold text-gray-900">Brendovi</h1>
          <p className="text-gray-500 mt-1">Upravljanje brendovima za Explore Sarajevo</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novi brend
        </Button>
      </div>
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      <Card padding="none">
        <Table
          columns={columns}
          data={brands}
          keyExtractor={(b) => b.id}
          isLoading={isLoading}
          emptyMessage="Nema brendova"
        />
      </Card>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Uredi brend' : 'Novi brend'}
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
          
          <ImageUpload
            label="Logo"
            value={formData.logo}
            onChange={(value) => setFormData({ ...formData, logo: value as string })}
          />
          
          <Input
            label="Web stranica"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://"
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit">
              {editingBrand ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function BrandsPage() {
  return <BrandsContent />;
}


