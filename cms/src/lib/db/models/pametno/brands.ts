import { sc } from '../../supabase';

// Get all brands
export async function getAllBrands(filters: { search?: string } = {}) {
  let query = sc
    .from('crm_brands')
    .select('*')
    .order('name', { ascending: true });

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get brand by ID
export async function getBrandById(id: number) {
  const { data, error } = await sc
    .from('crm_brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Get brand by slug
export async function getBrandBySlug(slug: string) {
  const { data, error } = await sc
    .from('crm_brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// Create brand
export async function createBrand(brandData: {
  name: string;
  slug?: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  marketplace_url?: string;
  founded?: string;
  headquarters?: string;
  values?: string[];
  // English translation
  description_en?: string;
}) {
  // Generate slug if not provided
  if (!brandData.slug && brandData.name) {
    brandData.slug = brandData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await sc
    .from('crm_brands')
    .insert(brandData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update brand
export async function updateBrand(id: number, brandData: Partial<{
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  website_url: string;
  marketplace_url: string;
  // English translation
  description_en: string;
  founded: string;
  headquarters: string;
  values: string[];
}>) {
  const { data, error } = await sc
    .from('crm_brands')
    .update(brandData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete brand
export async function deleteBrand(id: number) {
  const { error } = await sc
    .from('crm_brands')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Get brand with products
export async function getBrandWithProducts(slug: string) {
  const brand = await getBrandBySlug(slug);
  if (!brand) return null;

  const { data: products, error } = await sc
    .from('po_products')
    .select(`
      *,
      po_product_categories(category:po_categories(id, name, slug))
    `)
    .eq('brand_id', brand.id)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return {
    ...brand,
    products: (products || []).map(p => ({
      ...p,
      categories: p.po_product_categories?.map((pc: { category: { id: number; name: string; slug: string } }) => pc.category).filter((c: { id?: number }) => c?.id) || []
    }))
  };
}
