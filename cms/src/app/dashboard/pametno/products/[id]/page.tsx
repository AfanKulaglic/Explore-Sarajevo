'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardHeader, Input, Textarea, Checkbox, ImageUpload, Select, Alert, RichTextEditor } from '@/components/ui';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { slugify } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Collection {
  id: number;
  name: string;
}

function ProductFormContent() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const isNew = params.id === 'new';
  
  const [isLoading, setIsLoading] = React.useState(!isNew);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [initialFormData, setInitialFormData] = React.useState<string>('');
  
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  
  const [selectedTags, setSelectedTags] = React.useState<number[]>([]);
  const [selectedCollections, setSelectedCollections] = React.useState<number[]>([]);
  
  const [formData, setFormData] = React.useState({
    title: '',
    slug: '',
    long_description: '',
    short_description: '',
    price: '',
    currency: 'EUR',
    cta_url: '',
    cta_text: '',
    brand_id: '',
    image_url: '',
    image_alt: '',
    gallery: [] as string[],
    key_features: [] as string[],
    featured: false,
    is_published: false,
    type: 'product',
    ranking_score: '',
    display_order: '',
    // English translations
    title_en: '',
    short_description_en: '',
    long_description_en: '',
    image_alt_en: '',
    cta_text_en: '',
    key_features_en: [] as string[],
    badges_en: [] as string[]
  });
  
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
  
  // Check if form has changes
  const hasChanges = React.useMemo(() => {
    if (isNew) return formData.title.length > 0;
    if (!initialFormData) return false;
    const currentData = JSON.stringify({ ...formData, selectedCategories, selectedTags, selectedCollections });
    return currentData !== initialFormData;
  }, [formData, selectedCategories, selectedTags, selectedCollections, initialFormData, isNew]);
  
  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch all reference data in parallel
      const [catRes, brandRes, tagRes, collRes] = await Promise.all([
        fetch('/api/pametno/categories'),
        fetch('/api/pametno/brands'),
        fetch('/api/pametno/tags'),
        fetch('/api/pametno/collections')
      ]);
      
      const [catData, brandData, tagData, collData] = await Promise.all([
        catRes.json(),
        brandRes.json(),
        tagRes.json(),
        collRes.json()
      ]);
      
      setCategories(Array.isArray(catData) ? catData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
      setTags(Array.isArray(tagData) ? tagData : []);
      setCollections(Array.isArray(collData) ? collData : []);
      
      // Fetch product if editing
      if (!isNew) {
        try {
          const response = await fetch(`/api/pametno/products/${params.id}`);
          const data = await response.json();
          
          if (data) {
            const loadedFormData = {
              title: data.title || '',
              slug: data.slug || '',
              long_description: data.long_description || '',
              short_description: data.short_description || '',
              price: data.price?.toString() || '',
              currency: data.currency || 'EUR',
              cta_url: data.cta_url || '',
              cta_text: data.cta_text || '',
              brand_id: data.brand_id?.toString() || '',
              image_url: data.image_url || '',
              image_alt: data.image_alt || '',
              gallery: data.gallery || [],
              key_features: data.key_features || [],
              featured: data.featured || false,
              is_published: data.is_published || false,
              type: data.type || 'product',
              ranking_score: data.ranking_score?.toString() || '',
              display_order: data.display_order?.toString() || '',
              // English translations
              title_en: data.title_en || '',
              short_description_en: data.short_description_en || '',
              long_description_en: data.long_description_en || '',
              image_alt_en: data.image_alt_en || '',
              cta_text_en: data.cta_text_en || '',
              key_features_en: data.key_features_en || [],
              badges_en: data.badges_en || []
            };
            setFormData(loadedFormData);
            
            const loadedCategories = data.category_ids || [];
            const loadedTags = data.tag_ids || [];
            const loadedCollections = data.collection_ids || [];
            
            setSelectedCategories(loadedCategories);
            setSelectedTags(loadedTags);
            setSelectedCollections(loadedCollections);
            
            // Store initial data for change detection
            setInitialFormData(JSON.stringify({
              ...loadedFormData,
              selectedCategories: loadedCategories,
              selectedTags: loadedTags,
              selectedCollections: loadedCollections
            }));
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setError('Error loading product');
        }
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [isNew, params.id]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: isNew ? slugify(title) : formData.slug
    });
  };
  
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const handleCollectionToggle = (collectionId: number) => {
    setSelectedCollections(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    const url = isNew ? '/api/pametno/products' : `/api/pametno/products/${params.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    try {
      const payload = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        ranking_score: formData.ranking_score ? Number(formData.ranking_score) : null,
        display_order: formData.display_order ? Number(formData.display_order) : null,
        brand_id: formData.brand_id ? Number(formData.brand_id) : null,
        category_ids: selectedCategories,
        tag_ids: selectedTags,
        collection_ids: selectedCollections
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Proizvod sačuvan');
        // Update initialFormData to reflect saved state
        setInitialFormData(JSON.stringify({
          ...formData,
          selectedCategories,
          selectedTags,
          selectedCollections
        }));
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
        <Link href="/dashboard/pametno/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? t('productForm.newProduct') : t('productForm.editProduct')}
          </h1>
          <p className="text-gray-500">
            {isNew ? t('productForm.createNewProduct') : formData.title}
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
              <CardHeader title={t('productForm.basicInfo')} />
              <div className="p-6 space-y-4">
                <Input
                  label={t('common.name')}
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                />
                
                <Input
                  label={t('productForm.slug')}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                
                <Textarea
                  label={t('productForm.shortDescription')}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  rows={2}
                />
                
                {/* Why We Recommend - Optional */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('productForm.whyWeRecommend')} ({t('productForm.optional')})
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    {t('productForm.whyWeRecommendHint')}
                  </p>
                  <div className="space-y-2">
                    {formData.key_features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.key_features];
                            newFeatures[index] = e.target.value;
                            setFormData({ ...formData, key_features: newFeatures });
                          }}
                          placeholder={`${t('productForm.reason')} ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFeatures = formData.key_features.filter((_, i) => i !== index);
                            setFormData({ ...formData, key_features: newFeatures });
                          }}
                          className="shrink-0 text-red-500 hover:text-red-700"
                        >
                          {t('productForm.remove')}
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          key_features: [...formData.key_features, '']
                        });
                      }}
                    >
                      {t('productForm.addReason')}
                    </Button>
                  </div>
                </div>
                
                <RichTextEditor
                  label={t('productForm.article')}
                  value={formData.long_description}
                  onChange={(value) => setFormData({ ...formData, long_description: value })}
                  placeholder={t('productForm.articlePlaceholder')}
                  minHeight="180px"
                />
              </div>
            </Card>
            
            <Card>
              <CardHeader title={t('productForm.priceAndLink')} />
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('productForm.price')}
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <Select
                    label={t('productForm.currency')}
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    options={[
                      { value: 'EUR', label: 'EUR' },
                      { value: 'BAM', label: 'BAM' },
                      { value: 'USD', label: 'USD' }
                    ]}
                  />
                </div>
                
                <Input
                  label={t('productForm.purchaseLink')}
                  type="url"
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  placeholder="https://"
                />
                
                <Input
                  label={t('productForm.buttonText')}
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder={t('productForm.buyNow')}
                />
              </div>
            </Card>
            
            <Card>
              <CardHeader title={t('productForm.images')} />
              <div className="p-6 space-y-4">
                <ImageUpload
                  label={t('productForm.mainImage')}
                  value={formData.image_url}
                  onChange={(value) => setFormData({ ...formData, image_url: value as string })}
                />
                
                <Input
                  label={t('productForm.imageAltText')}
                  value={formData.image_alt}
                  onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                  placeholder={t('productForm.imageAltPlaceholder')}
                />
                
                <ImageUpload
                  label={t('productForm.imageGallery')}
                  value={formData.gallery}
                  onChange={(value) => setFormData({ ...formData, gallery: value as string[] })}
                  multiple
                />
              </div>
            </Card>
            
            {/* English Translations Section */}
            <Card>
              <button
                type="button"
                onClick={() => setShowEnglish(!showEnglish)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇬🇧</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">English Translation</h3>
                    <p className="text-sm text-slate-500">Add English content for international visitors</p>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-slate-400 transition-transform ${showEnglish ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showEnglish && (
                <div className="p-6 border-t border-slate-200 space-y-4">
                  <Input
                    label="Title (English)"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Product title in English"
                  />
                  
                  <Textarea
                    label="Short Description (English)"
                    value={formData.short_description_en}
                    onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                    rows={2}
                    placeholder="Brief description in English"
                  />
                  
                  {/* Key Features English */}
                  <div className="border-t border-slate-200 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Why We Recommend (English)
                    </label>
                    <div className="space-y-2">
                      {formData.key_features_en.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => {
                              const newFeatures = [...formData.key_features_en];
                              newFeatures[index] = e.target.value;
                              setFormData({ ...formData, key_features_en: newFeatures });
                            }}
                            placeholder={`Reason ${index + 1} in English`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newFeatures = formData.key_features_en.filter((_, i) => i !== index);
                              setFormData({ ...formData, key_features_en: newFeatures });
                            }}
                            className="shrink-0 text-red-500 hover:text-red-700"
                          >
                            {t('productForm.remove')}
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            key_features_en: [...formData.key_features_en, '']
                          });
                        }}
                      >
                        Add Reason
                      </Button>
                    </div>
                  </div>
                  
                  <RichTextEditor
                    label="Article (English)"
                    value={formData.long_description_en}
                    onChange={(value) => setFormData({ ...formData, long_description_en: value })}
                    placeholder="Detailed product description in English..."
                    minHeight="180px"
                  />
                  
                  <Input
                    label="Image Alt Text (English)"
                    value={formData.image_alt_en}
                    onChange={(e) => setFormData({ ...formData, image_alt_en: e.target.value })}
                    placeholder="Describe the image in English"
                  />
                  
                  <Input
                    label="Button Text (English)"
                    value={formData.cta_text_en}
                    onChange={(e) => setFormData({ ...formData, cta_text_en: e.target.value })}
                    placeholder="e.g., Buy Now, Shop Here"
                  />
                </div>
              )}
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader title={t('productForm.publishing')} />
              <div className="p-6 space-y-4">
                <Checkbox
                  label={t('productForm.published')}
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Checkbox
                    label={t('productForm.featuredProduct')}
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <p className="text-xs text-amber-700 mt-1 ml-6">
                    {t('productForm.featuredHint')}
                  </p>
                </div>
                
                <Input
                  label={t('productForm.displayPriority')}
                  type="number"
                  step="0.01"
                  value={formData.ranking_score}
                  onChange={(e) => setFormData({ ...formData, ranking_score: e.target.value })}
                  placeholder={t('productForm.priorityPlaceholder')}
                />
                <p className="text-xs text-gray-500 -mt-2">
                  {t('productForm.priorityHint')}
                </p>
                
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isNew ? t('productForm.create') : t('common.save')}
                </Button>
              </div>
            </Card>
            
            <Card>
              <CardHeader title={t('entities.categories')} />
              <div className="p-6">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <Checkbox
                      key={cat.id}
                      label={cat.name}
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryToggle(cat.id)}
                    />
                  ))}
                  {categories.length === 0 && (
                    <p className="text-gray-500 text-sm">{t('productForm.noCategories')}</p>
                  )}
                </div>
              </div>
            </Card>
            
            <Card>
              <CardHeader title={t('entities.brand')} />
              <div className="p-6">
                <Select
                  label={t('entities.brand')}
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  options={brands.map(b => ({ value: b.id, label: b.name }))}
                  placeholder={t('productForm.selectBrand')}
                />
              </div>
            </Card>
            
            <Card>
              <CardHeader title={t('entities.tags')} />
              <div className="p-6">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tags.map((tag) => (
                    <Checkbox
                      key={tag.id}
                      label={tag.name}
                      checked={selectedTags.includes(tag.id)}
                      onChange={() => handleTagToggle(tag.id)}
                    />
                  ))}
                  {tags.length === 0 && (
                    <p className="text-gray-500 text-sm">{t('productForm.noTags')}</p>
                  )}
                </div>
              </div>
            </Card>
            
            <Card>
              <CardHeader title={t('entities.collections')} />
              <div className="p-6">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {collections.map((coll) => (
                    <Checkbox
                      key={coll.id}
                      label={coll.name}
                      checked={selectedCollections.includes(coll.id)}
                      onChange={() => handleCollectionToggle(coll.id)}
                    />
                  ))}
                  {collections.length === 0 && (
                    <p className="text-gray-500 text-sm">{t('productForm.noCollections')}</p>
                  )}
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
                <span className="hidden sm:inline">{t('messages.unsavedChanges')}</span>
                <span className="sm:hidden">{t('messages.unsaved')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => router.back()}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  {isNew ? t('productForm.create') : t('common.save')}
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

export default function ProductFormPage() {
  return <ProductFormContent />;
}
