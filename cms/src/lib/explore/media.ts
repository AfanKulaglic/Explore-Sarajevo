/** Parse es_businesses.media / es_attractions.media (json array or string). */
export function parseMediaField(media: unknown): string[] {
  if (!media) return [];
  if (Array.isArray(media)) {
    return media.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  }
  if (typeof media === 'string') {
    const trimmed = media.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
        }
      } catch {
        // fall through
      }
    }
    return trimmed ? [trimmed] : [];
  }
  return [];
}

export function firstMediaUrl(media: unknown): string | null {
  const urls = parseMediaField(media);
  return urls[0] ?? null;
}

const BUCKET_REWRITES: Array<[RegExp, string]> = [
  [
    /https?:\/\/[^/]+\/storage\/v1\/object\/public\/es_upload\//g,
    'https://saraya.deployer3000.halvooo.com/storage/v1/object/public/sarayaconnect-es/',
  ],
  [
    /https?:\/\/sarayaconnect\.deployer3000\.halvooo\.com\/storage\/v1\/object\/public\/es_upload\//g,
    'https://saraya.deployer3000.halvooo.com/storage/v1/object/public/sarayaconnect-es/',
  ],
];

/** Rewrite legacy Supabase storage URLs to the current bucket/domain. */
export function normalizeStorageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  let result = url.trim();
  if (!result) return null;
  for (const [pattern, replacement] of BUCKET_REWRITES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
