import { sc } from '../../supabase';
import { resolveSlug } from '@/lib/explore/slug';

interface EventFilters {
  status?: string;
  search?: string;
}

const EVENT_SELECT = '*, es_event_types(type_id, is_highlight, is_premium, es_types(id, name)), es_event_categories(category_id, is_highlight, is_premium, es_categories(id, name))';

type EvTypeRow = { type_id: number; is_highlight?: boolean; is_premium?: boolean; es_types?: { id: number; name: string } | null };
type EvCatRow = { category_id: number; is_highlight?: boolean; is_premium?: boolean; es_categories?: { id: number; name: string } | null };
type EventBase = { id: number; name: string; [key: string]: unknown };

function transformEvent(event: EventBase) {
  const types = ((event.es_event_types as EvTypeRow[]) || []).map(et => ({
    id: et.type_id,
    name: et.es_types?.name || '',
    is_highlight: et.is_highlight || false,
    is_premium: et.is_premium || false,
  }));

  const categories = ((event.es_event_categories as EvCatRow[]) || []).map(ec => ({
    id: ec.category_id,
    name: ec.es_categories?.name || '',
    is_highlight: ec.is_highlight || false,
    is_premium: ec.is_premium || false,
  }));

  return {
    ...event,
    types,
    type_ids: types.map(t => t.id),
    categories,
    category_ids: categories.map(c => c.id),
    es_event_types: undefined,
    es_event_categories: undefined,
  };
}

// Get all events with related data
export async function getAllEvents(filters: EventFilters = {}) {
  let query = sc
    .from('es_events')
    .select(EVENT_SELECT);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  query = query.order('name', { ascending: true });

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(e => transformEvent(e as unknown as EventBase));
}

// Get single event by ID
export async function getEventById(id: number) {
  const { data, error } = await sc
    .from('es_events')
    .select(EVENT_SELECT)
    .eq('id', id)
    .single();

  if (error) throw error;

  return transformEvent(data as unknown as EventBase);
}

// Create event
export async function createEvent(data: {
  name: string;
  slug?: string;
  description?: string;
  location?: string;
  status?: string;
  media?: string | null;
  image?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  show_date_range?: boolean;
  category_ids?: number[];
  type_ids?: number[];
  // English translations
  name_en?: string;
  description_en?: string;
  price_info_en?: string;
}) {
  const {
    name, slug, description, location, status, media, image,
    start_date, end_date, show_date_range,
    category_ids = [], type_ids = [],
    name_en, description_en, price_info_en
  } = data;

  let dateRange = null;
  if (start_date && end_date) {
    dateRange = `[${start_date},${end_date}]`;
  } else if (start_date) {
    dateRange = `[${start_date},)`;
  }

  const { data: event, error: eventError } = await sc
    .from('es_events')
    .insert([{
      name,
      slug: resolveSlug(name, slug),
      description: description || '',
      location: location || '',
      status: status || 'draft',
      media: media || image || null,
      date_range: dateRange,
      show_date_range: show_date_range !== undefined ? show_date_range : true,
      name_en: name_en || null,
      description_en: description_en || null,
      price_info_en: price_info_en || null
    }])
    .select()
    .single();

  if (eventError) throw eventError;

  if (category_ids.length > 0) {
    const { error: catError } = await sc
      .from('es_event_categories')
      .insert(category_ids.map(categoryId => ({ event_id: event.id, category_id: categoryId })));
    if (catError) throw catError;
  }

  if (type_ids.length > 0) {
    const { error: typeError } = await sc
      .from('es_event_types')
      .insert(type_ids.map(typeId => ({ event_id: event.id, type_id: typeId })));
    if (typeError) throw typeError;
  }

  return getEventById(event.id);
}

// Update event
export async function updateEvent(id: number, data: Partial<{
  name: string;
  slug: string;
  description: string;
  status: string;
  media: string | null;
  start_date: string | null;
  end_date: string | null;
  show_date_range: boolean;
  category_ids: number[];
  type_ids: number[];
  // English translations
  name_en: string | null;
  description_en: string | null;
  price_info_en: string | null;
}>) {
  const {
    name, slug, description, status, media,
    start_date, end_date, show_date_range,
    category_ids, type_ids,
    name_en, description_en, price_info_en
  } = data;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (media !== undefined) updates.media = media;
  if (show_date_range !== undefined) updates.show_date_range = show_date_range;
  if (name_en !== undefined) updates.name_en = name_en;
  if (description_en !== undefined) updates.description_en = description_en;
  if (price_info_en !== undefined) updates.price_info_en = price_info_en;

  if (start_date !== undefined || end_date !== undefined) {
    if (start_date && end_date) {
      updates.date_range = `[${start_date},${end_date}]`;
    } else if (start_date) {
      updates.date_range = `[${start_date},)`;
    } else {
      updates.date_range = null;
    }
  }

  const { error: updateError } = await sc
    .from('es_events')
    .update(updates)
    .eq('id', id);

  if (updateError) throw updateError;

  if (category_ids !== undefined) {
    await sc.from('es_event_categories').delete().eq('event_id', id);
    if (category_ids.length > 0) {
      const { error: catError } = await sc
        .from('es_event_categories')
        .insert(category_ids.map(categoryId => ({ event_id: id, category_id: categoryId })));
      if (catError) throw catError;
    }
  }

  if (type_ids !== undefined) {
    await sc.from('es_event_types').delete().eq('event_id', id);
    if (type_ids.length > 0) {
      const { error: typeError } = await sc
        .from('es_event_types')
        .insert(type_ids.map(typeId => ({ event_id: id, type_id: typeId })));
      if (typeError) throw typeError;
    }
  }

  return getEventById(id);
}

// Delete event (and cascade to sub-events)
export async function deleteEvent(id: number) {
  const { error } = await sc
    .from('es_events')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Helper: generate slug from name
