/**
 * Supabase-based Hotspot Model
 * 
 * Manages hotspot content stored in Supabase database tables.
 * This replaces the old JSON file-based approach.
 * 
 * Tables used:
 * - hs_hero_videos
 * - hs_hero_banners
 * - hs_news_cards
 * - hs_navigation_chips
 * - hs_block_sets
 * - hs_block_items
 * - hs_quick_fun (Play and Win)
 * - hs_site_config
 */

import { sc } from '../../../db/supabase';

// =============================================================================
// TYPES
// =============================================================================

/** Shared analytics / UTM metadata (stored on hotspot content rows). */
export interface HotspotAnalyticsRow {
  analytics_client_id?: number | null;
  analytics_client_label?: string | null;
  analytics_campaign_id?: number | null;
  creative_format?: string | null;
  placement_position?: number | null;
  analytics_tags?: unknown;
  analytics_overrides?: unknown;
}

export interface HeroVideo extends HotspotAnalyticsRow {
  id: number;
  video_url: string;
  video_url_alt: string | null;
  poster_url: string | null;
  title_ba: string | null;
  title_en: string | null;
  subtitle_ba: string | null;
  subtitle_en: string | null;
  button_text_ba: string | null;
  button_text_en: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
}

export interface HeroBanner extends HotspotAnalyticsRow {
  id: number;
  title: string;
  title_ba: string | null;
  title_en: string | null;
  subtitle: string | null;
  subtitle_ba: string | null;
  subtitle_en: string | null;
  image_url: string | null;
  cta_text: string | null;
  button_text_ba: string | null;
  button_text_en: string | null;
  cta_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface NewsCard extends HotspotAnalyticsRow {
  id: number;
  title: string;
  text_ba: string | null;
  text_en: string | null;
  icon: string | null;
  image_url: string | null;
  cta_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

export interface NavigationChip extends HotspotAnalyticsRow {
  id: number;
  label_ba: string | null;
  label_en: string | null;
  custom_label: string | null;
  custom_icon: string | null;
  icon: string | null;
  custom_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

export interface BlockSet {
  id: number;
  name: string;
  is_active: boolean;
  display_order: number;
  items?: BlockItem[];
}

export interface BlockItem extends HotspotAnalyticsRow {
  id: number;
  block_set_id: number;
  title: string;
  title_ba: string | null;
  title_en: string | null;
  description: string | null;
  description_ba: string | null;
  description_en: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_text_en: string | null;
  cta_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface PlayAndWin extends HotspotAnalyticsRow {
  id: number;
  title: string | null;
  title_ba: string | null;
  title_en: string | null;
  subtitle: string | null;
  subtitle_ba: string | null;
  subtitle_en: string | null;
  image_url: string | null;
  cta_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

export interface SiteConfig {
  id: number;
  city_name: string | null;
  city_lat: number | null;
  city_lon: number | null;
  base_currency: string | null;
  target_currencies: string[] | null;
  primary_color: string | null;
  footer_icons: FooterIcon[] | null;
}

export interface FooterIcon {
  id: string;
  name: string;
  url: string;
  icon: string;
}

export interface EditorsPick extends HotspotAnalyticsRow {
  id: number;
  title_ba: string;
  title_en: string;
  description_ba: string | null;
  description_en: string | null;
  image_url: string | null;
  cta_url: string | null;
  badge: string | null;
  is_active: boolean;
  display_order: number;
}

export interface DiscoveryPlace extends HotspotAnalyticsRow {
  id: number;
  name_ba: string;
  name_en: string;
  category_ba: string | null;
  category_en: string | null;
  description_ba: string | null;
  description_en: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

// =============================================================================
// HERO VIDEOS
// =============================================================================

export async function getHeroVideos(): Promise<HeroVideo[]> {
  const { data, error } = await sc
    .from('hs_hero_videos')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createHeroVideo(video: Partial<HeroVideo>): Promise<HeroVideo> {
  // Current DB columns: id, video_url, video_url_alt, poster_url, title_ba, title_en, 
  // subtitle_ba, subtitle_en, button_text_ba, button_text_en, button_link, is_active, display_order
  const { data, error } = await sc
    .from('hs_hero_videos')
    .insert({
      video_url: video.video_url || '',
      video_url_alt: video.video_url_alt,
      poster_url: video.poster_url,
      title_ba: video.title_ba,
      title_en: video.title_en,
      subtitle_ba: video.subtitle_ba,
      subtitle_en: video.subtitle_en,
      button_text_ba: video.button_text_ba,
      button_text_en: video.button_text_en,
      button_link: video.button_link,
      is_active: video.is_active ?? true,
      display_order: video.display_order ?? 0,
      analytics_client_id: video.analytics_client_id ?? null,
      analytics_client_label: video.analytics_client_label ?? null,
      analytics_campaign_id: video.analytics_campaign_id ?? null,
      creative_format: video.creative_format ?? null,
      placement_position: video.placement_position ?? null,
      analytics_tags: video.analytics_tags ?? [],
      analytics_overrides: video.analytics_overrides ?? null,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateHeroVideo(id: number, updates: Partial<HeroVideo>): Promise<HeroVideo> {
  // Update all supported columns including translations
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'video_url', 'video_url_alt', 'poster_url', 
    'title_ba', 'title_en', 'subtitle_ba', 'subtitle_en',
    'button_text_ba', 'button_text_en', 'button_link',
    'is_active', 'display_order',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof HeroVideo];
    }
  }
  
  const { data, error } = await sc
    .from('hs_hero_videos')
    .update({
      ...validUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteHeroVideo(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_hero_videos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// HERO BANNERS
// =============================================================================

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const { data, error } = await sc
    .from('hs_hero_banners')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createHeroBanner(banner: Partial<HeroBanner>): Promise<HeroBanner> {
  // DB columns: id, title, subtitle, badge, cta_text, cta_url, image_url, gradient_from, gradient_to, 
  // is_active, display_order, title_ba, title_en, subtitle_ba, subtitle_en, button_text_ba, button_text_en
  const { data, error } = await sc
    .from('hs_hero_banners')
    .insert({
      title: banner.title || banner.title_ba || 'Novi banner',
      subtitle: banner.subtitle || banner.subtitle_ba,
      image_url: banner.image_url,
      cta_text: banner.cta_text || banner.button_text_ba,
      cta_url: banner.cta_url,
      title_ba: banner.title_ba,
      title_en: banner.title_en,
      subtitle_ba: banner.subtitle_ba,
      subtitle_en: banner.subtitle_en,
      button_text_ba: banner.button_text_ba,
      button_text_en: banner.button_text_en,
      is_active: banner.is_active ?? true,
      display_order: banner.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateHeroBanner(id: number, updates: Partial<HeroBanner>): Promise<HeroBanner> {
  // Update all supported columns including translations
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'title', 'subtitle', 'badge', 'cta_text', 'cta_url', 'image_url', 
    'gradient_from', 'gradient_to', 'is_active', 'display_order',
    'title_ba', 'title_en', 'subtitle_ba', 'subtitle_en', 'button_text_ba', 'button_text_en',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof HeroBanner];
    }
  }
  
  const { data, error } = await sc
    .from('hs_hero_banners')
    .update({
      ...validUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteHeroBanner(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_hero_banners')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// NEWS CARDS
// =============================================================================

export async function getNewsCards(): Promise<NewsCard[]> {
  const { data, error } = await sc
    .from('hs_news_cards')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createNewsCard(card: Partial<NewsCard>): Promise<NewsCard> {
  // DB columns: id, title, description, image_url, cta_text, cta_url, badge, badge_color, is_active, 
  // display_order, text_ba, text_en, icon
  const { data, error } = await sc
    .from('hs_news_cards')
    .insert({
      title: card.title || card.text_ba || 'Nova kartica',
      description: (card as Record<string, unknown>).description as string || card.text_ba || null,
      image_url: card.image_url,
      cta_text: (card as Record<string, unknown>).cta_text as string || null,
      cta_url: card.cta_url || card.link,
      text_ba: card.text_ba,
      text_en: card.text_en,
      icon: card.icon,
      is_active: card.is_active ?? true,
      display_order: card.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateNewsCard(id: number, updates: Partial<NewsCard>): Promise<NewsCard> {
  // Update all supported columns including translations
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'title', 'description', 'image_url', 'cta_text', 'cta_url', 
    'badge', 'badge_color', 'is_active', 'display_order',
    'text_ba', 'text_en', 'icon', 'link',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof NewsCard];
    }
  }
  
  // Also update title if text_ba changes
  if ('text_ba' in updates && updates.text_ba) {
    validUpdates['title'] = updates.text_ba;
  }
  
  const { data, error } = await sc
    .from('hs_news_cards')
    .update({
      ...validUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNewsCard(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_news_cards')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// NAVIGATION CHIPS
// =============================================================================

export async function getNavigationChips(): Promise<NavigationChip[]> {
  const { data, error } = await sc
    .from('hs_navigation_chips')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createNavigationChip(chip: Partial<NavigationChip>): Promise<NavigationChip> {
  // DB columns: id, category_id, custom_label, custom_icon, custom_url, is_active, display_order, label_ba, label_en, icon, link
  const { data, error } = await sc
    .from('hs_navigation_chips')
    .insert({
      custom_label: chip.custom_label || chip.label_ba || chip.label_en || 'Novi chip',
      custom_icon: chip.custom_icon || chip.icon,
      custom_url: chip.custom_url || chip.link,
      label_ba: chip.label_ba || chip.custom_label,
      label_en: chip.label_en,
      icon: chip.icon || chip.custom_icon,
      link: chip.link || chip.custom_url,
      is_active: chip.is_active ?? true,
      display_order: chip.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateNavigationChip(id: number, updates: Partial<NavigationChip>): Promise<NavigationChip> {
  // Update all supported columns including translations
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'category_id', 'custom_label', 'custom_icon', 'custom_url', 
    'is_active', 'display_order', 'label_ba', 'label_en', 'icon', 'link',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof NavigationChip];
    }
  }
  
  // Sync custom fields with new fields
  if ('label_ba' in updates) validUpdates['custom_label'] = updates.label_ba;
  if ('icon' in updates) validUpdates['custom_icon'] = updates.icon;
  if ('link' in updates) validUpdates['custom_url'] = updates.link;
  
  const { data, error } = await sc
    .from('hs_navigation_chips')
    .update(validUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteNavigationChip(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_navigation_chips')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// BLOCK SETS & ITEMS
// =============================================================================

export async function getBlockSets(): Promise<BlockSet[]> {
  const { data, error } = await sc
    .from('hs_block_sets')
    .select(`
      *,
      items:hs_block_items(*)
    `)
    .order('display_order');
  
  if (error) throw error;
  return (data || []).map((blockSet) => ({
    ...blockSet,
    items: [...(blockSet.items || [])].sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.id - b.id;
    }),
  }));
}

export async function createBlockSet(blockSet: Partial<BlockSet>): Promise<BlockSet> {
  const { data, error } = await sc
    .from('hs_block_sets')
    .insert({
      name: blockSet.name || 'New Block Set',
      is_active: blockSet.is_active ?? true,
      display_order: blockSet.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBlockSet(id: number, updates: Partial<BlockSet>): Promise<BlockSet> {
  const { data, error } = await sc
    .from('hs_block_sets')
    .update({
      name: updates.name,
      is_active: updates.is_active,
      display_order: updates.display_order,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBlockSet(id: number): Promise<void> {
  const { error: itemsError } = await sc.from('hs_block_items').delete().eq('block_set_id', id);
  if (itemsError) throw itemsError;

  const { error } = await sc.from('hs_block_sets').delete().eq('id', id);
  if (error) throw error;
}

export async function createBlockItem(item: Partial<BlockItem>): Promise<BlockItem> {
  const { data, error } = await sc
    .from('hs_block_items')
    .insert({
      block_set_id: item.block_set_id,
      title: item.title || '',
      description: item.description,
      image_url: item.image_url,
      cta_text: item.cta_text,
      cta_text_en: item.cta_text_en ?? null,
      cta_url: item.cta_url,
      is_active: item.is_active ?? true,
      display_order: item.display_order ?? 0,
      analytics_client_id: item.analytics_client_id ?? null,
      analytics_client_label: item.analytics_client_label ?? null,
      analytics_campaign_id: item.analytics_campaign_id ?? null,
      creative_format: item.creative_format ?? null,
      placement_position: item.placement_position ?? null,
      analytics_tags: item.analytics_tags ?? [],
      analytics_overrides: item.analytics_overrides ?? null,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBlockItem(id: number, updates: Partial<BlockItem>): Promise<BlockItem> {
  const { data, error } = await sc
    .from('hs_block_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBlockItem(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_block_items')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function reorderBlockItems(blockSetId: number, orderedIds: number[]): Promise<BlockItem[]> {
  const updatedAt = new Date().toISOString();

  await Promise.all(
    orderedIds.map(async (itemId, index) => {
      const { error, count } = await sc
        .from('hs_block_items')
        .update({
          display_order: index,
          updated_at: updatedAt,
        }, { count: 'exact' })
        .eq('id', itemId)
        .eq('block_set_id', blockSetId);

      if (error) throw error;
      if (count !== 1) {
        throw new Error(`Block item ${itemId} was not updated`);
      }
    })
  );

  const { data, error } = await sc
    .from('hs_block_items')
    .select('*')
    .eq('block_set_id', blockSetId)
    .order('display_order');

  if (error) throw error;

  const updatedItems = (data || []) as BlockItem[];
  const expectedIds = new Set(orderedIds);
  const matchingItems = updatedItems.filter((item) => expectedIds.has(item.id));

  if (matchingItems.length !== orderedIds.length) {
    throw new Error(`Expected ${orderedIds.length} reordered items, got ${matchingItems.length}`);
  }

  return matchingItems.sort((a, b) => a.display_order - b.display_order);
}

// =============================================================================
// PLAY AND WIN
// =============================================================================

export async function getPlayAndWin(): Promise<PlayAndWin[]> {
  const { data, error } = await sc
    .from('playnwin')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createPlayAndWin(item: Partial<PlayAndWin>): Promise<PlayAndWin> {
  // DB columns: id, title, subtitle, description, icon, image_url, cta_text, cta_url, fun_type, badge, 
  // badge_color, config, is_active, display_order, title_ba, title_en, subtitle_ba, subtitle_en, link
  const { data, error } = await sc
    .from('playnwin')
    .insert({
      title: item.title || item.title_ba || item.title_en || 'Play & Win',
      subtitle: item.subtitle || item.subtitle_ba || item.subtitle_en,
      image_url: item.image_url,
      cta_url: item.cta_url || item.link,
      title_ba: item.title_ba,
      title_en: item.title_en,
      subtitle_ba: item.subtitle_ba,
      subtitle_en: item.subtitle_en,
      link: item.link || item.cta_url,
      is_active: item.is_active ?? true,
      display_order: item.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePlayAndWin(id: number, updates: Partial<PlayAndWin>): Promise<PlayAndWin> {
  // Update all supported columns including translations
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'title', 'subtitle', 'description', 'icon', 'image_url', 'cta_text', 'cta_url', 
    'fun_type', 'badge', 'badge_color', 'config', 'is_active', 'display_order',
    'title_ba', 'title_en', 'subtitle_ba', 'subtitle_en', 'link',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof PlayAndWin];
    }
  }
  
  // Sync cta_url and link
  if ('link' in updates) validUpdates['cta_url'] = updates.link;
  
  const { data, error } = await sc
    .from('playnwin')
    .update({
      ...validUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePlayAndWin(id: number): Promise<void> {
  const { error } = await sc
    .from('playnwin')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// SITE CONFIG
// =============================================================================

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const { data, error } = await sc
    .from('hs_site_config')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig> {
  // Try to update existing config
  const { data, error } = await sc
    .from('hs_site_config')
    .upsert({
      id: 1,
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// =============================================================================
// EDITORS PICKS (Pametno Odabrano / Smart Choices)
// =============================================================================

export async function getEditorsPicks(): Promise<EditorsPick[]> {
  const { data, error } = await sc
    .from('hs_editors_picks')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createEditorsPick(pick: Partial<EditorsPick>): Promise<EditorsPick> {
  const { data, error } = await sc
    .from('hs_editors_picks')
    .insert({
      title_ba: pick.title_ba || 'Novi izbor',
      title_en: pick.title_en || 'New pick',
      description_ba: pick.description_ba,
      description_en: pick.description_en,
      image_url: pick.image_url,
      cta_url: pick.cta_url,
      badge: pick.badge,
      is_active: pick.is_active ?? true,
      display_order: pick.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateEditorsPick(id: number, updates: Partial<EditorsPick>): Promise<EditorsPick> {
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'title_ba', 'title_en', 'description_ba', 'description_en', 'image_url', 'cta_url', 'badge', 'is_active', 'display_order',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof EditorsPick];
    }
  }
  
  const { data, error } = await sc
    .from('hs_editors_picks')
    .update({
      ...validUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteEditorsPick(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_editors_picks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// DISCOVERY PLACES (Explore Sarajevo)
// =============================================================================

export async function getDiscoveryPlaces(): Promise<DiscoveryPlace[]> {
  const { data, error } = await sc
    .from('hs_discovery_places')
    .select('*')
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function createDiscoveryPlace(place: Partial<DiscoveryPlace>): Promise<DiscoveryPlace> {
  const { data, error } = await sc
    .from('hs_discovery_places')
    .insert({
      name_ba: place.name_ba || 'Novo mjesto',
      name_en: place.name_en || 'New place',
      category_ba: place.category_ba,
      category_en: place.category_en,
      description_ba: place.description_ba,
      description_en: place.description_en,
      image_url: place.image_url,
      link: place.link,
      is_active: place.is_active ?? true,
      display_order: place.display_order ?? 0,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateDiscoveryPlace(id: number, updates: Partial<DiscoveryPlace>): Promise<DiscoveryPlace> {
  const validUpdates: Record<string, unknown> = {};
  const validColumns = [
    'name_ba', 'name_en', 'category_ba', 'category_en', 'description_ba', 'description_en', 'image_url', 'link', 'is_active', 'display_order',
    'analytics_client_id', 'analytics_client_label', 'analytics_campaign_id',
    'creative_format', 'placement_position', 'analytics_tags', 'analytics_overrides',
  ];
  
  for (const col of validColumns) {
    if (col in updates) {
      validUpdates[col] = updates[col as keyof DiscoveryPlace];
    }
  }
  
  const { data, error } = await sc
    .from('hs_discovery_places')
    .update({
      ...validUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteDiscoveryPlace(id: number): Promise<void> {
  const { error } = await sc
    .from('hs_discovery_places')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================================================
// EXPORT MODEL
// =============================================================================

export const supabaseHotspotModel = {
  // Hero Videos
  getHeroVideos,
  createHeroVideo,
  updateHeroVideo,
  deleteHeroVideo,
  
  // Hero Banners
  getHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  
  // News Cards
  getNewsCards,
  createNewsCard,
  updateNewsCard,
  deleteNewsCard,
  
  // Navigation Chips
  getNavigationChips,
  createNavigationChip,
  updateNavigationChip,
  deleteNavigationChip,
  
  // Block Sets & Items
  getBlockSets,
  createBlockSet,
  updateBlockSet,
  deleteBlockSet,
  createBlockItem,
  updateBlockItem,
  deleteBlockItem,
  reorderBlockItems,
  
  // Play and Win
  getPlayAndWin,
  createPlayAndWin,
  updatePlayAndWin,
  deletePlayAndWin,
  
  // Editors Picks
  getEditorsPicks,
  createEditorsPick,
  updateEditorsPick,
  deleteEditorsPick,
  
  // Discovery Places
  getDiscoveryPlaces,
  createDiscoveryPlace,
  updateDiscoveryPlace,
  deleteDiscoveryPlace,
  
  // Site Config
  getSiteConfig,
  updateSiteConfig,
};
