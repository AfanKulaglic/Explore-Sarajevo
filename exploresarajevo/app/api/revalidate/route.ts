import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * On-demand revalidation endpoint for explore-sarajevo.
 * Called by the CMS after content changes to immediately refresh cached data.
 * 
 * POST /api/revalidate
 * Body: { secret: string, tags: string[] }
 * 
 * Tags: 'businesses', 'categories', 'attractions', 'events', 'brands', 'types', 'subevents', 'highlights', 'homepage'
 * Use tag 'all' to revalidate everything.
 */
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

    const allTags = [
      'businesses', 'categories', 'attractions', 'events',
      'brands', 'types', 'subevents', 'highlights', 'homepage'
    ];

    const tagsToRevalidate = tags.includes('all') ? allTags : tags;

    for (const tag of tagsToRevalidate) {
      revalidateTag(tag, { expire: 0 });
    }

    console.log(`[Revalidate] Revalidated tags: ${tagsToRevalidate.join(', ')}`);

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 });
  }
}
