import type { ContentTrackingSnapshot } from './types'

export function appendUtmToExternalUrl(
  url: string | null | undefined,
  snap: ContentTrackingSnapshot
): string {
  if (!url) return '#'
  if (url.startsWith('#')) return url
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('utm_source', snap.utm_source)
    u.searchParams.set('utm_medium', snap.utm_medium)
    u.searchParams.set('utm_campaign', snap.utm_campaign)
    u.searchParams.set('utm_content', snap.utm_content)
    u.searchParams.set('utm_term', snap.utm_term)
    return u.toString()
  } catch {
    return url
  }
}
