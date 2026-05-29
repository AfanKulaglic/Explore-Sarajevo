import { sc } from '../db/supabase';
import { firstMediaUrl, normalizeStorageUrl } from './media';

type CoverCandidate = {
  categoryId: number;
  url: string;
  score: number;
};

function coverScore(isPremium?: boolean, isHighlight?: boolean): number {
  if (isPremium) return 3;
  if (isHighlight) return 2;
  return 1;
}

function addCandidate(
  candidates: CoverCandidate[],
  categoryId: number,
  media: unknown,
  isPremium?: boolean,
  isHighlight?: boolean
) {
  const raw = firstMediaUrl(media);
  const url = normalizeStorageUrl(raw);
  if (!url) return;
  candidates.push({
    categoryId,
    url,
    score: coverScore(isPremium, isHighlight),
  });
}

/**
 * Best cover image per category from linked businesses/attractions when es_categories.image is empty.
 */
export async function getCategoryCoverUrls(): Promise<Map<number, string>> {
  const candidates: CoverCandidate[] = [];

  const [{ data: businessRows }, { data: attractionRows }, { data: eventRows }] =
    await Promise.all([
    sc
      .from('es_business_categories')
      .select('category_id, is_premium, is_highlight, es_businesses(media)'),
    sc
      .from('es_attraction_categories')
      .select('category_id, is_premium, is_highlight, es_attractions(media)'),
    sc
      .from('es_event_categories')
      .select('category_id, is_premium, is_highlight, es_events(media)'),
  ]);

  for (const row of businessRows || []) {
    const r = row as {
      category_id: number;
      is_premium?: boolean;
      is_highlight?: boolean;
      es_businesses?: { media?: unknown } | null;
    };
    addCandidate(
      candidates,
      r.category_id,
      r.es_businesses?.media,
      r.is_premium,
      r.is_highlight
    );
  }

  for (const row of attractionRows || []) {
    const r = row as {
      category_id: number;
      is_premium?: boolean;
      is_highlight?: boolean;
      es_attractions?: { media?: unknown } | null;
    };
    addCandidate(
      candidates,
      r.category_id,
      r.es_attractions?.media,
      r.is_premium,
      r.is_highlight
    );
  }

  for (const row of eventRows || []) {
    const r = row as {
      category_id: number;
      is_premium?: boolean;
      is_highlight?: boolean;
      es_events?: { media?: unknown } | null;
    };
    addCandidate(
      candidates,
      r.category_id,
      r.es_events?.media,
      r.is_premium,
      r.is_highlight
    );
  }

  const map = new Map<number, string>();
  const bestScore = new Map<number, number>();

  for (const candidate of candidates) {
    const prev = bestScore.get(candidate.categoryId) ?? 0;
    if (!map.has(candidate.categoryId) || candidate.score > prev) {
      map.set(candidate.categoryId, candidate.url);
      bestScore.set(candidate.categoryId, candidate.score);
    }
  }

  return map;
}

export function resolveCategoryImage(
  categoryId: number,
  storedImage: string | null | undefined,
  coverMap: Map<number, string>
): string | null {
  const fromDb = normalizeStorageUrl(storedImage);
  if (fromDb) return fromDb;
  return coverMap.get(categoryId) ?? null;
}
