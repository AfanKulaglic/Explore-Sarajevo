import type { ContentTrackingSnapshot } from './types'
import type { AnalyticsEventName } from './events'
import { getPosthog } from './posthog-client'

function compactSnapshot(snap: ContentTrackingSnapshot): Record<string, unknown> {
  const out: Record<string, unknown> = {
    content_id: snap.content_id,
    placement_type: snap.placement_type,
    utm_source: snap.utm_source,
    utm_medium: snap.utm_medium,
    utm_campaign: snap.utm_campaign,
    utm_content: snap.utm_content,
    utm_term: snap.utm_term,
    content_title: snap.content_title,
    content_description: snap.content_description,
    destination_url: snap.destination_url,
  }
  if (snap.title) out.title = snap.title
  if (snap.description) out.description = snap.description
  if (snap.client_id != null) out.client_id = snap.client_id
  if (snap.client_name) out.client_name = snap.client_name
  if (snap.campaign_id != null) out.campaign_id = snap.campaign_id
  if (snap.campaign_name) out.campaign_name = snap.campaign_name
  if (snap.campaign_slug) out.campaign_slug = snap.campaign_slug
  if (snap.placement_position != null) out.placement_position = snap.placement_position
  if (snap.set_index != null) out.set_index = snap.set_index
  if (snap.block_index != null) out.block_index = snap.block_index
  if (snap.block_set_id) out.block_set_id = snap.block_set_id
  if (snap.block_set_name) out.block_set_name = snap.block_set_name
  if (snap.creative_format) out.creative_format = snap.creative_format
  if (snap.listing_type) out.listing_type = snap.listing_type
  if (snap.tags?.length) out.tags = snap.tags
  return out
}

export function captureEvent(
  event: AnalyticsEventName,
  props?: Record<string, unknown>,
  tracking?: ContentTrackingSnapshot
): void {
  const ph = getPosthog()
  if (!ph) return
  const base = tracking ? compactSnapshot(tracking) : {}
  ph.capture(event, { ...base, ...props })
}
