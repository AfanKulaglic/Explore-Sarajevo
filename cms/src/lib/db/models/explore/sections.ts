import { sc } from '../../supabase';
import { resolveSlug } from '@/lib/explore/slug';

// Get all sections
export async function getAllSections() {
  const { data, error } = await sc
    .from('es_sections')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

// Get single section by ID
export async function getSectionById(id: number) {
  const { data, error } = await sc
    .from('es_sections')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Get section by slug
export async function getSectionBySlug(slug: string) {
  const { data, error } = await sc
    .from('es_sections')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

// Create section
export async function createSection(data: {
  name: string;
  slug?: string;
  description?: string;
  domain?: string | null;
  icon?: string | null;
  image?: string | null;
  is_active?: boolean;
  featured?: boolean;
  display_order?: number;
  meta?: Record<string, unknown>;
}) {
  const { name, slug, description, domain, icon, image, is_active, featured, display_order, meta } = data;
  
  const { data: section, error } = await sc
    .from('es_sections')
    .insert([{
      name,
      slug: resolveSlug(name, slug),
      description: description || '',
      domain: domain || null,
      icon: icon || null,
      image: image || null,
      is_active: is_active !== undefined ? is_active : true,
      featured: featured !== undefined ? featured : false,
      display_order: display_order ?? null,
      meta: meta || {}
    }])
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return section;
}

// Update section
export async function updateSection(id: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  domain: string | null;
  image: string | null;
  is_active: boolean;
  featured: boolean;
  meta: Record<string, unknown>;
}>) {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.description !== undefined) updates.description = data.description;
  if (data.domain !== undefined) updates.domain = data.domain;
  if (data.image !== undefined) updates.image = data.image;
  if (data.is_active !== undefined) updates.is_active = data.is_active;
  if (data.featured !== undefined) updates.featured = data.featured;
  if (data.meta !== undefined) updates.meta = data.meta;
  
  const { data: section, error } = await sc
    .from('es_sections')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  
  if (error) throw error;
  return section;
}

// Delete section
export async function deleteSection(id: number) {
  const { error } = await sc
    .from('es_sections')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}

// Reorder sections
export async function reorderSections(orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await sc
      .from('es_sections')
      .update({ display_order: i })
      .eq('id', orderedIds[i]);
    
    if (error) throw error;
  }
  return true;
}

// Get section usage count
export async function getSectionUsageCount(id: number): Promise<number> {
  const [businessCount, attractionCount, eventCount] = await Promise.all([
    sc.from('es_section_businesses').select('*', { count: 'exact', head: true }).eq('section_id', id),
    sc.from('es_section_attractions').select('*', { count: 'exact', head: true }).eq('section_id', id),
    sc.from('es_section_events').select('*', { count: 'exact', head: true }).eq('section_id', id)
  ]);
  
  return (businessCount.count || 0) + (attractionCount.count || 0) + (eventCount.count || 0);
}

// Helper: generate slug from name
