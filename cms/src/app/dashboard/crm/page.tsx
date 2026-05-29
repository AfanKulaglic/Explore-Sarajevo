'use client';

import * as React from 'react';
import { Button, Card, Modal, Input, Textarea, Alert, PageHeader } from '@/components/ui';
import { Plus, Pencil, Trash2, User, Phone, Building2, Globe, FileText, UserPlus, X } from 'lucide-react';

interface Contact {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  is_primary?: boolean;
  notes?: string;
}

interface CRMClient {
  id: number;
  name: string;
  pdv_broj?: string;
  id_broj?: string;
  websites?: string[];
  notes?: string;
  contacts?: Contact[];
  crm_brands?: { id: number; name: string; logo_url?: string }[];
}

function CRMContent() {
  const [clients, setClients] = React.useState<CRMClient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingClient, setEditingClient] = React.useState<CRMClient | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    pdv_broj: '',
    id_broj: '',
    websites: [''],
    notes: '',
    contacts: [] as Contact[]
  });
  
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/cms/crm/clients', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching CRM clients:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchClients();
  }, []);
  
  const openModal = (client?: CRMClient) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        pdv_broj: client.pdv_broj || '',
        id_broj: client.id_broj || '',
        websites: client.websites?.length ? client.websites : [''],
        notes: client.notes || '',
        contacts: client.contacts || []
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        pdv_broj: '',
        id_broj: '',
        websites: [''],
        notes: '',
        contacts: []
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingClient 
      ? `/api/cms/crm/clients/${editingClient.id}` 
      : '/api/cms/crm/clients';
    const method = editingClient ? 'PUT' : 'POST';
    
    // Filter out empty websites
    const filteredWebsites = formData.websites.filter(w => w.trim());
    // Filter out contacts without names
    const filteredContacts = formData.contacts.filter(c => c.name.trim());
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          websites: filteredWebsites,
          contacts: filteredContacts
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingClient ? 'Klijent ažuriran' : 'Klijent kreiran');
        setIsModalOpen(false);
        fetchClients();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (client: CRMClient) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${client.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/cms/crm/clients/${client.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Klijent obrisan');
        fetchClients();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  // Website management
  const addWebsite = () => {
    setFormData(prev => ({ ...prev, websites: [...prev.websites, ''] }));
  };
  
  const removeWebsite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index)
    }));
  };
  
  const updateWebsite = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      websites: prev.websites.map((w, i) => i === index ? value : w)
    }));
  };
  
  // Contact management
  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '', email: '', position: '', is_primary: false }]
    }));
  };
  
  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };
  
  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Upravljanje klijentima i njihovim brendovima"
        action={
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Novi klijent
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
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nema klijenata. Dodajte prvog klijenta.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Klijent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">
                    Kontakti
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">
                    Brendovi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    {/* Client Info */}
                    <td className="px-4 py-3">
                      <div className="py-1">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {client.name}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
                          {client.pdv_broj && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDV: {client.pdv_broj}
                            </span>
                          )}
                          {client.id_broj && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              ID: {client.id_broj}
                            </span>
                          )}
                        </div>
                        {client.websites && client.websites.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {client.websites.map((url, i) => (
                              <a 
                                key={i} 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              >
                                <Globe className="w-3 h-3" />
                                {(() => { try { return new URL(url).hostname; } catch { return url; } })()}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Contacts */}
                    <td className="px-4 py-3 w-40">
                      {client.contacts && client.contacts.length > 0 ? (
                        <div className="space-y-1">
                          {client.contacts.slice(0, 2).map((contact, i) => (
                            <div key={i} className="text-xs">
                              <div className="font-medium text-slate-700 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                {contact.name}
                                {contact.is_primary && (
                                  <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">Primarni</span>
                                )}
                              </div>
                              {contact.phone && (
                                <div className="text-slate-500 flex items-center gap-1 ml-4">
                                  <Phone className="w-3 h-3" />
                                  {contact.phone}
                                </div>
                              )}
                            </div>
                          ))}
                          {client.contacts.length > 2 && (
                            <div className="text-xs text-slate-400">
                              +{client.contacts.length - 2} više
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    
                    {/* Brands */}
                    <td className="px-4 py-3 w-40">
                      <div className="space-y-1">
                        {client.crm_brands && client.crm_brands.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {client.crm_brands.slice(0, 2).map((brand) => (
                              <span key={brand.id} className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                {brand.name}
                              </span>
                            ))}
                            {client.crm_brands.length > 2 && (
                              <span className="text-xs text-slate-400">+{client.crm_brands.length - 2}</span>
                            )}
                          </div>
                        )}
                        {(!client.crm_brands || client.crm_brands.length === 0) && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-3 w-16">
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openModal(client)} className="w-full">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(client)} className="w-full">
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
      
      {/* Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Uredi klijenta' : 'Novi klijent'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="Naziv firme *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Naziv firme ili klijenta"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="PDV broj"
                value={formData.pdv_broj}
                onChange={(e) => setFormData({ ...formData, pdv_broj: e.target.value })}
                placeholder="123456789012"
              />
              <Input
                label="ID broj"
                value={formData.id_broj}
                onChange={(e) => setFormData({ ...formData, id_broj: e.target.value })}
                placeholder="4123456789012"
              />
            </div>
          </div>
          
          {/* Websites */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Web stranice</label>
            {formData.websites.map((website, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={website}
                  onChange={(e) => updateWebsite(index, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                />
                {formData.websites.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeWebsite(index)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addWebsite}>
              <Plus className="w-4 h-4 mr-1" />
              Dodaj web stranicu
            </Button>
          </div>
          
          {/* Contacts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Kontakt osobe</label>
              <Button type="button" variant="secondary" size="sm" onClick={addContact}>
                <UserPlus className="w-4 h-4 mr-1" />
                Dodaj kontakt
              </Button>
            </div>
            
            {formData.contacts.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Nema dodanih kontakata</p>
            ) : (
              <div className="space-y-4">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Ime i prezime *"
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        placeholder="Ime Prezime"
                        required
                      />
                      <Input
                        label="Pozicija"
                        value={contact.position || ''}
                        onChange={(e) => updateContact(index, 'position', e.target.value)}
                        placeholder="Direktor, Menadžer..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Telefon"
                        value={contact.phone || ''}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        placeholder="+387 61 123 456"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => updateContact(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contact.is_primary || false}
                        onChange={(e) => updateContact(index, 'is_primary', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Primarni kontakt</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes */}
          <Textarea
            label="Bilješke"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Interne bilješke o klijentu..."
            rows={3}
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit">
              {editingClient ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CRMPage() {
  return <CRMContent />;
}


