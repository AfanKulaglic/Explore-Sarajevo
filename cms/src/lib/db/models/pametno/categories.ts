import { sc } from '../../supabase';

// Get all categories
export async function getAllCategories(filters: { is_active?: boolean; search?: string } = {}) {
  let query = sc
    .from('po_categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get category by ID
export async function getCategoryById(id: number) {
  const { data, error } = await sc
    .from('po_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Get category by slug
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await sc
    .from('po_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// Create category
export async function createCategory(categoryData: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parent_id?: number | null;
  display_order?: number;
  is_active?: boolean;
  // English translations
  name_en?: string;
  description_en?: string;
}) {
  // Generate slug if not provided
  if (!categoryData.slug && categoryData.name) {
    categoryData.slug = categoryData.name
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šđž]/g, (s: string) => ({ 'š': 's', 'đ': 'd', 'ž': 'z' }[s] || s))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await sc
    .from('po_categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update category
export async function updateCategory(id: number, categoryData: Partial<{
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parent_id: number | null;
  display_order: number;
  is_active: boolean;
  // English translations
  name_en: string;
  description_en: string;
}>) {
  const { data, error } = await sc
    .from('po_categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete category
export async function deleteCategory(id: number) {
  const { error } = await sc
    .from('po_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Get category with products
export async function getCategoryWithProducts(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category) return null;

  const { data: productCategories, error } = await sc
    .from('po_product_categories')
    .select(`
      product:po_products(
        *,
        brand:crm_brands(id, name, logo_url)
      )
    `)
    .eq('category_id', category.id);

  if (error) throw error;

  return {
    ...category,
    products: (productCategories || [])
      .map((pc: { product: { id?: number; is_published?: boolean; brand?: { name?: string; slug?: string; logo_url?: string } } | { id?: number; is_published?: boolean; brand?: { name?: string; slug?: string; logo_url?: string } }[] }) => {
        const product = Array.isArray(pc.product) ? pc.product[0] : pc.product;
        if (!product) return null;
        return {
          ...product,
          brand_name: product?.brand?.name || null,
          brand_slug: product?.brand?.slug || null,
          brand_logo: product?.brand?.logo_url || null
        };
      })
      .filter((p: { id?: number; is_published?: boolean } | null) => p && p.id && p.is_published)
  };
}

// Get categories with product counts
export async function getCategoriesWithCounts() {
  const categories = await getAllCategories({ is_active: true });
  
  // Get counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count, error } = await sc
        .from('po_product_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id);
      
      return {
        ...cat,
        product_count: error ? 0 : count
      };
    })
  );

  return categoriesWithCounts;
}
