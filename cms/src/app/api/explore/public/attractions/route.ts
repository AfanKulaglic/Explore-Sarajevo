import { NextResponse } from 'next/server';
import * as attractionsModel from '@/lib/db/models/explore/attractions';
import { normalizeStorageUrl, parseMediaField } from '@/lib/explore/media';

export async function GET() {
  try {
    const attractions = await attractionsModel.getAllAttractions({});
    
    // Format for public API
    const publicAttractions = attractions.map((a: Record<string, unknown>) => {
      // Parse media field
      const images = parseMediaField(a.media)
        .map((url) => normalizeStorageUrl(url))
        .filter((url): url is string => Boolean(url));
      
      return {
        id: a.id,
        name: a.name,
        slug: a.slug,
        description: a.description,
        address: a.address,
        location: a.location,
        phone: a.phone || null,
        email: a.email || null,
        website: a.website || null,
        images: images,
        featuredLocation: a.featured_location,
        categoryId: (a.categories as { name?: string; id?: number }[])?.[0]?.name || (a.categories as { id?: number }[])?.[0]?.id,
        categories: a.categories || [],
        types: a.types || [],
        sections: a.sections || [],
        working_hours:
          typeof a.opening_hours === 'string'
            ? a.opening_hours
            : a.opening_hours
              ? JSON.stringify(a.opening_hours)
              : '',
        // English translations
        name_en: a.name_en || null,
        description_en: a.description_en || null,
        address_en: a.address_en || null,
        price_info_en: a.price_info_en || null,
        opening_hours_en: a.opening_hours_en || null
      };
    });
    
    return NextResponse.json(publicAttractions);
  } catch (error) {
    console.error('Error fetching public attractions:', error);
    return NextResponse.json({ error: 'Failed to fetch attractions' }, { status: 500 });
  }
}
