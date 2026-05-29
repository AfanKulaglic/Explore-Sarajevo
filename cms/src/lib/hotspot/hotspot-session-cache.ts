/**
 * In-memory snapshot of Hotspot CMS fetches for the current browser tab.
 * Survives remounts when switching between /dashboard/hotspot/* sections (same layout),
 * so we avoid a full-screen loading flash and duplicate network work.
 * Cleared after successful mutations or explicit refresh so data stays honest.
 */

export type HotspotSessionSnapshot = {
  heroVideos: unknown[];
  heroBanners: unknown[];
  newsCards: unknown[];
  navChips: unknown[];
  blockSets: unknown[];
  playAndWin: unknown[];
  editorsPicks: unknown[];
  discoveryPlaces: unknown[];
  siteConfig: unknown | null;
  crmClients: unknown[];
  campaigns: unknown[];
};

let snapshot: HotspotSessionSnapshot | null = null;

export function readHotspotSessionCache(): HotspotSessionSnapshot | null {
  return snapshot;
}

export function writeHotspotSessionCache(next: HotspotSessionSnapshot): void {
  snapshot = next;
}

export function clearHotspotSessionCache(): void {
  snapshot = null;
}
