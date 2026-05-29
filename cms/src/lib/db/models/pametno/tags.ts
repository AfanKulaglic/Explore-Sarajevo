import { sc } from '../../supabase';

// Get all tags
export async function getAllTags(search?: string) {
  let query = sc
    .from('po_tags')
    .select('*')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get tag by ID
export async function getTagById(id: number) {
  const { data, error } = await sc
    .from('po_tags')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Create tag
export async function createTag(tagData: {
  name: string;
  slug?: string;
  // English translation
  name_en?: string;
}) {
  // Generate slug if not provided
  if (!tagData.slug && tagData.name) {
    tagData.slug = tagData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await sc
    .from('po_tags')
    .insert(tagData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update tag
export async function updateTag(id: number, tagData: Partial<{
  name: string;
  slug: string;
  // English translation
  name_en: string;
}>) {
  const { data, error } = await sc
    .from('po_tags')
    .update(tagData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete tag
export async function deleteTag(id: number) {
  const { error } = await sc
    .from('po_tags')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
