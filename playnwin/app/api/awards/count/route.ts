import { NextRequest, NextResponse } from 'next/server'
import { countTodayAwards, type AwardGame } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const GAMES: AwardGame[] = ['wheel', 'memory', 'puzzle', 'wordsearch', 'pacman']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const game = searchParams.get('game') as AwardGame | null
    const userId = searchParams.get('userId')
    const winsOnly = searchParams.get('winsOnly') === '1'

    if (!game || !userId || !GAMES.includes(game)) {
      return NextResponse.json({ success: false, error: 'game and userId required' }, { status: 400 })
    }

    const count = await countTodayAwards(game, userId, winsOnly)

    return NextResponse.json(
      { success: true, count },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    )
  } catch (err) {
    console.error('[awards/count] GET error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
