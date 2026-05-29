import { sc } from '../../supabase';
import { generateSlug, resolveSlug } from '@/lib/explore/slug';

// Get all categories
export async function getAllCategories() {
  const { data, error } = await sc
    .from('es_categories')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get single category by ID
export async function getCategoryById(id: number) {
  const { data, error } = await sc
    .from('es_categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Create category
export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string | null;
  image?: string | null;
  featured_category?: boolean;
  display_order?: number;
  // English translations
  name_en?: string;
  description_en?: string;
}) {
  const { name, slug, description, icon, image, featured_category, display_order, name_en, description_en } = data;
  
  const { data: category, error } = await sc
    .from('es_categories')
    .insert([{
      name,
      slug: resolveSlug(name, slug),
      description: description || '',
      icon: icon || null,
      image: image || null,
      featured_category: featured_category || false,
      display_order: display_order ?? null,
      name_en: name_en || null,
      description_en: description_en || null
    }])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return category;
}

// Update category
export async function updateCategory(id: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  image: string | null;
  featured_category: boolean;
  // English translations
  name_en: string | null;
  description_en: string | null;
}>) {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.featured_category !== undefined) updates.featured_category = data.featured_category;
  if (data.slug !== undefined || data.name !== undefined) {
    const { data: existing } = await sc
      .from('es_categories')
      .select('name, slug')
      .eq('id', id)
      .maybeSingle();
    const nameForSlug = data.name ?? existing?.name ?? '';
    updates.slug =
      data.slug !== undefined
        ? resolveSlug(nameForSlug, data.slug)
        : existing?.slug?.trim() || generateSlug(nameForSlug);
  }
  if (data.description !== undefined) updates.description = data.description;
  if (data.icon !== undefined) updates.icon = data.icon;
  if (data.image !== undefined) updates.image = data.image;
  if (data.name_en !== undefined) updates.name_en = data.name_en;
  if (data.description_en !== undefined) updates.description_en = data.description_en;
  
  const { data: category, error } = await sc
    .from('es_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return category;
}

// Delete category
export async function deleteCategory(id: number) {
  const { error } = await sc
    .from('es_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Get usage count across all content types
export async function getCategoryUsageCount(id: number): Promise<number> {
  const [businessCount, attractionCount, eventCount, subEventCount] = await Promise.all([
    sc.from('es_business_categories').select('*', { count: 'exact', head: true }).eq('category_id', id),
    sc.from('es_attraction_categories').select('*', { count: 'exact', head: true }).eq('category_id', id),
    sc.from('es_event_categories').select('*', { count: 'exact', head: true }).eq('category_id', id),
    sc.from('es_sub_event_categories').select('*', { count: 'exact', head: true }).eq('category_id', id)
  ]);

  return (businessCount.count || 0) + (attractionCount.count || 0) + (eventCount.count || 0) + (subEventCount.count || 0);
}

// Reorder categories
export async function reorderCategories(orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await sc
      .from('es_categories')
      .update({ display_order: i })
      .eq('id', orderedIds[i]);
    
    if (error) throw error;
  }
  return true;
}

