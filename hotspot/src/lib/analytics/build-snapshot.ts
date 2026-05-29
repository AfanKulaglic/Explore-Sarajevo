import type {
  AnalyticsOverrides,
  ContentTrackingSnapshot,
  ListingRowVariant,
  PlacementType,
} from './types'

type ClientLite = { id: number; name: string }
type CampaignLite = { id: number; name: string; slug: string }

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string')
  return []
}

function truncate(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64) || 'item'
}

function buildUtmContent(params: {
  placement: PlacementType
  creativeFormat: string | null
  placementPosition: number | null
  setIndex?: number | null
  blockIndex?: number | null
  listingType?: ListingRowVariant | 'news_carousel'
}): string {
  const fmt = params.creativeFormat || 'default'
  switch (params.placement) {
    case 'block':
      return truncate(
        `fmt_${fmt}|set_${params.setIndex ?? '?'}|slot_${params.blockIndex ?? '?'}`,
        120
      )
    case 'listing_row':
      return truncate(
        `${params.listingType ?? 'listing'}|pos_${params.placementPosition ?? '?'}`,
        120
      )
    case 'article_card':
      return truncate(`news|pos_${params.placementPosition ?? '?'}|fmt_${fmt}`, 120)
    case 'hero_video':
      return truncate(`hero_video|${fmt}|ord_${params.placementPosition ?? '?'}`, 120)
    case 'hero_banner':
      return truncate(`hero_banner|${fmt}|ord_${params.placementPosition ?? '?'}`, 120)
    case 'quick_access':
      return truncate(`chip|ord_${params.placementPosition ?? '?'}`, 120)
    case 'play_and_win':
      return truncate(`play_win|${fmt}`, 120)
    case 'city_services':
      return truncate(`city_services|${fmt}`, 120)
    default:
      return truncate(`${params.placement}|${fmt}`, 120)
  }
}

function buildUtmTerm(params: {
  placement: PlacementType
  title: string
  clientName: string | null
  extra?: string
}): string {
  const parts = [
    params.placement,
    slugify(params.title || 'untitled'),
    params.clientName ? `client_${slugify(params.clientName)}` : null,
    params.extra,
  ].filter(Boolean) as string[]
  return truncate(parts.join('|'), 200)
}

export function buildContentSnapshot(params: {
  placementType: PlacementType
  row: Record<string, unknown>
  client?: ClientLite | null
  campaign?: CampaignLite | null
  context?: {
    setIndex?: number | null
    blockIndex?: number | null
    blockSetId?: string | null
    blockSetName?: string | null
    listingType?: ListingRowVariant | 'news_carousel'
  }
  destinationUrl?: string | null
  title?: string | null
  description?: string | null
}): ContentTrackingSnapshot {
  const row = params.row
  const id = row.id != null ? String(row.id) : 'unknown'
  const overrides = (row.analytics_overrides as AnalyticsOverrides | null) || {}

  const displayTitle =
    params.title != null && String(params.title).trim().length > 0 ? String(params.title).trim() : ''
  const displayDesc =
    params.description != null && String(params.description).trim().length > 0
      ? String(params.description).trim()
      : ''

  const content_title: string | null = displayTitle || null
  const content_description: string | null = displayDesc || null
  const destination_url = params.destinationUrl ?? null

  const placementPosition =
    (typeof row.placement_position === 'number' ? row.placement_position : null) ??
    (typeof row.display_order === 'number' ? row.display_order : null)

  const creativeFormat =
    typeof row.creative_format === 'string' && row.creative_format.length > 0
      ? row.creative_format
      : null

  const campaign = params.campaign ?? null
  const client = params.client ?? null

  const rowAnalyticsLabel =
    typeof row.analytics_client_label === 'string' && row.analytics_client_label.trim().length > 0
      ? row.analytics_client_label.trim()
      : ''

  const mergedClientName =
    (client?.name?.trim() ? client.name.trim() : '') || rowAnalyticsLabel || displayTitle || null

  const mergedCampaignName = (campaign?.name?.trim() ? campaign.name.trim() : '') || displayTitle || null

  const utm_source = overrides.utm_source ?? (process.env.NEXT_PUBLIC_HS_UTM_SOURCE?.trim() || 'portal')
  const utm_medium = overrides.utm_medium ?? params.placementType
  const utm_campaign = overrides.utm_campaign ?? (campaign?.slug ? campaign.slug : 'organic')

  const utm_content =
    overrides.utm_content ??
    buildUtmContent({
      placement: params.placementType,
      creativeFormat,
      placementPosition,
      setIndex: params.context?.setIndex,
      blockIndex: params.context?.blockIndex,
      listingType: params.context?.listingType,
    })

  const titleForTerm =
    params.title ||
    (typeof row.title_en === 'string' ? row.title_en : null) ||
    (typeof row.title_ba === 'string' ? row.title_ba : null) ||
    (typeof row.title === 'string' ? row.title : '') ||
    ''

  const utm_term =
    overrides.utm_term ??
    buildUtmTerm({
      placement: params.placementType,
      title: titleForTerm,
      clientName: mergedClientName,
      extra:
        params.placementType === 'block' && params.context?.blockSetName
          ? `set_${slugify(params.context.blockSetName)}`
          : undefined,
    })

  return {
    content_id: id,
    title: displayTitle || undefined,
    description: displayDesc || undefined,
    content_title,
    content_description,
    client_id: client?.id ?? (typeof row.analytics_client_id === 'number' ? row.analytics_client_id : null),
    client_name: mergedClientName,
    campaign_id: campaign?.id ?? (typeof row.analytics_campaign_id === 'number' ? row.analytics_campaign_id : null),
    campaign_name: mergedCampaignName,
    campaign_slug: campaign?.slug ?? null,
    placement_type: params.placementType,
    placement_position: placementPosition,
    set_index: params.context?.setIndex ?? null,
    block_index: params.context?.blockIndex ?? null,
    block_set_id: params.context?.blockSetId ?? null,
    block_set_name: params.context?.blockSetName ?? null,
    listing_type: params.context?.listingType,
    creative_format: creativeFormat,
    destination_url,
    tags: normalizeTags(row.analytics_tags),
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
  }
}

export function clientFromAnalyticsRow(row: Record<string, unknown>): ClientLite | null {
  const id = row.analytics_client_id
  if (typeof id !== 'number') return null
  const label = row.analytics_client_label
  if (typeof label === 'string' && label.trim().length > 0) {
    return { id, name: label.trim() }
  }
  return { id, name: `client_${id}` }
}

export function resolveCampaign(
  id: unknown,
  map: Map<number, CampaignLite>
): CampaignLite | null {
  if (typeof id !== 'number') return null
  return map.get(id) ?? null
}
