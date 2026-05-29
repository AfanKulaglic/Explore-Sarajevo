import { sc } from '../../supabase';
import { resolveSlug } from '@/lib/explore/slug';

interface AttractionFilters {
  featured?: boolean;
  search?: string;
}

interface CategoryRelationship {
  id: number;
  is_highlight?: boolean;
  is_premium?: boolean;
}

interface TypeRelationship {
  id: number;
}

interface SectionRelationship {
  id: number;
  is_highlight?: boolean;
  is_premium?: boolean;
}

const ATTRACTION_SELECT = `*, es_attraction_types(type_id, es_types(id, name)), es_attraction_categories(category_id, is_highlight, is_premium, es_categories(id, name)), es_section_attractions(section:es_sections(id, name, slug), is_highlight, is_premium)`;

type AttrTypeRow = { type_id: number; es_types?: { id: number; name: string } | null };
type AttrCatRow = { category_id: number; is_highlight?: boolean; is_premium?: boolean; es_categories?: { id: number; name: string } | null };
type AttrSecRow = { section: { id: number; name: string; slug: string }; is_highlight?: boolean; is_premium?: boolean };
type AttractionBase = { id: number; name: string; [key: string]: unknown };

function transformAttraction(attraction: AttractionBase) {
  const types = ((attraction.es_attraction_types as AttrTypeRow[]) || []).map(at => ({
    id: at.type_id,
    name: at.es_types?.name || '',
  })).filter(t => t.id);

  const categories = ((attraction.es_attraction_categories as AttrCatRow[]) || []).map(ac => ({
    id: ac.category_id,
    name: ac.es_categories?.name || '',
    is_highlight: ac.is_highlight || false,
    is_premium: ac.is_premium || false,
  }));

  const sections = ((attraction.es_section_attractions as AttrSecRow[]) || [])
    .map(sa => ({ ...sa.section, is_highlight: sa.is_highlight || false, is_premium: sa.is_premium || false }))
    .filter(s => s?.id);

  return {
    ...attraction,
    types,
    type_ids: types.map(t => t.id),
    categories,
    category_ids: categories.map(c => c.id),
    sections,
    section_ids: sections.map(s => s.id),
    es_attraction_types: undefined,
    es_attraction_categories: undefined,
    es_section_attractions: undefined,
  };
}

// Get all attractions with related data
export async function getAllAttractions(filters: AttractionFilters = {}) {
  let query = sc
    .from('es_attractions')
    .select(ATTRACTION_SELECT);

  if (filters.featured !== undefined) {
    query = query.eq('featured_location', filters.featured);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  query = query.order('display_order', { ascending: true }).order('name', { ascending: true });

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(a => transformAttraction(a as unknown as AttractionBase));
}

// Get single attraction by ID
export async function getAttractionById(id: number) {
  const { data, error } = await sc
    .from('es_attractions')
    .select(ATTRACTION_SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;

  return transformAttraction(data as unknown as AttractionBase);
}

// Create attraction
export async function createAttraction(data: {
  name: string;
  slug?: string;
  description?: string;
  address?: string;
  location?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: string | object | null;
  featured_location?: boolean;
  media?: string | null;
  category_ids?: number[];
  type_ids?: number[];
  section_ids?: number[];
  display_order?: number;
  category_relationships?: CategoryRelationship[];
  type_relationships?: TypeRelationship[];
  section_relationships?: SectionRelationship[];
  // English translations
  name_en?: string;
  description_en?: string;
  address_en?: string;
  price_info_en?: string;
  opening_hours_en?: string;
}) {
  const {
    name, slug, description, address, location, phone, email, website, opening_hours,
    featured_location, media, display_order,
    category_ids = [], type_ids = [], section_ids = [],
    category_relationships, type_relationships, section_relationships,
    name_en, description_en, address_en, price_info_en, opening_hours_en
  } = data;

  const { data: attraction, error: attractionError } = await sc
    .from('es_attractions')
    .insert([{
      name,
      slug: resolveSlug(name, slug),
      description: description || '',
      address: address || '',
      location: location || '',
      phone: phone || null,
      email: email || null,
      website: website || null,
      opening_hours: typeof opening_hours === 'object' ? JSON.stringify(opening_hours) : (opening_hours || null),
      featured_location: featured_location || false,
      media: media || null,
      display_order: display_order ?? null,
      name_en: name_en || null,
      description_en: description_en || null,
      address_en: address_en || null,
      price_info_en: price_info_en || null,
      opening_hours_en: opening_hours_en || null
    }])
    .select()
    .single();

  if (attractionError) throw attractionError;

  // Insert types
  const typeRels = type_relationships || type_ids.map(id => ({ id }));
  if (typeRels.length > 0) {
    const { error: typeError } = await sc
      .from('es_attraction_types')
      .insert(typeRels.map(rel => ({ attraction_id: attraction.id, type_id: rel.id })));
    if (typeError) throw typeError;
  }

  // Insert categories
  const catRels = category_relationships || category_ids.map(id => ({ id, is_highlight: false, is_premium: false }));
  if (catRels.length > 0) {
    const { error: catError } = await sc
      .from('es_attraction_categories')
      .insert(catRels.map(rel => ({ attraction_id: attraction.id, category_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
    if (catError) throw catError;
  }

  // Insert sections
  const secRels = section_relationships || section_ids.map(id => ({ id, is_highlight: false, is_premium: false }));
  if (secRels.length > 0) {
    const { error: secError } = await sc
      .from('es_section_attractions')
      .insert(secRels.map(rel => ({ attraction_id: attraction.id, section_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
    if (secError) throw secError;
  }

  return getAttractionById(attraction.id);
}

// Update attraction
export async function updateAttraction(id: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  address: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  opening_hours: string | object | null;
  featured_location: boolean;
  media: string | null;
  display_order: number;
  category_ids: number[];
  type_ids: number[];
  section_ids: number[];
  category_relationships: CategoryRelationship[];
  type_relationships: TypeRelationship[];
  section_relationships: SectionRelationship[];
  // English translations
  name_en: string | null;
  description_en: string | null;
  address_en: string | null;
  price_info_en: string | null;
  opening_hours_en: string | null;
}>) {
  const {
    name, slug, description, address, location, phone, email, website, opening_hours,
    featured_location, media, display_order,
    category_ids, type_ids, section_ids,
    category_relationships, type_relationships, section_relationships,
    name_en, description_en, address_en, price_info_en, opening_hours_en
  } = data;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (address !== undefined) updates.address = address;
  if (location !== undefined) updates.location = location;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (website !== undefined) updates.website = website;
  if (opening_hours !== undefined) updates.opening_hours = typeof opening_hours === 'object' ? JSON.stringify(opening_hours) : opening_hours;
  if (featured_location !== undefined) updates.featured_location = featured_location;
  if (media !== undefined) updates.media = media;
  if (display_order !== undefined) updates.display_order = display_order;
  if (name_en !== undefined) updates.name_en = name_en;
  if (description_en !== undefined) updates.description_en = description_en;
  if (address_en !== undefined) updates.address_en = address_en;
  if (price_info_en !== undefined) updates.price_info_en = price_info_en;
  if (opening_hours_en !== undefined) updates.opening_hours_en = opening_hours_en;

  const { error: updateError } = await sc
    .from('es_attractions')
    .update(updates)
    .eq('id', id);

  if (updateError) throw updateError;

  // Update types if provided
  const typeRels = type_relationships || (type_ids !== undefined ? type_ids.map(tId => ({ id: tId })) : undefined);
  if (typeRels !== undefined) {
    await sc.from('es_attraction_types').delete().eq('attraction_id', id);
    if (typeRels.length > 0) {
      const { error: typeError } = await sc
        .from('es_attraction_types')
        .insert(typeRels.map(rel => ({ attraction_id: id, type_id: rel.id })));
      if (typeError) throw typeError;
    }
  }

  // Update categories if provided
  const catRels = category_relationships || (category_ids !== undefined ? category_ids.map(cId => ({ id: cId, is_highlight: false, is_premium: false })) : undefined);
  if (catRels !== undefined) {
    await sc.from('es_attraction_categories').delete().eq('attraction_id', id);
    if (catRels.length > 0) {
      const { error: catError } = await sc
        .from('es_attraction_categories')
        .insert(catRels.map(rel => ({ attraction_id: id, category_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
      if (catError) throw catError;
    }
  }

  // Update sections if provided
  const secRels = section_relationships || (section_ids !== undefined ? section_ids.map(sId => ({ id: sId, is_highlight: false, is_premium: false })) : undefined);
  if (secRels !== undefined) {
    await sc.from('es_section_attractions').delete().eq('attraction_id', id);
    if (secRels.length > 0) {
      const { error: secError } = await sc
        .from('es_section_attractions')
        .insert(secRels.map(rel => ({ attraction_id: id, section_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
      if (secError) throw secError;
    }
  }

  return getAttractionById(id);
}

// Delete attraction
export async function deleteAttraction(id: number) {
  const { error } = await sc
    .from('es_attractions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Reorder attractions
export async function reorderAttractions(orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await sc
      .from('es_attractions')
      .update({ display_order: i })
      .eq('id', orderedIds[i]);

    if (error) throw error;
  }
  return true;
}

// Helper: generate slug from name
