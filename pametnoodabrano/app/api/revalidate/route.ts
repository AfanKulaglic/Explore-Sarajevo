import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * On-demand revalidation endpoint for pametno-saraya.
 * Called by the CMS after content changes to immediately refresh cached data.
 * 
 * POST /api/revalidate
 * Body: { secret: string, tags: string[] }
 * 
 * Tags: 'products', 'categories', 'brands', 'collections', 'featured'
 * Use tag 'all' to revalidate everything.
 */

// Map tags to the page paths that depend on them
const TAG_PATH_MAP: Record<string, string[]> = {
  products: ['/', '/products', '/brands', '/categories'],
  featured: ['/'],
  categories: ['/', '/products', '/categories'],
  brands: ['/brands'],
  collections: ['/'],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, tags } = body;

    // Verify secret
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
    }

    const allTags = ['products', 'categories', 'brands', 'collections', 'featured'];

    const tagsToRevalidate = tags.includes('all') ? allTags : tags;

    // 1. Invalidate the fetch/data cache by tag
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag, { expire: 0 });
    }

    // 2. Invalidate the Full Route Cache for pages that depend on these tags
    //    This ensures the rendered page output is also regenerated
    const pathsToRevalidate = new Set<string>();
    for (const tag of tagsToRevalidate) {
      const paths = TAG_PATH_MAP[tag] || [];
      paths.forEach(p => pathsToRevalidate.add(p));
    }
    // Always revalidate dynamic product/category routes via layout
    if (tagsToRevalidate.includes('products')) {
      pathsToRevalidate.add('/products/[id]');
    }
    if (tagsToRevalidate.includes('categories')) {
      pathsToRevalidate.add('/categories/[slug]');
    }

    for (const path of pathsToRevalidate) {
      revalidatePath(path, 'page');
    }

    console.log(`[Revalidate] Tags: ${tagsToRevalidate.join(', ')} | Paths: ${Array.from(pathsToRevalidate).join(', ')}`);

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
      paths: Array.from(pathsToRevalidate),
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
