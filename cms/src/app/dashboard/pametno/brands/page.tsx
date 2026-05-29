'use client';

import * as React from 'react';
import { Button, Card, Modal, Input, Textarea, ImageUpload, Alert, PageHeader } from '@/components/ui';
import { Plus, Pencil, Trash2, Globe, ShoppingBag } from 'lucide-react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';

interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  logo_url?: string;
  website_url?: string;
  marketplace_url?: string;
  founded?: string;
  headquarters?: string;
  values?: string[];
  // English translation
  description_en?: string;
}

function PametnoBrandsContent() {
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
    logo_url: '',
    website_url: '',
    marketplace_url: '',
    founded: '',
    headquarters: '',
    // English translation
    description_en: ''
  });
  
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/pametno/brands');
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
        logo_url: brand.logo_url || '',
        website_url: brand.website_url || '',
        marketplace_url: brand.marketplace_url || '',
        founded: brand.founded || '',
        headquarters: brand.headquarters || '',
        description_en: brand.description_en || ''
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        website_url: '',
        marketplace_url: '',
        founded: '',
        headquarters: '',
        description_en: ''
      });
    }
    setShowEnglish(false);
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingBrand 
      ? `/api/pametno/brands/${editingBrand.id}` 
      : '/api/pametno/brands';
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
      const response = await fetch(`/api/pametno/brands/${brand.id}`, {
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
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Brendovi"
        description="Pametno Odabrano brendovi"
        breadcrumb="Pametno Odabrano"
        action={
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Novi brend
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
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nema brendova
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Brend
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                    Linkovi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {/* Brand Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        {brand.logo_url ? (
                          <CmsThumbnail
                            src={brand.logo_url}
                            alt={brand.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain rounded bg-white border border-slate-200 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded shrink-0" />
                        )}
                        
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{brand.name}</div>
                          {brand.headquarters && (
                            <div className="text-xs text-slate-500 mt-0.5">{brand.headquarters}</div>
                          )}
                          {brand.founded && (
                            <div className="text-xs text-slate-400 mt-0.5">Osnovano: {brand.founded}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Links */}
                    <td className="px-4 py-3 w-32">
                      {!brand.website_url && !brand.marketplace_url ? (
                        <span className="text-slate-400 text-xs">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {brand.website_url && (
                            <a 
                              href={brand.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                              title="Web stranica"
                            >
                              <Globe className="w-3 h-3" />
                            </a>
                          )}
                          {brand.marketplace_url && (
                            <a 
                              href={brand.marketplace_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full hover:bg-emerald-200 transition-colors"
                              title="Marketplace"
                            >
                              <ShoppingBag className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3 w-16">
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openModal(brand)} className="w-full">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(brand)} className="w-full">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            value={formData.logo_url}
            onChange={(value) => setFormData({ ...formData, logo_url: value as string })}
          />
          
          <Input
            label="Web stranica"
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            placeholder="https://"
          />
          
          <Input
            label="Marketplace URL"
            type="url"
            value={formData.marketplace_url}
            onChange={(e) => setFormData({ ...formData, marketplace_url: e.target.value })}
            placeholder="https://"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Godina osnivanja"
              value={formData.founded}
              onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
              placeholder="npr. 1990"
            />
            
            <Input
              label="Sjedište"
              value={formData.headquarters}
              onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
              placeholder="npr. Sarajevo, BiH"
            />
          </div>
          
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
                <Textarea
                  label="Description (English)"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Brand description in English"
                />
              </div>
            )}
          </div>
          
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

export default function PametnoBrandsPage() {
  return <PametnoBrandsContent />;
}


