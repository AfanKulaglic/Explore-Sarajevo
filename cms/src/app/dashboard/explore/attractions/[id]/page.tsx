'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardHeader, Input, ImageUpload, Alert, RichTextEditor, WorkingHours } from '@/components/ui';
import type { WorkingHoursData } from '@/components/ui/WorkingHours';
import { ArrowLeft, Loader2, Save, Star, Crown, Home } from 'lucide-react';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Type {
  id: number;
  name: string;
  category_id?: number;
}

interface Section {
  id: number;
  name: string;
  is_active?: boolean;
}

interface CategoryRelationship {
  id: number;
  name?: string;
  is_highlight: boolean;
  is_premium: boolean;
}

interface SectionRelationship {
  id: number;
  name?: string;
  is_highlight: boolean;
  is_premium: boolean;
}

function AttractionFormContent() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  
  const [isLoading, setIsLoading] = React.useState(!isNew);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [hasChanges, setHasChanges] = React.useState(false);
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [types, setTypes] = React.useState<Type[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [initialFormData, setInitialFormData] = React.useState<string>('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    working_hours: null as WorkingHoursData | string | null,
    image: '',
    images: [] as string[],
    featured_location: false,
    display_order: 0,
    category_relationships: [] as CategoryRelationship[],
    type_ids: [] as number[],
    section_relationships: [] as SectionRelationship[],
    // English translations
    name_en: '',
    description_en: '',
    address_en: '',
    price_info_en: '',
    opening_hours_en: ''
  });
  
  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch categories, types, and sections
      try {
        const [catResponse, typesResponse, sectionsResponse] = await Promise.all([
          fetch('/api/explore/categories'),
          fetch('/api/explore/types'),
          fetch('/api/explore/sections')
        ]);
        
        const [catData, typesData, sectionsData] = await Promise.all([
          catResponse.json(),
          typesResponse.json(),
          sectionsResponse.json()
        ]);
        
        setCategories(Array.isArray(catData) ? catData : []);
        setTypes(Array.isArray(typesData) ? typesData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData.filter((s: Section) => s.is_active !== false) : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      
      // Fetch attraction if editing
      if (!isNew) {
        try {
          const response = await fetch(`/api/explore/attractions/${params.id}`);
          const data = await response.json();
          
          if (data) {
            // Parse media field - can be JSON string or array
            let images: string[] = [];
            if (data.media) {
              if (typeof data.media === 'string') {
                try {
                  images = JSON.parse(data.media);
                } catch {
                  images = [data.media];
                }
              } else if (Array.isArray(data.media)) {
                images = data.media;
              }
            }
            
            // Parse location field (stored as "lat, lng" string)
            let latitude = '';
            let longitude = '';
            if (data.location && typeof data.location === 'string' && data.location.includes(',')) {
              const [lat, lng] = data.location.split(',').map((s: string) => s.trim());
              latitude = lat || '';
              longitude = lng || '';
            }
            
            const loadedFormData = {
              name: data.name || '',
              slug: data.slug || '',
              description: data.description || '',
              address: data.address || '',
              latitude,
              longitude,
              phone: data.phone || '',
              email: data.email || '',
              website: data.website || '',
              working_hours: data.opening_hours || null,
              image: data.image || '',
              images: images,
              featured_location: data.featured_location || false,
              display_order: data.display_order || 0,
              category_relationships: (data.categories || []).map((c: { id: number; name?: string; is_highlight?: boolean; is_premium?: boolean }) => ({
                id: c.id,
                name: c.name,
                is_highlight: c.is_highlight || false,
                is_premium: c.is_premium || false
              })),
              type_ids: data.types?.map((t: Type) => t.id) || [],
              section_relationships: (data.sections || []).map((s: { id: number; name?: string; is_highlight?: boolean; is_premium?: boolean }) => ({
                id: s.id,
                name: s.name,
                is_highlight: s.is_highlight || false,
                is_premium: s.is_premium || false
              })),
              // English translations
              name_en: data.name_en || '',
              description_en: data.description_en || '',
              address_en: data.address_en || '',
              price_info_en: data.price_info_en || '',
              opening_hours_en: data.opening_hours_en || ''
            };
            
            setFormData(loadedFormData);
            // Store initial data for change detection
            setInitialFormData(JSON.stringify({
              ...loadedFormData,
              category_relationships: loadedFormData.category_relationships.map((r: { id: number; is_highlight?: boolean; is_premium?: boolean }) => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium })),
              section_relationships: loadedFormData.section_relationships.map((r: { id: number; is_highlight?: boolean; is_premium?: boolean }) => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium }))
            }));
          }
        } catch (error) {
          console.error('Error fetching attraction:', error);
          setError('Error loading attraction');
        }
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [isNew, params.id]);
  
  // Track changes
  React.useEffect(() => {
    if (isNew) {
      setHasChanges(formData.name.length > 0);
    } else if (initialFormData) {
      const currentData = JSON.stringify({
        ...formData,
        category_relationships: formData.category_relationships.map(r => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium })),
        section_relationships: formData.section_relationships.map(r => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium }))
      });
      setHasChanges(currentData !== initialFormData);
    }
  }, [formData, initialFormData, isNew]);
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: isNew ? slugify(name) : formData.slug
    });
  };
  
  // Category relationship handlers
  const toggleCategory = (categoryId: number) => {
    setFormData(prev => {
      const exists = prev.category_relationships.find(r => r.id === categoryId);
      if (exists) {
        return {
          ...prev,
          category_relationships: prev.category_relationships.filter(r => r.id !== categoryId)
        };
      } else {
        return {
          ...prev,
          category_relationships: [...prev.category_relationships, { id: categoryId, is_highlight: false, is_premium: false }]
        };
      }
    });
  };

  const toggleCategoryFlag = (categoryId: number, flag: 'is_highlight' | 'is_premium') => {
    setFormData(prev => ({
      ...prev,
      category_relationships: prev.category_relationships.map(r =>
        r.id === categoryId ? { ...r, [flag]: !r[flag] } : r
      )
    }));
  };

  // Section relationship handlers
  const toggleSection = (sectionId: number) => {
    setFormData(prev => {
      const exists = prev.section_relationships.find(r => r.id === sectionId);
      if (exists) {
        return {
          ...prev,
          section_relationships: prev.section_relationships.filter(r => r.id !== sectionId)
        };
      } else {
        return {
          ...prev,
          section_relationships: [...prev.section_relationships, { id: sectionId, is_highlight: false, is_premium: false }]
        };
      }
    });
  };

  const toggleSectionFlag = (sectionId: number, flag: 'is_highlight' | 'is_premium') => {
    setFormData(prev => ({
      ...prev,
      section_relationships: prev.section_relationships.map(r =>
        r.id === sectionId ? { ...r, [flag]: !r[flag] } : r
      )
    }));
  };

  const toggleArrayItem = (arr: number[], item: number) => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    const url = isNew ? '/api/explore/attractions' : `/api/explore/attractions/${params.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      address: formData.address,
      location: formData.latitude && formData.longitude 
        ? `${formData.latitude}, ${formData.longitude}` 
        : null,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      opening_hours: formData.working_hours,
      media: JSON.stringify(formData.images),
      featured_location: formData.featured_location,
      display_order: formData.display_order,
      category_relationships: formData.category_relationships,
      type_ids: formData.type_ids,
      section_relationships: formData.section_relationships,
      // English translations
      name_en: formData.name_en || null,
      description_en: formData.description_en || null,
      address_en: formData.address_en || null,
      price_info_en: formData.price_info_en || null,
      opening_hours_en: formData.opening_hours_en || null
    };
    
    console.log('Saving attraction:', { url, method, payload });
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        setSuccess('Attraction saved successfully!');
        setHasChanges(false);
        // Update initial form data to reflect saved state
        setInitialFormData(JSON.stringify({
          ...formData,
          category_relationships: formData.category_relationships.map(r => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium })),
          section_relationships: formData.section_relationships.map(r => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium }))
        }));
      } else {
        const data = await response.json();
        console.error('Save failed:', data);
        setError(data.error || 'Error saving');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Error saving');
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
        <Link href="/dashboard/explore/attractions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'New Attraction' : 'Edit Attraction'}
          </h1>
          <p className="text-gray-500">
            {isNew ? 'Create a new tourist attraction' : formData.name}
          </p>
        </div>
      </div>
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      {/* Visibility Guide - Mobile only (shown at top) */}
      <Card className="lg:hidden">
        <CardHeader title="Visibility Guide" />
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-slate-600">Premium = Hero block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600">Highlight = Our picks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Home className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Featured = Homepage</span>
          </div>
        </div>
      </Card>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Basic Information" />
              <div className="p-6 space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
                
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                
                <RichTextEditor
                  label="Description"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter attraction description..."
                  minHeight="150px"
                />
              </div>
            </Card>
            
            {/* English Translations */}
            <Card>
              <button
                type="button"
                onClick={() => setShowEnglish(!showEnglish)}
                className="w-full flex items-center justify-between text-left p-1"
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
                <div className="mt-4 space-y-4 pt-4 border-t border-slate-200">
                  <Input
                    label="Name (English)"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="Attraction name in English"
                  />
                  
                  <RichTextEditor
                    label="Description (English)"
                    value={formData.description_en}
                    onChange={(value) => setFormData({ ...formData, description_en: value })}
                    placeholder="Attraction description in English..."
                    minHeight="150px"
                  />
                  
                  <Input
                    label="Address (English)"
                    value={formData.address_en}
                    onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                    placeholder="Attraction address in English"
                  />
                  
                  <Input
                    label="Opening Hours (English)"
                    value={formData.opening_hours_en}
                    onChange={(e) => setFormData({ ...formData, opening_hours_en: e.target.value })}
                    placeholder="e.g. Mon-Fri 9am-5pm"
                  />
                </div>
              )}
            </Card>
            
            <Card>
              <CardHeader title="Contact Information" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                
                <Input
                  label="Location (coordinates)"
                  value={formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const parts = value.split(',').map(p => p.trim());
                    if (parts.length === 2) {
                      setFormData({ 
                        ...formData, 
                        latitude: parts[0], 
                        longitude: parts[1] 
                      });
                    } else {
                      // Allow typing in progress
                      setFormData({ 
                        ...formData, 
                        latitude: value, 
                        longitude: '' 
                      });
                    }
                  }}
                  placeholder="43.8563, 18.4131"
                />
                
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                
                <Input
                  label="Website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
                
                <WorkingHours
                  label="Working Hours"
                  value={formData.working_hours}
                  onChange={(value) => setFormData({ ...formData, working_hours: value })}
                />
              </div>
            </Card>
            
            <Card>
              <CardHeader title="Images" />
              <ImageUpload
                value={formData.images}
                onChange={(value) => setFormData({ ...formData, images: value as string[] })}
                multiple
              />
            </Card>

            {/* Categories with Highlight/Premium toggles */}
            <Card>
              <CardHeader 
                title="Categories" 
                description="Select categories and set highlight/premium status"
              />
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded">
                    <Star className="w-3 h-3" /> Highlight
                  </span>
                  <span>- Featured in category</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                  <span>- Hero block in category</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map(cat => {
                  const relationship = formData.category_relationships.find(r => r.id === cat.id);
                  const isSelected = !!relationship;
                  
                  return (
                    <div 
                      key={cat.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        isSelected ? 'border-blue-200 bg-blue-50/50' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700 flex-1 min-w-0">{cat.name}</span>
                      
                      {isSelected && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleCategoryFlag(cat.id, 'is_highlight')}
                            className={`p-1.5 rounded transition-colors ${
                              relationship.is_highlight
                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Highlight in category"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCategoryFlag(cat.id, 'is_premium')}
                            className={`p-1.5 rounded transition-colors ${
                              relationship.is_premium
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Premium (Hero) in category"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Types */}
            <Card>
              <CardHeader 
                title="Types" 
                description="Select attraction types"
              />
              <div className="flex flex-wrap gap-2">
                {types.map(type => {
                  const isSelected = formData.type_ids.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        type_ids: toggleArrayItem(prev.type_ids, type.id)
                      }))}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        isSelected 
                          ? 'bg-blue-100 text-blue-700 border-blue-300' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.name}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Status & Homepage" />
              
              <div className="space-y-4">
                {/* Homepage Featured - with explanation */}
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured_location}
                          onChange={(e) => setFormData({ ...formData, featured_location: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Featured Location</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        Shows attraction on homepage featured section
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Sections with Highlight/Premium toggles */}
            <Card>
              <CardHeader 
                title="Sections (Portals)" 
                description="Where the attraction appears"
              />
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sections.map(section => {
                  const relationship = formData.section_relationships.find(r => r.id === section.id);
                  const isSelected = !!relationship;
                  
                  return (
                    <div 
                      key={section.id} 
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                        isSelected ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSection(section.id)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{section.name}</span>
                      
                      {isSelected && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleSectionFlag(section.id, 'is_highlight')}
                            className={`p-1 rounded transition-colors ${
                              relationship.is_highlight
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title="Highlight"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionFlag(section.id, 'is_premium')}
                            className={`p-1 rounded transition-colors ${
                              relationship.is_premium
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title="Premium"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Visibility Legend - Desktop only */}
            <Card className="hidden lg:block">
              <CardHeader title="Visibility Guide" />
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-700">Premium</span>
                    <p className="text-slate-500">Hero block at top of category page</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-700">Highlight</span>
                    <p className="text-slate-500">Featured in &quot;Our Picks&quot; section</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Home className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-700">Featured Location</span>
                    <p className="text-slate-500">Shown on homepage featured section</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Sticky Save Bar */}
        <div className={`fixed bottom-0 left-0 right-0 lg:left-64 z-30 transition-transform duration-300 ${
          hasChanges ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <div className="bg-white border-t border-slate-200 shadow-lg px-4 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">You have unsaved changes</span>
                <span className="sm:hidden">Unsaved</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  isLoading={isSaving}
                  disabled={!hasChanges}
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  {isNew ? 'Create' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Spacer for sticky bar */}
        <div className="h-20" />
      </form>
    </div>
  );
}

export default function AttractionFormPage() {
  return <AttractionFormContent />;
}
