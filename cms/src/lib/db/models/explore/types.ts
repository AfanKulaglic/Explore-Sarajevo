import { sc } from '../../supabase';
import { generateSlug, resolveSlug } from '@/lib/explore/slug';

// Get all types
export async function getAllTypes(filters: { category_id?: number } = {}) {
  let query = sc
    .from('es_types')
    .select('*, category:es_categories!es_types_category_id_fkey(id, name, slug)')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
  
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data || []).map(type => ({
    ...type,
    category_name: type.category?.name || null,
    category_slug: type.category?.slug || null
  }));
}

// Get single type by ID
export async function getTypeById(id: number) {
  const { data, error } = await sc
    .from('es_types')
    .select('*, category:es_categories!es_types_category_id_fkey(id, name, slug)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return {
    ...data,
    category_name: data.category?.name || null,
    category_slug: data.category?.slug || null
  };
}

// Create type
export async function createType(data: {
  name: string;
  slug?: string;
  description?: string;
  icon?: string | null;
  image?: string | null;
  category_id?: number | null;
  // English translations
  name_en?: string;
  description_en?: string;
}) {
  const { name, slug, description, icon, image, category_id, name_en, description_en } = data;
  
  const { data: newType, error } = await sc
    .from('es_types')
    .insert([{
      name,
      slug: resolveSlug(name, slug),
      description: description || '',
      icon: icon || null,
      image: image || null,
      category_id: category_id || null,
      name_en: name_en || null,
      description_en: description_en || null
    }])
    .select()
    .single();
  
  if (error) throw error;
  return getTypeById(newType.id);
}

// Update type
export async function updateType(id: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  image: string | null;
  category_id: number | null;
  // English translations
  name_en: string | null;
  description_en: string | null;
}>) {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.slug !== undefined || data.name !== undefined) {
    const { data: existing } = await sc
      .from('es_types')
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
  if (data.image !== undefined) updates.image = data.image;
  if (data.category_id !== undefined) updates.category_id = data.category_id;
  if (data.name_en !== undefined) updates.name_en = data.name_en;
  if (data.description_en !== undefined) updates.description_en = data.description_en;
  
  const { error } = await sc
    .from('es_types')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
  return getTypeById(id);
}

// Delete type
export async function deleteType(id: number) {
  const { error } = await sc
    .from('es_types')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Get usage count across all content types
export async function getTypeUsageCount(id: number): Promise<number> {
  const [businessTypes, attractionTypes, eventTypes, subEventTypes] = await Promise.all([
    sc.from('es_business_types').select('*', { count: 'exact', head: true }).eq('type_id', id),
    sc.from('es_attraction_types').select('*', { count: 'exact', head: true }).eq('type_id', id),
    sc.from('es_event_types').select('*', { count: 'exact', head: true }).eq('type_id', id),
    sc.from('es_sub_event_types').select('*', { count: 'exact', head: true }).eq('type_id', id)
  ]);

  return (businessTypes.count || 0) + (attractionTypes.count || 0) + (eventTypes.count || 0) + (subEventTypes.count || 0);
}

// Reorder types
export async function reorderTypes(orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await sc
      .from('es_types')
      .update({ display_order: i })
      .eq('id', orderedIds[i]);
    
    if (error) throw error;
  }
  return true;
}

