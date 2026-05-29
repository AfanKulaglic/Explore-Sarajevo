import { sc } from '../../supabase';

function mapBrandRow(
  brand: {
    id: number;
    name: string;
    client_id?: number | null;
    logo_url?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
  },
  businessCount = 0
) {
  return {
    id: brand.id,
    name: brand.name,
    client_id: brand.client_id,
    logo_url: brand.logo_url,
    logo: brand.logo_url,
    notes: brand.notes,
    created_at: brand.created_at,
    updated_at: brand.updated_at,
    business_count: businessCount,
  };
}

// Get all brands (crm_brands: id, client_id, name, logo_url, notes, timestamps)
export async function getAllBrands(search?: string) {
  let query = sc.from('crm_brands').select('*').order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const brandsWithCounts = await Promise.all(
    (data || []).map(async (brand) => {
      const { count } = await sc
        .from('es_businesses')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id);

      return mapBrandRow(brand, count || 0);
    })
  );

  return brandsWithCounts;
}

export async function getBrandById(id: number) {
  const { data, error } = await sc.from('crm_brands').select('*').eq('id', id).single();
  if (error) throw error;

  const { count } = await sc
    .from('es_businesses')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', id);

  return mapBrandRow(data, count || 0);
}

export async function createBrand(data: { name: string; logo_url?: string | null; notes?: string | null; client_id?: number | null }) {
  const { name, logo_url, notes, client_id } = data;

  const { data: newBrand, error } = await sc
    .from('crm_brands')
    .insert([
      {
        name,
        logo_url: logo_url || null,
        notes: notes || null,
        ...(client_id != null ? { client_id } : {}),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return mapBrandRow(newBrand);
}

export async function updateBrand(
  id: number,
  data: Partial<{ name: string; logo_url: string | null; notes: string | null; client_id: number | null }>
) {
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.logo_url !== undefined) updates.logo_url = data.logo_url;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.client_id !== undefined) updates.client_id = data.client_id;

  const { data: updatedBrand, error } = await sc
    .from('crm_brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapBrandRow(updatedBrand);
}

export async function deleteBrand(id: number) {
  const { error } = await sc.from('crm_brands').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function searchBrands(searchTerm: string) {
  const { data, error } = await sc
    .from('crm_brands')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map((brand) => mapBrandRow(brand));
}
