import { sc } from '../../supabase';

// Get all sub-events (optionally filtered by event)
export async function getAllSubEvents(eventId: number | null = null) {
  let query = sc
    .from('es_sub_events')
    .select('*, event:es_events(id, name), es_sub_event_categories(category_id, is_highlight, is_premium, es_categories(id, name)), es_sub_event_types(type_id, es_types(id, name))');
  
  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform nested data
  return (data || []).map(subEvent => ({
    ...subEvent,
    event_name: subEvent.event?.name || null,
    event: undefined,
    categories: (subEvent.es_sub_event_categories || []).map((sec: { category_id: number; is_highlight?: boolean; is_premium?: boolean; es_categories?: { id: number; name: string } | null }) => ({ id: sec.category_id, name: sec.es_categories?.name || '', is_highlight: sec.is_highlight || false, is_premium: sec.is_premium || false })).filter((c: { id?: number }) => c.id),
    es_sub_event_categories: undefined,
    types: (subEvent.es_sub_event_types || []).map((set: { type_id: number; es_types?: { id: number; name: string } | null }) => ({ id: set.type_id, name: set.es_types?.name || '' })).filter((t: { id?: number }) => t.id),
    es_sub_event_types: undefined
  }));
}

// Get single sub-event by ID
export async function getSubEventById(id: number) {
  const { data, error } = await sc
    .from('es_sub_events')
    .select('*, event:es_events(id, name), es_sub_event_categories(category:es_categories(id, name)), es_sub_event_types(type:es_types(id, name))')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    event_name: data.event?.name || null,
    event: undefined,
    categories: data.es_sub_event_categories?.map((sec: { category: { id: number; name: string } }) => sec.category).filter(Boolean) || [],
    es_sub_event_categories: undefined,
    types: data.es_sub_event_types?.map((set: { type: { id: number; name: string } }) => set.type).filter(Boolean) || [],
    es_sub_event_types: undefined
  };
}

// Create sub-event
export async function createSubEvent(data: {
  event_id: number;
  description?: string;
  media?: string | null;
  status?: string;
  show_event?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  location?: string;
  category_ids?: number[];
  type_ids?: number[];
}) {
  const {
    event_id, description, media, status, show_event,
    start_date, end_date, location,
    category_ids = [], type_ids = []
  } = data;
  
  if (!event_id) {
    throw new Error('event_id is required for sub-events');
  }
  
  // Build date range if dates provided
  let dateRange = null;
  if (start_date && end_date) {
    dateRange = `[${start_date},${end_date}]`;
  } else if (start_date) {
    dateRange = `[${start_date},)`;
  }
  
  // Insert sub-event
  const { data: subEvent, error: subEventError } = await sc
    .from('es_sub_events')
    .insert([{
      event_id,
      description: description || '',
      media: media || null,
      date_range: dateRange,
      status: status || 'draft',
      show_event: show_event !== undefined ? show_event : true,
      location: location || ''
    }])
    .select()
    .single();
  
  if (subEventError) throw subEventError;
  
  // Insert categories
  if (category_ids.length > 0) {
    const categoryLinks = category_ids.map(categoryId => ({
      sub_event_id: subEvent.id,
      category_id: categoryId
    }));
    
    const { error: catError } = await sc
      .from('es_sub_event_categories')
      .insert(categoryLinks);
    
    if (catError) throw catError;
  }
  
  // Insert types
  if (type_ids.length > 0) {
    const typeLinks = type_ids.map(typeId => ({
      sub_event_id: subEvent.id,
      type_id: typeId
    }));
    
    const { error: typeError } = await sc
      .from('es_sub_event_types')
      .insert(typeLinks);
    
    if (typeError) throw typeError;
  }
  
  return getSubEventById(subEvent.id);
}

// Update sub-event
export async function updateSubEvent(id: number, data: Partial<{
  description: string;
  media: string | null;
  status: string;
  show_event: boolean;
  start_date: string | null;
  end_date: string | null;
  category_ids: number[];
  type_ids: number[];
}>) {
  const {
    description, media, status, show_event,
    start_date, end_date,
    category_ids, type_ids
  } = data;
  
  // Build update object
  const updates: Record<string, unknown> = {};
  if (description !== undefined) updates.description = description;
  if (media !== undefined) updates.media = media;
  if (status !== undefined) updates.status = status;
  if (show_event !== undefined) updates.show_event = show_event;
  
  // Build date range if dates provided
  if (start_date !== undefined || end_date !== undefined) {
    if (start_date && end_date) {
      updates.date_range = `[${start_date},${end_date}]`;
    } else if (start_date) {
      updates.date_range = `[${start_date},)`;
    } else {
      updates.date_range = null;
    }
  }
  
  // Update sub-event
  const { error: updateError } = await sc
    .from('es_sub_events')
    .update(updates)
    .eq('id', id);
  
  if (updateError) throw updateError;
  
  // Update categories if provided
  if (category_ids !== undefined) {
    await sc.from('es_sub_event_categories').delete().eq('sub_event_id', id);
    
    if (category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        sub_event_id: id,
        category_id: categoryId
      }));
      
      const { error: catError } = await sc
        .from('es_sub_event_categories')
        .insert(categoryLinks);
      
      if (catError) throw catError;
    }
  }
  
  // Update types if provided
  if (type_ids !== undefined) {
    await sc.from('es_sub_event_types').delete().eq('sub_event_id', id);
    
    if (type_ids.length > 0) {
      const typeLinks = type_ids.map(typeId => ({
        sub_event_id: id,
        type_id: typeId
      }));
      
      const { error: typeError } = await sc
        .from('es_sub_event_types')
        .insert(typeLinks);
      
      if (typeError) throw typeError;
    }
  }
  
  return getSubEventById(id);
}

// Delete sub-event
export async function deleteSubEvent(id: number) {
  const { error } = await sc
    .from('es_sub_events')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}
