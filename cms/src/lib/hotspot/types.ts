export type PlacementType =
  | 'hero_video'
  | 'hero_banner'
  | 'block'
  | 'article_card'
  | 'quick_access'
  | 'play_and_win'
  | 'listing_row'
  | 'city_services'

export type ListingRowVariant = 'pametno' | 'explore_sarajevo'

export type AnalyticsOverrides = Partial<{
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}>

export interface ContentTrackingSnapshot {
  content_id: string
  title?: string
  description?: string
  client_id: number | null
  client_name: string | null
  campaign_id: number | null
  campaign_name: string | null
  campaign_slug: string | null
  placement_type: PlacementType
  placement_position: number | null
  set_index?: number | null
  block_index?: number | null
  block_set_id?: string | null
  block_set_name?: string | null
  listing_type?: ListingRowVariant | 'news_carousel'
  creative_format: string | null
  destination_url: string | null
  tags: string[]
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}
