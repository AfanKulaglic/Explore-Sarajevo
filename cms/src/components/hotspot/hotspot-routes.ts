/** URL segment (under /dashboard/hotspot) → internal section id used by the editor panel. */
export type HotspotSectionId =
  | 'overview'
  | 'hero-videos'
  | 'hero-banners'
  | 'news-cards'
  | 'nav-chips'
  | 'blocks'
  | 'play-and-win'
  | 'editors-picks'
  | 'discovery'
  | 'campaigns'
  | 'settings'

export const HOTSPOT_BASE = '/dashboard/hotspot'

export type HotspotNavItem = {
  segment: string
  id: HotspotSectionId
  labelBs: string
  labelEn: string
}

/** Stable routes; first item is Pregled at the base path (no segment). */
export const HOTSPOT_NAV: HotspotNavItem[] = [
  { segment: '', id: 'overview', labelBs: 'Pregled', labelEn: 'Overview' },
  { segment: 'hero-video', id: 'hero-videos', labelBs: 'Hero video', labelEn: 'Hero video' },
  { segment: 'hero-banneri', id: 'hero-banners', labelBs: 'Hero banneri', labelEn: 'Hero banners' },
  { segment: 'news-carousel', id: 'news-cards', labelBs: 'News carousel', labelEn: 'News carousel' },
  { segment: 'navigacija', id: 'nav-chips', labelBs: 'Navigacija', labelEn: 'Navigation' },
  { segment: 'blokovi', id: 'blocks', labelBs: 'Blokovi', labelEn: 'Blocks' },
  { segment: 'play-win', id: 'play-and-win', labelBs: 'Play & Win', labelEn: 'Play & Win' },
  { segment: 'pametno-odabrano', id: 'editors-picks', labelBs: 'Pametno odabrano', labelEn: 'Editor’s picks' },
  { segment: 'explore-sarajevo', id: 'discovery', labelBs: 'Explore Sarajevo', labelEn: 'Explore Sarajevo' },
  { segment: 'kampanje', id: 'campaigns', labelBs: 'Kampanje', labelEn: 'Campaigns' },
  { segment: 'postavke', id: 'settings', labelBs: 'Postavke', labelEn: 'Settings' },
]

const SEGMENT_TO_ID = new Map<string, HotspotSectionId>()
for (const item of HOTSPOT_NAV) {
  if (item.segment) SEGMENT_TO_ID.set(item.segment, item.id)
}
SEGMENT_TO_ID.set('pregled', 'overview')
/** Legacy URL segment — bookmarks still resolve to the blocks editor. */
SEGMENT_TO_ID.set('deal-blokovi', 'blocks')

export function hotspotPathForSegment(segment: string): string {
  if (!segment) return HOTSPOT_BASE
  return `${HOTSPOT_BASE}/${segment}`
}

export function hotspotSectionFromSlug(slug: string[] | undefined): HotspotSectionId | null {
  if (!slug || slug.length === 0) return 'overview'
  if (slug.length > 1) return null
  const key = slug[0]!
  if (key === 'pregled') return 'overview'
  return SEGMENT_TO_ID.get(key) ?? null
}
