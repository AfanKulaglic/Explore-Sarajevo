'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Select, ImageUpload, Card, CardHeader, Alert, WorkingHours, RichTextEditor } from '@/components/ui';
import type { WorkingHoursData } from '@/components/ui';
import { ArrowLeft, Save, Star, Crown, CheckCircle } from 'lucide-react';
import { usePageBreadcrumb } from '@/lib/breadcrumb-context';

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

interface Brand {
  id: number;
  name: string;
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

type BusinessFormSnapshot = {
  name: string;
  slug: string;
  description: string;
  address: string;
  location: string;
  telephone: string;
  email: string;
  website: string;
  working_hours: WorkingHoursData | string | null;
  price_range: string;
  media: string[];
  rating: number;
  brand_id: string;
  display_order: number;
  name_en: string;
  description_en: string;
  address_en: string;
  price_range_en: string;
  type_ids: number[];
  category_relationships: CategoryRelationship[];
  section_relationships: SectionRelationship[];
};

function buildFormSnapshot(data: BusinessFormSnapshot): string {
  return JSON.stringify({
    name: data.name,
    slug: data.slug,
    description: data.description,
    address: data.address,
    location: data.location,
    telephone: data.telephone,
    email: data.email,
    website: data.website,
    working_hours: data.working_hours,
    price_range: data.price_range,
    media: data.media,
    rating: data.rating,
    brand_id: data.brand_id,
    display_order: data.display_order,
    name_en: data.name_en,
    description_en: data.description_en,
    address_en: data.address_en,
    price_range_en: data.price_range_en,
    type_ids: [...data.type_ids].sort((a, b) => a - b),
    category_relationships: data.category_relationships
      .map((r) => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium }))
      .sort((a, b) => a.id - b.id),
    section_relationships: data.section_relationships
      .map((r) => ({ id: r.id, is_highlight: r.is_highlight, is_premium: r.is_premium }))
      .sort((a, b) => a.id - b.id),
  });
}

function BusinessFormContent() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id !== 'new';
  
  const [isLoading, setIsLoading] = React.useState(isEditing);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [initialFormData, setInitialFormData] = React.useState<string>('');
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [types, setTypes] = React.useState<Type[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    location: '',
    telephone: '',
    email: '',
    website: '',
    working_hours: null as WorkingHoursData | string | null,
    price_range: '',
    media: [] as string[],
    rating: 0,
    brand_id: '',
    category_relationships: [] as CategoryRelationship[],
    type_ids: [] as number[],
    section_relationships: [] as SectionRelationship[],
    display_order: 0,
    // English translations
    name_en: '',
    description_en: '',
    address_en: '',
    price_range_en: ''
  });

  usePageBreadcrumb(isEditing && formData.name.trim() ? formData.name.trim() : null);
  
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, typesRes, sectionsRes, brandsRes] = await Promise.all([
          fetch('/api/explore/categories'),
          fetch('/api/explore/types'),
          fetch('/api/explore/sections'),
          fetch('/api/explore/brands')
        ]);
        
        const [categoriesData, typesData, sectionsData, brandsData] = await Promise.all([
          categoriesRes.json(),
          typesRes.json(),
          sectionsRes.json(),
          brandsRes.json()
        ]);
        
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setTypes(Array.isArray(typesData) ? typesData : []);
        setSections(Array.isArray(sectionsData) ? sectionsData.filter((s: Section) => s.is_active !== false) : []);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        
        if (isEditing) {
          const businessRes = await fetch(`/api/explore/businesses/${params.id}`);
          if (businessRes.ok) {
            const business = await businessRes.json();
            setFormData({
              name: business.name || '',
              slug: business.slug || '',
              description: business.description || '',
              address: business.address || '',
              location: business.location || '',
              telephone: business.telephone || '',
              email: business.email || '',
              website: business.website || '',
              working_hours: business.working_hours || null,
              price_range: business.price_range || '',
              media: business.media || [],
              rating: business.rating || 0,
              brand_id: business.brand_id?.toString() || '',
              category_relationships: (business.categories || []).map((c: { id: number; name?: string; is_highlight?: boolean; is_premium?: boolean }) => ({
                id: c.id,
                name: c.name,
                is_highlight: c.is_highlight || false,
                is_premium: c.is_premium || false
              })),
              type_ids: business.types?.map((t: Type) => t.id) || [],
              section_relationships: (business.sections || []).map((s: { id: number; name?: string; is_highlight?: boolean; is_premium?: boolean }) => ({
                id: s.id,
                name: s.name,
                is_highlight: s.is_highlight || false,
                is_premium: s.is_premium || false
              })),
              display_order: business.display_order || 0,
              // English translations
              name_en: business.name_en || '',
              description_en: business.description_en || '',
              address_en: business.address_en || '',
              price_range_en: business.price_range_en || ''
            });
            setInitialFormData(
              buildFormSnapshot({
                name: business.name || '',
                slug: business.slug || '',
                description: business.description || '',
                address: business.address || '',
                location: business.location || '',
                telephone: business.telephone || '',
                email: business.email || '',
                website: business.website || '',
                working_hours: business.working_hours || null,
                price_range: business.price_range || '',
                media: business.media || [],
                rating: business.rating || 0,
                brand_id: business.brand_id?.toString() || '',
                category_relationships: (business.categories || []).map(
                  (c: { id: number; name?: string; is_highlight?: boolean; is_premium?: boolean }) => ({
                    id: c.id,
                    name: c.name,
                    is_highlight: c.is_highlight || false,
                    is_premium: c.is_premium || false,
                  })
                ),
                type_ids: business.types?.map((t: Type) => t.id) || [],
                section_relationships: (business.sections || []).map(
                  (s: { id: number; name?: string; is_highlight?: boolean; is_premium?: boolean }) => ({
                    id: s.id,
                    name: s.name,
                    is_highlight: s.is_highlight || false,
                    is_premium: s.is_premium || false,
                  })
                ),
                display_order: business.display_order || 0,
                name_en: business.name_en || '',
                description_en: business.description_en || '',
                address_en: business.address_en || '',
                price_range_en: business.price_range_en || '',
              })
            );
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isEditing, params.id]);
  
  // Check if form has changes
  const hasChanges = React.useMemo(() => {
    if (!isEditing) return formData.name.length > 0;
    if (!initialFormData) return false;
    return buildFormSnapshot(formData) !== initialFormData;
  }, [formData, initialFormData, isEditing]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    const url = isEditing ? `/api/explore/businesses/${params.id}` : '/api/explore/businesses';
    const method = isEditing ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          brand_id: formData.brand_id ? Number(formData.brand_id) : null
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        const saved = await response.json();

        if (isEditing) {
          setSuccess('All changes saved');
          setInitialFormData(buildFormSnapshot(formData));
          setTimeout(() => setSuccess(''), 4000);
        } else if (saved?.id) {
          router.push(`/dashboard/explore/businesses/${saved.id}`);
        } else {
          router.push('/dashboard/explore/businesses');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Error saving');
      }
    } catch {
      setError('Error saving');
    } finally {
      setIsSaving(false);
    }
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Business' : 'New Business'}
          </h1>
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
        </div>
      </Card>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader title="Basic Information" />
              
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  helperText="URL-friendly version of the name"
                />
                
                <RichTextEditor
                  label="Description"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Enter business description..."
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
                    placeholder="Business name in English"
                  />
                  
                  <RichTextEditor
                    label="Description (English)"
                    value={formData.description_en}
                    onChange={(value) => setFormData({ ...formData, description_en: value })}
                    placeholder="Business description in English..."
                    minHeight="150px"
                  />
                  
                  <Input
                    label="Address (English)"
                    value={formData.address_en}
                    onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                    placeholder="Business address in English"
                  />
                  
                  <Input
                    label="Price Range (English)"
                    value={formData.price_range_en}
                    onChange={(e) => setFormData({ ...formData, price_range_en: e.target.value })}
                    placeholder="e.g. Budget, Moderate, Expensive"
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
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="43.8563, 18.4131"
                />
                
                <Input
                  label="Phone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
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
                />
                
                <Select
                  label="Price Range"
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  options={[
                    { value: '€', label: '€ - Budget' },
                    { value: '€€', label: '€€ - Moderate' },
                    { value: '€€€', label: '€€€ - Expensive' },
                    { value: '€€€€', label: '€€€€ - Luxury' }
                  ]}
                  placeholder="Select"
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
                value={formData.media}
                onChange={(value) => setFormData({ ...formData, media: value as string[] })}
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

            {/* Tipovi */}
            <Card>
              <CardHeader 
                title="Types" 
                description="Select business types"
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
            {/* Sections with Highlight/Premium toggles */}
            <Card>
              <CardHeader
                title="Sections (Portals)"
                description="Site homepage: crown = hero, star = highlights row"
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
                            title="Homepage highlights row"
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
                            title="Homepage hero (top)"
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
            
            <Card>
              <CardHeader title="Brand" />
              <Select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                options={brands.map(b => ({ value: b.id, label: b.name }))}
                placeholder="Select brand"
              />
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
                    <p className="text-slate-500">Featured in &ldquo;Our Picks&rdquo; section</p>
                  </div>
                </div>
                <p className="font-medium text-slate-600 pt-2 border-t border-slate-100">On portal section</p>
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-700">Section premium</span>
                    <p className="text-slate-500">Portal homepage hero (top block)</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-slate-700">Section highlight</span>
                    <p className="text-slate-500">Portal homepage &ldquo;Our picks&rdquo; row</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Sticky Save Bar */}
        <div
          className={`fixed bottom-0 left-0 right-0 lg:left-64 z-30 transition-transform duration-300 ${
            hasChanges || success ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="bg-white border-t border-slate-200 shadow-lg px-4 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                {success && !hasChanges ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-700">{success}</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-slate-600 hidden sm:inline">You have unsaved changes</span>
                    <span className="text-slate-600 sm:hidden">Unsaved</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/explore/businesses')}
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
                  {isEditing ? 'Save' : 'Create'}
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

export default function BusinessFormPage() {
  return <BusinessFormContent />;
}
