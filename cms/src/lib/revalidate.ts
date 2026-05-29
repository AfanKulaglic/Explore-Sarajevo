/**
 * Revalidation helper for CMS.
 * Sends on-demand revalidation requests to frontend apps after content changes.
 * 
 * This ensures that when content is created/updated/deleted in the CMS,
 * the frontend apps immediately refresh their cached data instead of
 * waiting for the ISR timer to expire.
 */

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;
const EXPLORE_SARAJEVO_URL = process.env.EXPLORE_SARAJEVO_URL || 'http://localhost:3002';
const PAMETNO_SARAYA_URL = process.env.PAMETNO_SARAYA_URL || 'http://localhost:3010';

// Map entity types to their cache tags and target apps
const ENTITY_TAG_MAP: Record<string, { app: 'explore' | 'pametno'; tags: string[] }> = {
  // Explore-sarajevo entities
  business:    { app: 'explore', tags: ['businesses', 'homepage'] },
  attraction:  { app: 'explore', tags: ['attractions', 'homepage'] },
  category:    { app: 'explore', tags: ['categories'] },
  event:       { app: 'explore', tags: ['events'] },
  subevent:    { app: 'explore', tags: ['subevents', 'events'] },
  brand:       { app: 'explore', tags: ['brands'] },
  type:        { app: 'explore', tags: ['types', 'categories'] },
  section:     { app: 'explore', tags: ['highlights'] },
  highlight:   { app: 'explore', tags: ['highlights'] },
  
  // Pametno-saraya entities
  product:     { app: 'pametno', tags: ['products', 'featured'] },
  'pametno-brand':    { app: 'pametno', tags: ['brands'] },
  'pametno-category': { app: 'pametno', tags: ['categories'] },
  collection:  { app: 'pametno', tags: ['collections'] },
  tag:         { app: 'pametno', tags: ['products'] },
};

async function sendRevalidation(appUrl: string, tags: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${appUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: REVALIDATION_SECRET, tags }),
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    if (res.ok) {
      await res.json().catch(() => null);
      console.log(`[Revalidate] Success for ${appUrl}: tags=${tags.join(',')}`);
      return true;
    } else {
      console.error(`[Revalidate] Failed for ${appUrl}: HTTP ${res.status}`);
      return false;
    }
  } catch (error) {
    // Don't let revalidation failures break CMS operations
    console.error(`[Revalidate] Error reaching ${appUrl}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Trigger on-demand revalidation for a specific entity type.
 * Call this after any create/update/delete operation in the CMS.
 * 
 * @param entityType - The type of entity that was changed (e.g., 'business', 'product')
 * @returns Promise<void> - Never throws; failures are logged but don't break CMS flow
 * 
 * @example
 * await revalidateEntity('business');  // After updating a business
 * await revalidateEntity('product');   // After updating a product
 */
export async function revalidateEntity(entityType: string): Promise<void> {
  if (!REVALIDATION_SECRET) {
    console.warn('[Revalidate] REVALIDATION_SECRET not set, skipping revalidation');
    return;
  }

  const mapping = ENTITY_TAG_MAP[entityType];
  if (!mapping) {
    console.warn(`[Revalidate] Unknown entity type: ${entityType}`);
    return;
  }

  const appUrl = mapping.app === 'explore' ? EXPLORE_SARAJEVO_URL : PAMETNO_SARAYA_URL;
  
  // Await revalidation to ensure the request completes
  await sendRevalidation(appUrl, mapping.tags);
}

/**
 * Trigger revalidation for multiple entity types at once.
 * Useful for bulk operations or reordering.
 */
export async function revalidateEntities(entityTypes: string[]): Promise<void> {
  const promises = entityTypes.map(type => revalidateEntity(type));
  await Promise.allSettled(promises);
}

/**
 * Force revalidation of all cached data for a specific app.
 */
export async function revalidateAll(app: 'explore' | 'pametno' | 'both'): Promise<void> {
  if (!REVALIDATION_SECRET) return;

  const promises: Promise<boolean>[] = [];
  
  if (app === 'explore' || app === 'both') {
    promises.push(sendRevalidation(EXPLORE_SARAJEVO_URL, ['all']));
  }
  if (app === 'pametno' || app === 'both') {
    promises.push(sendRevalidation(PAMETNO_SARAYA_URL, ['all']));
  }

  await Promise.allSettled(promises);
}
