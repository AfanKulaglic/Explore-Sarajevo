import { sc } from '../../supabase';

interface ProductFilters {
  brand_id?: number;
  featured?: boolean;
  is_published?: boolean;
  category_id?: number;
  search?: string;
}

// Get all products with related data
export async function getAllProducts(filters: ProductFilters = {}) {
  let query = sc
    .from('po_products')
    .select(`
      *,
      brand:crm_brands(id, name, logo_url),
      po_product_categories(category:po_categories(id, name, slug)),
      po_product_tags(tag:po_tags(id, name, slug)),
      po_collection_products(collection:po_collections(id, name, slug))
    `)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (filters.brand_id) {
    query = query.eq('brand_id', filters.brand_id);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.is_published !== undefined) {
    query = query.eq('is_published', filters.is_published);
  }

  if (filters.category_id) {
    query = query.eq('po_product_categories.category_id', filters.category_id);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,slug.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(product => ({
    ...product,
    brand_name: product.brand?.name || null,
    brand_slug: product.brand?.slug || null,
    brand_logo: product.brand?.logo_url || null,
    categories: product.po_product_categories?.map((pc: { category: { id: number; name: string; slug: string } }) => pc.category).filter((c: { id?: number }) => c?.id) || [],
    tags: product.po_product_tags?.map((pt: { tag: { id: number; name: string; slug: string } }) => pt.tag).filter((t: { id?: number }) => t?.id) || [],
    collections: product.po_collection_products?.map((pc: { collection: { id: number; name: string; slug: string } }) => pc.collection).filter((c: { id?: number }) => c?.id) || [],
    category_ids: product.po_product_categories?.map((pc: { category: { id?: number } }) => pc.category?.id).filter(Boolean) || [],
    tag_ids: product.po_product_tags?.map((pt: { tag: { id?: number } }) => pt.tag?.id).filter(Boolean) || [],
    collection_ids: product.po_collection_products?.map((pc: { collection: { id?: number } }) => pc.collection?.id).filter(Boolean) || []
  }));
}

// Get single product by ID
export async function getProductById(id: number) {
  const { data, error } = await sc
    .from('po_products')
    .select(`
      *,
      brand:crm_brands(id, name, logo_url),
      po_product_categories(category:po_categories(id, name, slug)),
      po_product_tags(tag:po_tags(id, name, slug)),
      po_collection_products(collection:po_collections(id, name, slug))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    brand_name: data.brand?.name || null,
    brand_slug: data.brand?.slug || null,
    brand_logo: data.brand?.logo_url || null,
    categories: data.po_product_categories?.map((pc: { category: { id: number; name: string; slug: string } }) => pc.category).filter((c: { id?: number }) => c?.id) || [],
    tags: data.po_product_tags?.map((pt: { tag: { id: number; name: string; slug: string } }) => pt.tag).filter((t: { id?: number }) => t?.id) || [],
    collections: data.po_collection_products?.map((pc: { collection: { id: number; name: string; slug: string } }) => pc.collection).filter((c: { id?: number }) => c?.id) || [],
    category_ids: data.po_product_categories?.map((pc: { category: { id?: number } }) => pc.category?.id).filter(Boolean) || [],
    tag_ids: data.po_product_tags?.map((pt: { tag: { id?: number } }) => pt.tag?.id).filter(Boolean) || [],
    collection_ids: data.po_collection_products?.map((pc: { collection: { id?: number } }) => pc.collection?.id).filter(Boolean) || []
  };
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  const { data, error } = await sc
    .from('po_products')
    .select(`
      *,
      brand:crm_brands(id, name, logo_url),
      po_product_categories(category:po_categories(id, name, slug)),
      po_product_tags(tag:po_tags(id, name, slug))
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return {
    ...data,
    brand_name: data.brand?.name || null,
    brand_slug: data.brand?.slug || null,
    brand_logo: data.brand?.logo_url || null,
    categories: data.po_product_categories?.map((pc: { category: { id: number; name: string; slug: string } }) => pc.category).filter((c: { id?: number }) => c?.id) || [],
    tags: data.po_product_tags?.map((pt: { tag: { id: number; name: string; slug: string } }) => pt.tag).filter((t: { id?: number }) => t?.id) || [],
    category_ids: data.po_product_categories?.map((pc: { category: { id?: number } }) => pc.category?.id).filter(Boolean) || [],
    tag_ids: data.po_product_tags?.map((pt: { tag: { id?: number } }) => pt.tag?.id).filter(Boolean) || []
  };
}

// Get featured products
export async function getFeaturedProducts(limit: number = 10) {
  const { data, error } = await sc
    .from('po_products')
    .select(`
      *,
      brand:crm_brands(id, name, logo_url),
      po_product_categories(category:po_categories(id, name, slug))
    `)
    .eq('featured', true)
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(product => ({
    ...product,
    brand_name: product.brand?.name || null,
    brand_slug: product.brand?.slug || null,
    brand_logo: product.brand?.logo_url || null,
    categories: product.po_product_categories?.map((pc: { category: { id: number; name: string; slug: string } }) => pc.category).filter((c: { id?: number }) => c?.id) || []
  }));
}

// Create product
export async function createProduct(productData: {
  title: string;
  slug?: string;
  short_description?: string;
  long_description?: string;
  image_url?: string;
  image_alt?: string;
  gallery?: string[];
  brand_id?: number | null;
  type?: string;
  key_features?: string[];
  specifications?: Record<string, string>;
  ranking_score?: number;
  display_order?: number;
  featured?: boolean;
  badges?: string[];
  price?: number;
  currency?: string;
  cta_url?: string;
  cta_text?: string;
  is_published?: boolean;
  category_ids?: number[];
  tag_ids?: number[];
  collection_ids?: number[];
  // English translations
  title_en?: string;
  short_description_en?: string;
  long_description_en?: string;
  image_alt_en?: string;
  cta_text_en?: string;
  key_features_en?: string[];
  badges_en?: string[];
}) {
  const { category_ids, tag_ids, collection_ids, ...data } = productData;

  // Ensure gallery is always an array (guard against {} from forms)
  if ('gallery' in data && !Array.isArray(data.gallery)) {
    data.gallery = [];
  }

  // Generate slug if not provided
  if (!data.slug && data.title) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šđž]/g, (s: string) => ({ 'š': 's', 'đ': 'd', 'ž': 'z' }[s] || s))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data: product, error } = await sc
    .from('po_products')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Add categories
  if (category_ids && category_ids.length > 0) {
    const categoryLinks = category_ids.map((category_id, idx) => ({
      product_id: product.id,
      category_id,
      is_primary: idx === 0
    }));
    await sc.from('po_product_categories').insert(categoryLinks);
  }

  // Add tags
  if (tag_ids && tag_ids.length > 0) {
    const tagLinks = tag_ids.map(tag_id => ({
      product_id: product.id,
      tag_id
    }));
    await sc.from('po_product_tags').insert(tagLinks);
  }

  // Add collections
  if (collection_ids && collection_ids.length > 0) {
    const collectionLinks = collection_ids.map((collection_id, idx) => ({
      collection_id,
      product_id: product.id,
      display_order: idx
    }));
    await sc.from('po_collection_products').insert(collectionLinks);
  }

  return getProductById(product.id);
}

// Update product
export async function updateProduct(id: number, productData: Partial<{
  title: string;
  slug: string;
  short_description: string;
  long_description: string;
  image_url: string;
  image_alt: string;
  gallery: string[];
  brand_id: number | null;
  type: string;
  key_features: string[];
  specifications: Record<string, string>;
  ranking_score: number;
  display_order: number;
  featured: boolean;
  badges: string[];
  price: number;
  currency: string;
  cta_url: string;
  cta_text: string;
  is_published: boolean;
  category_ids: number[];
  tag_ids: number[];
  collection_ids: number[];
  // English translations
  title_en: string;
  short_description_en: string;
  long_description_en: string;
  image_alt_en: string;
  cta_text_en: string;
  key_features_en: string[];
  badges_en: string[];
}>) {
  const { category_ids, tag_ids, collection_ids, ...data } = productData;

  // Ensure gallery is always an array (guard against {} from forms)
  if ('gallery' in data && !Array.isArray(data.gallery)) {
    data.gallery = [];
  }

  const { error } = await sc
    .from('po_products')
    .update(data)
    .eq('id', id);

  if (error) throw error;

  // Update categories if provided
  if (category_ids !== undefined) {
    await sc.from('po_product_categories').delete().eq('product_id', id);
    if (category_ids.length > 0) {
      const categoryLinks = category_ids.map((category_id, idx) => ({
        product_id: id,
        category_id,
        is_primary: idx === 0
      }));
      await sc.from('po_product_categories').insert(categoryLinks);
    }
  }

  // Update tags if provided
  if (tag_ids !== undefined) {
    await sc.from('po_product_tags').delete().eq('product_id', id);
    if (tag_ids.length > 0) {
      const tagLinks = tag_ids.map(tag_id => ({
        product_id: id,
        tag_id
      }));
      await sc.from('po_product_tags').insert(tagLinks);
    }
  }

  // Update collections if provided
  if (collection_ids !== undefined) {
    await sc.from('po_collection_products').delete().eq('product_id', id);
    if (collection_ids.length > 0) {
      const collectionLinks = collection_ids.map((collection_id, idx) => ({
        collection_id,
        product_id: id,
        display_order: idx
      }));
      await sc.from('po_collection_products').insert(collectionLinks);
    }
  }

  return getProductById(id);
}

// Delete product
export async function deleteProduct(id: number) {
  const { error } = await sc
    .from('po_products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Reorder products
export async function reorderProducts(productIds: number[]) {
  // Update display_order for each product based on position in array
  const updates = productIds.map((id, index) => 
    sc
      .from('po_products')
      .update({ display_order: index })
      .eq('id', id)
  );
  
  await Promise.all(updates);
  return true;
}
