'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardHeader, Input, Textarea, ImageUpload, Alert } from '@/components/ui';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

function EventFormContent() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  
  const [isLoading, setIsLoading] = React.useState(!isNew);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    start_date: '',
    end_date: '',
    image: '',
    website: '',
    // English translations
    name_en: '',
    description_en: '',
    price_info_en: ''
  });
  
  React.useEffect(() => {
    if (!isNew) {
      const fetchEvent = async () => {
        try {
          const response = await fetch(`/api/explore/events/${params.id}`);
          const data = await response.json();
          
          if (data) {
            setFormData({
              name: data.name || '',
              slug: data.slug || '',
              description: data.description || '',
              location: data.location || '',
              address: data.address || '',
              latitude: data.latitude?.toString() || '',
              longitude: data.longitude?.toString() || '',
              start_date: data.start_date?.split('T')[0] || '',
              end_date: data.end_date?.split('T')[0] || '',
              image: data.image || '',
              website: data.website || '',
              // English translations
              name_en: data.name_en || '',
              description_en: data.description_en || '',
              price_info_en: data.price_info_en || ''
            });
          }
        } catch (error) {
          console.error('Error fetching event:', error);
          setError('Greška pri učitavanju događaja');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [isNew, params.id]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: isNew ? slugify(name) : formData.slug
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    const url = isNew ? '/api/explore/events' : `/api/explore/events/${params.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Događaj sačuvan');
        setTimeout(() => router.push('/dashboard/explore/events'), 1000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/explore/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nazad
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Novi događaj' : 'Uredi događaj'}
          </h1>
          <p className="text-gray-500">
            {isNew ? 'Kreirajte novi događaj' : formData.name}
          </p>
        </div>
      </div>
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Osnovne informacije" />
              <div className="p-6 space-y-4">
                <Input
                  label="Naziv"
                  value={formData.name}
                  onChange={handleNameChange}
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
                  rows={5}
                />
              </div>
            </Card>
            
            {/* English Translations */}
            <Card>
              <button
                type="button"
                onClick={() => setShowEnglish(!showEnglish)}
                className="w-full flex items-center justify-between text-left p-4"
              >
                <div className="flex items-center gap-2">
                  <span>🇬🇧</span>
                  <span className="font-semibold text-slate-700">English Translation</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-slate-400 transition-transform ${showEnglish ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showEnglish && (
                <div className="p-6 pt-0 space-y-4 border-t border-slate-200">
                  <Input
                    label="Name (English)"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Event name in English"
                  />
                  
                  <Textarea
                    label="Description (English)"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Event description in English..."
                    rows={5}
                  />
                  
                  <Input
                    label="Price Info (English)"
                    value={formData.price_info_en}
                    onChange={(e) => setFormData({ ...formData, price_info_en: e.target.value })}
                    placeholder="e.g. Free, 10 BAM"
                  />
                </div>
              )}
            </Card>
            
            <Card>
              <CardHeader title="Datum i vrijeme" />
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Datum početka"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                  <Input
                    label="Datum završetka"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            </Card>
            
            <Card>
              <CardHeader title="Lokacija" />
              <div className="p-6 space-y-4">
                <Input
                  label="Naziv lokacije"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="npr. BKC, Dom Mladih"
                />
                
                <Input
                  label="Adresa"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
                
                <Input
                  label="Web stranica"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Objavljivanje" />
              <div className="p-6 space-y-4">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isNew ? 'Kreiraj' : 'Spremi'}
                </Button>
              </div>
            </Card>
            
            <Card>
              <CardHeader title="Slika" />
              <div className="p-6">
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value as string })}
                />
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EventFormPage() {
  return <EventFormContent />;
}
