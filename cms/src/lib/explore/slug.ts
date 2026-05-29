/** Bosnian/Latin diacritics → ASCII before slugifying. */
const CHAR_MAP: Record<string, string> = {
  đ: 'd',
  Đ: 'd',
  ć: 'c',
  Ć: 'c',
  č: 'c',
  Č: 'c',
  š: 's',
  Š: 's',
  ž: 'z',
  Ž: 'z',
  dž: 'dz',
  Dž: 'dz',
  DŽ: 'dz',
};

function transliterate(text: string): string {
  let result = text;
  for (const [from, to] of Object.entries(CHAR_MAP)) {
    result = result.split(from).join(to);
  }
  return result
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** URL-safe slug from a display name (Explore Sarajevo entities). */
export function generateSlug(name: string): string {
  return transliterate(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Use provided slug when non-empty; otherwise derive from name. */
export function resolveSlug(name: string, slug?: string | null): string {
  const trimmed = slug?.trim();
  if (trimmed) return trimmed;
  return generateSlug(name);
}
