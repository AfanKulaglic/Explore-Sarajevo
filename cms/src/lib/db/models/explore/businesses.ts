import { sc } from '../../supabase';
import { resolveSlug } from '@/lib/explore/slug';

interface BusinessFilters {
  brand_id?: number;
  search?: string;
  section_id?: number;
}

interface CategoryRelationship {
  id: number;
  is_highlight?: boolean;
  is_premium?: boolean;
}

interface TypeRelationship {
  id: number;
  is_highlight?: boolean;
  is_premium?: boolean;
}

interface SectionRelationship {
  id: number;
  is_highlight?: boolean;
  is_premium?: boolean;
}

const BUSINESS_SELECT = `
  *,
  brand:crm_brands(id, name),
  es_business_types(type_id, is_highlight, is_premium, es_types(id, name)),
  es_business_categories(category_id, is_highlight, is_premium, es_categories(id, name)),
  es_section_businesses(section:es_sections(id, name, slug), is_highlight, is_premium)
`;

type BizTypeRow = { type_id: number; is_highlight?: boolean; is_premium?: boolean; es_types?: { id: number; name: string } | null };
type BizCatRow = { category_id: number; is_highlight?: boolean; is_premium?: boolean; es_categories?: { id: number; name: string } | null };
type BizSecRow = { section: { id: number; name: string; slug: string }; is_highlight?: boolean; is_premium?: boolean };
type BusinessBase = { id: number; name: string; [key: string]: unknown };

function transformBusiness(business: BusinessBase) {
  const types = ((business.es_business_types as BizTypeRow[]) || []).map(bt => ({
    id: bt.type_id,
    name: bt.es_types?.name || '',
    is_highlight: bt.is_highlight || false,
    is_premium: bt.is_premium || false,
  }));

  const categories = ((business.es_business_categories as BizCatRow[]) || []).map(bc => ({
    id: bc.category_id,
    name: bc.es_categories?.name || '',
    is_highlight: bc.is_highlight || false,
    is_premium: bc.is_premium || false,
  }));

  const sections = ((business.es_section_businesses as BizSecRow[]) || [])
    .map(sb => ({ ...sb.section, is_highlight: sb.is_highlight || false, is_premium: sb.is_premium || false }))
    .filter(s => s?.id);

  return {
    ...business,
    brand_name: (business.brand as { name?: string } | null)?.name || null,
    brand_slug: null,
    types,
    type_ids: types.map(t => t.id),
    categories,
    category_ids: categories.map(c => c.id),
    sections,
    section_ids: sections.map(s => s.id),
    es_business_types: undefined,
    es_business_categories: undefined,
    es_section_businesses: undefined,
  };
}

// Get all businesses with related data
export async function getAllBusinesses(filters: BusinessFilters = {}) {
  let query = sc
    .from('es_businesses')
    .select(BUSINESS_SELECT)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (filters.brand_id) {
    query = query.eq('brand_id', filters.brand_id);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  if (filters.section_id) {
    query = query.eq('es_section_businesses.section_id', filters.section_id);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(b => transformBusiness(b as unknown as BusinessBase));
}

// Helper to parse working_hours from database (could be JSON string or object)
function parseWorkingHours(value: unknown): Record<string, unknown> | string | null {
  if (!value) return null;
  if (typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') return parsed;
    } catch {
      // Not JSON, return as string (legacy format)
    }
    return value;
  }
  return null;
}

// Get single business by ID
export async function getBusinessById(id: number) {
  const { data, error } = await sc
    .from('es_businesses')
    .select(BUSINESS_SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...transformBusiness(data as unknown as BusinessBase),
    working_hours: parseWorkingHours((data as Record<string, unknown>).working_hours),
  };
}

// Create business
export async function createBusiness(data: {
  name: string;
  slug?: string;
  brand_id?: number | null;
  description?: string;
  address?: string;
  location?: string;
  rating?: number | null;
  working_hours?: Record<string, unknown> | string | null;
  telephone?: string | null;
  website?: string | null;
  media?: string[] | string | null;
  price_range?: string | null;
  email?: string | null;
  social_media?: Record<string, unknown> | null;
  display_order?: number;
  category_ids?: number[];
  type_ids?: number[];
  section_ids?: number[];
  category_relationships?: CategoryRelationship[];
  type_relationships?: TypeRelationship[];
  section_relationships?: SectionRelationship[];
  // English translations
  name_en?: string;
  description_en?: string;
  address_en?: string;
  price_range_en?: string;
}) {
  const {
    name, slug, brand_id, description, address, location,
    rating, working_hours, telephone, website, media,
    price_range, email, social_media, display_order,
    category_ids = [], type_ids = [], section_ids = [],
    category_relationships, type_relationships, section_relationships,
    name_en, description_en, address_en, price_range_en
  } = data;

  const serializedWorkingHours = working_hours
    ? (typeof working_hours === 'object' ? JSON.stringify(working_hours) : working_hours)
    : null;

  const { data: business, error: businessError } = await sc
    .from('es_businesses')
    .insert([{
      name,
      slug: resolveSlug(name, slug),
      brand_id: brand_id || null,
      description: description || '',
      address: address || '',
      location: location || '',
      rating: rating || null,
      working_hours: serializedWorkingHours,
      telephone: telephone || null,
      website: website || null,
      media: media || null,
      price_range: price_range || null,
      email: email || null,
      social_media: social_media || null,
      display_order: display_order ?? null,
      name_en: name_en || null,
      description_en: description_en || null,
      address_en: address_en || null,
      price_range_en: price_range_en || null
    }])
    .select()
    .single();

  if (businessError) throw businessError;

  // Insert categories
  const catRels = category_relationships || category_ids.map(id => ({ id, is_highlight: false, is_premium: false }));
  if (catRels.length > 0) {
    const { error: catError } = await sc
      .from('es_business_categories')
      .insert(catRels.map(rel => ({ business_id: business.id, category_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
    if (catError) throw catError;
  }

  // Insert types
  const typeRels = type_relationships || type_ids.map(id => ({ id, is_highlight: false, is_premium: false }));
  if (typeRels.length > 0) {
    const { error: typeError } = await sc
      .from('es_business_types')
      .insert(typeRels.map(rel => ({ business_id: business.id, type_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
    if (typeError) throw typeError;
  }

  // Insert sections
  const secRels = section_relationships || section_ids.map(id => ({ id, is_highlight: false, is_premium: false }));
  if (secRels.length > 0) {
    const { error: secError } = await sc
      .from('es_section_businesses')
      .insert(secRels.map(rel => ({ business_id: business.id, section_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
    if (secError) throw secError;
  }

  return getBusinessById(business.id);
}

// Update business
export async function updateBusiness(id: number, data: Partial<{
  name: string;
  slug: string;
  brand_id: number | null;
  description: string;
  address: string;
  location: string;
  rating: number | null;
  working_hours: Record<string, unknown> | string | null;
  telephone: string | null;
  website: string | null;
  media: string[] | string | null;
  price_range: string | null;
  email: string | null;
  social_media: Record<string, unknown> | null;
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
  price_range_en: string | null;
}>) {
  const {
    name, slug, brand_id, description, address, location,
    rating, working_hours, telephone, website, media,
    price_range, email, social_media,
    category_ids, type_ids, section_ids,
    category_relationships, type_relationships, section_relationships,
    name_en, description_en, address_en, price_range_en
  } = data;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (brand_id !== undefined) updates.brand_id = brand_id;
  if (description !== undefined) updates.description = description;
  if (address !== undefined) updates.address = address;
  if (location !== undefined) updates.location = location;
  if (rating !== undefined) updates.rating = rating;
  if (working_hours !== undefined) {
    updates.working_hours = working_hours
      ? (typeof working_hours === 'object' ? JSON.stringify(working_hours) : working_hours)
      : null;
  }
  if (telephone !== undefined) updates.telephone = telephone;
  if (website !== undefined) updates.website = website;
  if (media !== undefined) updates.media = media;
  if (price_range !== undefined) updates.price_range = price_range;
  if (email !== undefined) updates.email = email;
  if (social_media !== undefined) updates.social_media = social_media;
  if (name_en !== undefined) updates.name_en = name_en;
  if (description_en !== undefined) updates.description_en = description_en;
  if (address_en !== undefined) updates.address_en = address_en;
  if (price_range_en !== undefined) updates.price_range_en = price_range_en;

  const { error: updateError } = await sc
    .from('es_businesses')
    .update(updates)
    .eq('id', id);

  if (updateError) throw updateError;

  // Update categories if provided
  const catRels = category_relationships || (category_ids !== undefined ? category_ids.map(cId => ({ id: cId, is_highlight: false, is_premium: false })) : undefined);
  if (catRels !== undefined) {
    await sc.from('es_business_categories').delete().eq('business_id', id);
    if (catRels.length > 0) {
      const { error: catError } = await sc
        .from('es_business_categories')
        .insert(catRels.map(rel => ({ business_id: id, category_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
      if (catError) throw catError;
    }
  }

  // Update types if provided
  const typeRels = type_relationships || (type_ids !== undefined ? type_ids.map(tId => ({ id: tId, is_highlight: false, is_premium: false })) : undefined);
  if (typeRels !== undefined) {
    await sc.from('es_business_types').delete().eq('business_id', id);
    if (typeRels.length > 0) {
      const { error: typeError } = await sc
        .from('es_business_types')
        .insert(typeRels.map(rel => ({ business_id: id, type_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
      if (typeError) throw typeError;
    }
  }

  // Update sections if provided
  const secRels = section_relationships || (section_ids !== undefined ? section_ids.map(sId => ({ id: sId, is_highlight: false, is_premium: false })) : undefined);
  if (secRels !== undefined) {
    await sc.from('es_section_businesses').delete().eq('business_id', id);
    if (secRels.length > 0) {
      const { error: secError } = await sc
        .from('es_section_businesses')
        .insert(secRels.map(rel => ({ business_id: id, section_id: rel.id, is_highlight: rel.is_highlight || false, is_premium: rel.is_premium || false })));
      if (secError) throw secError;
    }
  }

  return getBusinessById(id);
}

// Delete business (junction rows and brand links first — FK constraints)
export async function deleteBusiness(id: number) {
  const junctionTables = [
    'es_business_categories',
    'es_business_types',
    'es_section_businesses',
  ] as const;

  for (const table of junctionTables) {
    const { error } = await sc.from(table).delete().eq('business_id', id);
    if (error) throw error;
  }

  const { error } = await sc.from('es_businesses').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// Reorder businesses
export async function reorderBusinesses(orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await sc
      .from('es_businesses')
      .update({ display_order: i })
      .eq('id', orderedIds[i]);

    if (error) throw error;
  }
  return true;
}

