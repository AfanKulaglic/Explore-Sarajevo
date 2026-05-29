import { NextRequest, NextResponse } from 'next/server';
import * as categoriesModel from '@/lib/db/models/explore/categories';
import * as typesModel from '@/lib/db/models/explore/types';
import { getCategoryCoverUrls, resolveCategoryImage } from '@/lib/explore/category-covers';
import { normalizeStorageUrl } from '@/lib/explore/media';
import { resolveSlug } from '@/lib/explore/slug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';
    
    const allCategories = await categoriesModel.getAllCategories();
    const types = await typesModel.getAllTypes();
    
    let categories = showAll
      ? allCategories
      : allCategories.filter((cat: { featured_category?: boolean }) => cat.featured_category === true);

    // Homepage uses featured only — if none flagged, show all so the section is never empty
    if (!showAll && categories.length === 0) {
      categories = allCategories;
    }

    const coverMap = await getCategoryCoverUrls();

    const categoriesWithTypes = categories.map((cat: { id: number; name: string; slug?: string | null; description?: string; icon?: string; image?: string; name_en?: string; description_en?: string }) => {
      const coverImage = resolveCategoryImage(cat.id, cat.image, coverMap);
      return {
      id: cat.id,
      name: cat.name,
      slug: resolveSlug(cat.name, cat.slug),
      description: cat.description,
      icon: normalizeStorageUrl(cat.icon),
      image: coverImage,
      coverImage,
      // English translations
      name_en: cat.name_en,
      description_en: cat.description_en,
      subcategories: types
        .filter((t: { category_id?: number }) => t.category_id === cat.id)
        .map((t: { id: number; name: string; slug?: string | null; name_en?: string; description_en?: string }) => ({
          id: t.id,
          name: t.name,
          slug: resolveSlug(t.name, t.slug),
          name_en: t.name_en,
          description_en: t.description_en
        }))
    };
    });
    
    return NextResponse.json(categoriesWithTypes);
  } catch (error) {
    console.error('Error fetching public categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
