import { sc } from '../../supabase';

// Get all collections
export async function getAllCollections(filters: { is_active?: boolean } = {}) {
  let query = sc
    .from('po_collections')
    .select('*')
    .order('display_order', { ascending: true });

  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get collection by ID
export async function getCollectionById(id: number) {
  const { data, error } = await sc
    .from('po_collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Get collection by slug
export async function getCollectionBySlug(slug: string) {
  const { data, error } = await sc
    .from('po_collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// Create collection
export async function createCollection(collectionData: {
  name: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  intro?: string;
  background_image?: string;
  is_active?: boolean;
  display_order?: number;
  // English translations
  name_en?: string;
  title_en?: string;
  subtitle_en?: string;
  intro_en?: string;
}) {
  // Generate slug if not provided
  if (!collectionData.slug && collectionData.name) {
    collectionData.slug = collectionData.name
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šđž]/g, (s: string) => ({ 'š': 's', 'đ': 'd', 'ž': 'z' }[s] || s))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await sc
    .from('po_collections')
    .insert(collectionData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update collection
export async function updateCollection(id: number, collectionData: Partial<{
  name: string;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  background_image: string;
  is_active: boolean;
  display_order: number;
  // English translations
  name_en: string;
  title_en: string;
  subtitle_en: string;
  intro_en: string;
}>) {
  const { data, error } = await sc
    .from('po_collections')
    .update(collectionData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete collection
export async function deleteCollection(id: number) {
  const { error } = await sc
    .from('po_collections')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Get collection with products
export async function getCollectionWithProducts(slug: string) {
  const collection = await getCollectionBySlug(slug);
  if (!collection) return null;

  const { data: collectionProducts, error } = await sc
    .from('po_collection_products')
    .select(`
      display_order,
      product:po_products(
        *,
        brand:crm_brands(id, name, logo_url),
        po_product_categories(category:po_categories(id, name, slug))
      )
    `)
    .eq('collection_id', collection.id)
    .order('display_order', { ascending: true });

  if (error) throw error;

  return {
    ...collection,
    products: (collectionProducts || [])
      .map((cp: { display_order?: number; product: { id?: number; brand?: { name?: string; slug?: string; logo_url?: string }; po_product_categories?: { category: { id: number; name: string; slug: string } }[] } | { id?: number; brand?: { name?: string; slug?: string; logo_url?: string }; po_product_categories?: { category: { id: number; name: string; slug: string } }[] }[] }) => {
        const product = Array.isArray(cp.product) ? cp.product[0] : cp.product;
        if (!product) return null;
        return {
          ...product,
          collection_order: cp.display_order,
          brand_name: product?.brand?.name || null,
          brand_slug: product?.brand?.slug || null,
          brand_logo: product?.brand?.logo_url || null,
          categories: product?.po_product_categories?.map((pc: { category: { id: number; name: string; slug: string } }) => pc.category).filter((c: { id?: number }) => c?.id) || []
        };
      })
      .filter((p: { id?: number } | null) => p && p.id)
  };
}

// Update collection products (replace all)
export async function updateCollectionProducts(collectionId: number, productIds: number[]) {
  // Delete existing
  await sc
    .from('po_collection_products')
    .delete()
    .eq('collection_id', collectionId);

  // Insert new
  if (productIds && productIds.length > 0) {
    const links = productIds.map((productId, idx) => ({
      collection_id: collectionId,
      product_id: productId,
      display_order: idx
    }));

    const { error } = await sc
      .from('po_collection_products')
      .insert(links);

    if (error) throw error;
  }

  return true;
}

// Reorder collections
export async function reorderCollections(collectionIds: number[]) {
  // Update display_order for each collection based on position in array
  const updates = collectionIds.map((id, index) => 
    sc
      .from('po_collections')
      .update({ display_order: index })
      .eq('id', id)
  );
  
  await Promise.all(updates);
  return true;
}
