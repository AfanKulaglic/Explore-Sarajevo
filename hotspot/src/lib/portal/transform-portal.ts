import type { SiteConfig } from '@/types/database'
import type { PortalContent } from '@/types/content'
import {
  buildContentSnapshot,
  clientFromAnalyticsRow,
  resolveCampaign,
} from '@/lib/analytics/build-snapshot'
import { appendUtmToExternalUrl } from '@/lib/analytics/urls'

type CampaignLite = { id: number; name: string; slug: string }

function toMapById<T extends { id: number }>(rows: T[]): Map<number, T> {
  const m = new Map<number, T>()
  for (const r of rows || []) m.set(r.id, r)
  return m
}

export function transformPortalPayload(params: {
  siteConfig: SiteConfig | null
  heroVideosRaw: Record<string, unknown>[]
  heroBannersRaw: Record<string, unknown>[]
  newsCardsRaw: Record<string, unknown>[]
  chipsRaw: Record<string, unknown>[]
  blockSetsRaw: Record<string, unknown>[]
  playAndWinRaw: Record<string, unknown>[]
  editorsPicksRaw: Record<string, unknown>[]
  discoveryPlacesRaw: Record<string, unknown>[]
  campaigns: CampaignLite[]
}): PortalContent {
  const campaignMap = toMapById(params.campaigns)

  const siteConfig = params.siteConfig

  const heroVideos = params.heroVideosRaw.map((v) => {
      const client = clientFromAnalyticsRow(v)
      const campaign = resolveCampaign(v.analytics_campaign_id, campaignMap)
      const titleEn = (v.title_en as string) || ''
      const titleBa = (v.title_ba as string) || ''
      const tracking = buildContentSnapshot({
        placementType: 'hero_video',
        row: v,
        client,
        campaign,
        title: titleEn || titleBa,
        description: (v.subtitle_en as string) || (v.subtitle_ba as string) || null,
        destinationUrl: (v.button_link as string) || null,
      })
      const buttonLink = appendUtmToExternalUrl((v.button_link as string) || '#', tracking)
      return {
        id: String(v.id),
        videoFile: v.video_url as string,
        videoFileAlt: (v.video_url_alt as string) || undefined,
        thumbnail: (v.poster_url as string) || '',
        titleBosnian: titleBa,
        titleEnglish: titleEn,
        subtitleBosnian: (v.subtitle_ba as string) || undefined,
        subtitleEnglish: (v.subtitle_en as string) || undefined,
        buttonTextBosnian: (v.button_text_ba as string) || 'POGLEDAJ',
        buttonTextEnglish: (v.button_text_en as string) || 'VIEW',
        buttonLink,
        tracking,
      }
    })

  const heroBanners = params.heroBannersRaw.map((b) => {
      const client = clientFromAnalyticsRow(b)
      const campaign = resolveCampaign(b.analytics_campaign_id, campaignMap)
      const titleEn = (b.title_en as string) || (b.title as string) || ''
      const titleBa = (b.title_ba as string) || (b.title as string) || ''
      const tracking = buildContentSnapshot({
        placementType: 'hero_banner',
        row: b,
        client,
        campaign,
        title: titleEn || titleBa,
        description: (b.subtitle_en as string) || (b.subtitle as string) || null,
        destinationUrl: (b.cta_url as string) || null,
      })
      const rawLink = (b.cta_url as string) || (b as { button_link?: string }).button_link || '#'
      const buttonLink = appendUtmToExternalUrl(rawLink, tracking)
      return {
        id: String(b.id),
        imageFile: (b.image_url as string) || '',
        titleBosnian: titleBa,
        titleEnglish: titleEn,
        subtitleBosnian: (b.subtitle_ba as string) || (b.subtitle as string) || '',
        subtitleEnglish: (b.subtitle_en as string) || (b.subtitle as string) || '',
        buttonTextBosnian: (b.button_text_ba as string) || (b.cta_text as string) || 'POGLEDAJ',
        buttonTextEnglish: (b.button_text_en as string) || (b.cta_text as string) || 'VIEW',
        buttonLink,
        tracking,
      }
    })

  const newsCarousel = params.newsCardsRaw.map((n) => {
      const client = clientFromAnalyticsRow(n)
      const campaign = resolveCampaign(n.analytics_campaign_id, campaignMap)
      const rowWithOrder = { ...n }
      const tracking = buildContentSnapshot({
        placementType: 'article_card',
        row: rowWithOrder,
        client,
        campaign,
        context: { listingType: 'news_carousel' },
        title: (n.text_en as string) || (n.title as string) || '',
        description: (n.description as string) || null,
        destinationUrl: (n.cta_url as string) || (n.link as string) || null,
      })
      const rawLink = (n.cta_url as string) || (n.link as string) || '#'
      const link = appendUtmToExternalUrl(rawLink, tracking)
      return {
        id: String(n.id),
        iconName: (n.icon as string) || undefined,
        imageFile: (n.image_url as string) || undefined,
        textBosnian: (n.text_ba as string) || (n.title as string) || '',
        textEnglish: (n.text_en as string) || (n.title as string) || '',
        chips: [],
        link,
        isDraft: !n.is_active,
        tracking,
      }
    })

  const chips = params.chipsRaw.map((c) => {
      const client = clientFromAnalyticsRow(c)
      const campaign = resolveCampaign(c.analytics_campaign_id, campaignMap)
      const tracking = buildContentSnapshot({
        placementType: 'quick_access',
        row: c,
        client,
        campaign,
        title: (c.label_en as string) || (c.custom_label as string) || '',
        destinationUrl: (c.custom_url as string) || (c.link as string) || null,
      })
      const rawLink = (c.custom_url as string) || (c.link as string) || '#'
      const link = appendUtmToExternalUrl(rawLink, tracking)
      return {
        id: String(c.id),
        nameBosnian: (c.label_ba as string) || (c.custom_label as string) || '',
        nameEnglish: (c.label_en as string) || (c.custom_label as string) || '',
        icon: (c.custom_icon as string) || (c.icon as string) || 'Tag',
        link,
        tracking,
      }
    })

  const blockSetsSorted = [...params.blockSetsRaw]
    .filter((bs) => bs.is_active !== false)
    .sort((a, b) => {
      const da = (a.display_order as number) ?? 0
      const db = (b.display_order as number) ?? 0
      if (da !== db) return da - db
      return Number(a.id) - Number(b.id)
    })

  const blockSets = blockSetsSorted.map((bs, setIdx) => {
    const setIndex = setIdx + 1
    const rawItems = [...((bs.items as Record<string, unknown>[]) || [])]
      .filter((item) => item.is_active !== false)
      .sort((a, b) => {
        const da = (a.display_order as number) ?? 0
        const db = (b.display_order as number) ?? 0
        if (da !== db) return da - db
        return Number(a.id) - Number(b.id)
      })

    const blocks = rawItems.map((item, blockIdx) => {
      const client = clientFromAnalyticsRow(item)
      const campaign = resolveCampaign(item.analytics_campaign_id, campaignMap)
      const tracking = buildContentSnapshot({
        placementType: 'block',
        row: item,
        client,
        campaign,
        context: {
          setIndex,
          blockIndex: blockIdx,
          blockSetId: String(bs.id),
          blockSetName: (bs.name as string) || undefined,
        },
        title: (item.title_en as string) || (item.title as string) || '',
        description: (item.description_en as string) || (item.description as string) || null,
        destinationUrl: (item.cta_url as string) || null,
      })
      const rawLink = (item.cta_url as string) || '#'
      const buttonLink = appendUtmToExternalUrl(rawLink, tracking)
      return {
        id: String(item.id),
        imageFile: (item.image_url as string) || '',
        titleBosnian: (item.title_ba as string) || (item.title as string) || '',
        titleEnglish: (item.title_en as string) || (item.title as string) || '',
        descriptionBosnian: (item.description_ba as string) || (item.description as string) || '',
        descriptionEnglish: (item.description_en as string) || (item.description as string) || '',
        buttonTextBosnian: (item.cta_text as string) || 'POGLEDAJ',
        buttonTextEnglish: (item.cta_text_en as string) || (item.cta_text as string) || 'VIEW',
        buttonLink,
        tracking,
      }
    })

    return {
      id: String(bs.id),
      blocks,
      styling: {
        blockBackground: 'rgba(255, 255, 255, 0.05)',
        titleColor: 'rgba(255, 255, 255, 1)',
        descriptionColor: 'rgba(255, 255, 255, 0.7)',
        buttonBackground: 'rgba(139, 92, 246, 1)',
        buttonTextColor: 'rgba(255, 255, 255, 1)',
      },
    }
  })

  const playAndWinRaw = params.playAndWinRaw
  let playAndWin: PortalContent['playAndWin']
  if (playAndWinRaw.length > 0) {
    const q = playAndWinRaw[0] as Record<string, unknown>
    const client = clientFromAnalyticsRow(q)
    const campaign = resolveCampaign(q.analytics_campaign_id, campaignMap)
    const tracking = buildContentSnapshot({
      placementType: 'play_and_win',
      row: q,
      client,
      campaign,
      title: (q.title_en as string) || (q.title as string) || '',
      destinationUrl: (q.cta_url as string) || (q.link as string) || null,
    })
    const rawLink = (q.cta_url as string) || (q.link as string) || '#'
    const link = appendUtmToExternalUrl(rawLink, tracking)
    playAndWin = {
      titleBosnian: (q.title_ba as string) || (q.title as string) || '',
      titleEnglish: (q.title_en as string) || (q.title as string) || '',
      subtitleBosnian: (q.subtitle_ba as string) || (q.subtitle as string) || '',
      subtitleEnglish: (q.subtitle_en as string) || (q.subtitle as string) || '',
      imageFile: (q.image_url as string) || '',
      link,
      tracking,
    }
  }

  const editorsPicks = params.editorsPicksRaw.map((p) => {
      const client = clientFromAnalyticsRow(p)
      const campaign = resolveCampaign(p.analytics_campaign_id, campaignMap)
      const tracking = buildContentSnapshot({
        placementType: 'listing_row',
        row: p,
        client,
        campaign,
        context: { listingType: 'pametno' },
        title: (p.title_en as string) || '',
        description: (p.description_en as string) || (p.description_ba as string) || null,
        destinationUrl: (p.cta_url as string) || null,
      })
      const rawLink = (p.cta_url as string) || '#'
      const link = appendUtmToExternalUrl(rawLink, tracking)
      return {
        id: String(p.id),
        titleBosnian: (p.title_ba as string) || '',
        titleEnglish: (p.title_en as string) || '',
        teaserBosnian: (p.description_ba as string) || undefined,
        teaserEnglish: (p.description_en as string) || undefined,
        imageFile: (p.image_url as string) || '',
        link,
        tracking,
      }
    })

  const discovery = {
    places: params.discoveryPlacesRaw.map((p) => {
        const client = clientFromAnalyticsRow(p)
        const campaign = resolveCampaign(p.analytics_campaign_id, campaignMap)
        const tracking = buildContentSnapshot({
          placementType: 'listing_row',
          row: p,
          client,
          campaign,
          context: { listingType: 'explore_sarajevo' },
          title: (p.name_en as string) || '',
          description: (p.description_en as string) || null,
          destinationUrl: (p.link as string) || null,
        })
        const rawLink = (p.link as string) || '#'
        const link = appendUtmToExternalUrl(rawLink, tracking)
        return {
          id: String(p.id),
          nameBosnian: (p.name_ba as string) || '',
          nameEnglish: (p.name_en as string) || '',
          categoryBosnian: (p.category_ba as string) || '',
          categoryEnglish: (p.category_en as string) || '',
          imageFile: (p.image_url as string) || '',
          link,
          tracking,
        }
      }),
  }

  return {
    global: {
      backgroundColor: 'rgba(10, 10, 15, 1)',
      primaryColor: siteConfig?.primary_color || 'rgba(139, 92, 246, 1)',
      secondaryColor: 'rgba(167, 139, 250, 1)',
    },
    heroVideos,
    heroBanners,
    chips,
    blockSets,
    newsCarousel,
    discovery,
    editorsPicks,
    playAndWin,
    footer: {
      icons:
        (siteConfig?.footer_icons as { id: string; name: string; url: string; icon: string }[]) || [],
      styling: {
        footerBackground: 'rgba(10, 10, 15, 1)',
        iconColor: 'rgba(139, 92, 246, 1)',
        textColor: 'rgba(255, 255, 255, 0.7)',
      },
    },
    utilities: {
      city: siteConfig?.city_name || 'Sarajevo',
      lat: siteConfig?.city_lat || 43.8563,
      lon: siteConfig?.city_lon || 18.4131,
      baseCurrency: siteConfig?.base_currency || 'BAM',
      targetCurrencies: (siteConfig?.target_currencies as string[]) || ['EUR', 'USD'],
    },
  }
}
