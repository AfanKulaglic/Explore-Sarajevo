import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SiteConfig } from '@/types/database'
import { transformPortalPayload } from '@/lib/portal/transform-portal'

/**
 * GET /api/portal
 *
 * Fetches all portal content from Supabase in a single request.
 * Attaches structured analytics metadata + UTM-enriched outbound links.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const sc = supabase.schema('sarayaconnect')

    const [
      siteConfigResult,
      heroVideosResult,
      heroBannersResult,
      newsCardsResult,
      chipsResult,
      blockSetsResult,
      playAndWinResult,
      editorsPicksResult,
      discoveryPlacesResult,
      campaignsResult,
    ] = await Promise.all([
      sc.from('hs_site_config').select('*').eq('id', 1).single(),
      sc.from('hs_hero_videos').select('*').eq('is_active', true).order('display_order'),
      sc.from('hs_hero_banners').select('*').eq('is_active', true).order('display_order'),
      sc.from('hs_news_cards').select('*').eq('is_active', true).order('display_order'),
      sc.from('hs_navigation_chips').select('*').eq('is_active', true).order('display_order'),
      sc
        .from('hs_block_sets')
        .select(`
          *,
          items:hs_block_items(*)
        `)
        .eq('is_active', true)
        .order('display_order'),
      sc.from('playnwin').select('*').eq('is_active', true).order('display_order').limit(1),
      sc.from('hs_editors_picks').select('*').eq('is_active', true).order('display_order'),
      sc.from('hs_discovery_places').select('*').eq('is_active', true).order('display_order'),
      sc.from('hs_marketing_campaigns').select('id, name, slug').eq('is_active', true).order('name'),
    ])

    const siteConfig = siteConfigResult.data as SiteConfig | null
    const campaigns = campaignsResult.error ? [] : campaignsResult.data || []

    const portalContent = transformPortalPayload({
      siteConfig,
      heroVideosRaw: (heroVideosResult.data || []) as Record<string, unknown>[],
      heroBannersRaw: (heroBannersResult.data || []) as Record<string, unknown>[],
      newsCardsRaw: (newsCardsResult.data || []) as Record<string, unknown>[],
      chipsRaw: (chipsResult.data || []) as Record<string, unknown>[],
      blockSetsRaw: (blockSetsResult.data || []) as Record<string, unknown>[],
      playAndWinRaw: (playAndWinResult.data || []) as Record<string, unknown>[],
      editorsPicksRaw: (editorsPicksResult.data || []) as Record<string, unknown>[],
      discoveryPlacesRaw: (discoveryPlacesResult.data || []) as Record<string, unknown>[],
      campaigns: campaigns as { id: number; name: string; slug: string }[],
    })

    return NextResponse.json({
      success: true,
      data: portalContent,
      source: 'supabase',
    })
  } catch (error) {
    console.error('[API /portal] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portal content' },
      { status: 500 }
    )
  }
}
