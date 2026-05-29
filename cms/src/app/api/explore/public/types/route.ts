import { NextRequest, NextResponse } from 'next/server';
import * as typesModel from '@/lib/db/models/explore/types';
import { resolveSlug } from '@/lib/explore/slug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined
    };
    const types = (await typesModel.getAllTypes(filters)).map(
      (t: {
        name: string;
        slug?: string | null;
        category_name?: string | null;
        category_slug?: string | null;
        [key: string]: unknown;
      }) => ({
        ...t,
        slug: resolveSlug(t.name, t.slug),
        category_slug: t.category_name
          ? resolveSlug(t.category_name, t.category_slug)
          : t.category_slug,
      })
    );
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching public types:', error);
    return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
  }
}
