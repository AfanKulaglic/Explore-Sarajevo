import { NextRequest, NextResponse } from 'next/server';
import * as businessesModel from '@/lib/db/models/explore/businesses';
import { normalizeStorageUrl, parseMediaField } from '@/lib/explore/media';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      section_id: searchParams.get('section_id') ? Number(searchParams.get('section_id')) : undefined,
    };
    
    const businesses = await businessesModel.getAllBusinesses(filters);
    
    // Format for public consumption
    const publicBusinesses = businesses.map((b: Record<string, unknown>) => {
      // Parse media field
      const images = parseMediaField(b.media)
        .map((url) => normalizeStorageUrl(url))
        .filter((url): url is string => Boolean(url));
      
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description || '',
        address: b.address || '',
        location: b.location || '',
        phone: b.telephone || b.phone,
        email: b.email,
        website: b.website,
        rating: b.rating || 0,
        workingHours: b.working_hours || '',
        working_hours: b.working_hours || '',
        priceRange: b.price_range,
        images: images,
        brandId: b.brand_id,
        brand_id: b.brand_id,
        brandName: b.brand_name,
        brandSlug: b.brand_slug,
        categoryId: (b.categories as { name?: string; id?: number }[])?.[0]?.name || (b.categories as { id?: number }[])?.[0]?.id || '',
        parentCategoryId: (b.categories as { id?: number }[])?.[0]?.id,
        categories: b.categories || [],
        types: b.types || [],
        sections: b.sections || [],
        // English translations
        name_en: b.name_en || null,
        description_en: b.description_en || null,
        address_en: b.address_en || null,
        price_range_en: b.price_range_en || null
      };
    });
    
    return NextResponse.json(publicBusinesses);
  } catch (error) {
    console.error('Error fetching public businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}
