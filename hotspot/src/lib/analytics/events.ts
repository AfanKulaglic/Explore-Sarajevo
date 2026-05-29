export const ANALYTICS_EVENTS = {
  landing_session_started: 'landing_session_started',
  page_viewed: 'page_viewed',
  session_engagement: 'session_engagement',

  hero_video_viewed: 'hero_video_viewed',
  hero_video_clicked: 'hero_video_clicked',
  hero_video_started: 'hero_video_started',
  hero_video_progress: 'hero_video_progress',
  hero_video_completed: 'hero_video_completed',

  hero_banner_viewed: 'hero_banner_viewed',
  hero_banner_clicked: 'hero_banner_clicked',

  block_viewed: 'block_viewed',
  block_clicked: 'block_clicked',

  article_card_viewed: 'article_card_viewed',
  article_card_clicked: 'article_card_clicked',

  listing_row_card_viewed: 'listing_row_card_viewed',
  listing_row_clicked: 'listing_row_clicked',

  quick_access_viewed: 'quick_access_viewed',
  quick_access_clicked: 'quick_access_clicked',

  play_and_win_viewed: 'play_and_win_viewed',
  play_and_win_clicked: 'play_and_win_clicked',

  city_services_section_viewed: 'city_services_section_viewed',
  city_services_widget_viewed: 'city_services_widget_viewed',

  section_dwell: 'section_dwell',
  outbound_link_clicked: 'outbound_link_clicked',
} as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
