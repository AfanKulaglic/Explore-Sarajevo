import { NextRequest, NextResponse } from 'next/server'
import { countTodayAwards, createGameSupabaseServiceClient, type AwardGame } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const game = body.game as AwardGame
    if (!game) {
      return NextResponse.json({ success: false, error: 'game required' }, { status: 400 })
    }

    const userId = body.userId as string | undefined
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 })
    }

    const supabase = createGameSupabaseServiceClient()
    let error: { message: string } | null = null

    switch (game) {
      case 'wheel': {
        const result = await supabase.from('wheel_awards').insert({
          user_id: userId,
          user_name: body.userName ?? null,
          prize_id: body.prizeId,
          prize_label: body.prizeLabel,
          prize_icon: body.prizeIcon,
          prize_color: body.prizeColor,
          points_awarded: body.coinsAwarded ?? 0,
          coins_awarded: body.coinsAwarded ?? 0,
          xp_awarded: body.xpAwarded ?? 0,
        })
        error = result.error
        break
      }
      case 'memory': {
        const result = await supabase.from('memory_awards').insert({
          user_id: userId,
          user_name: body.userName ?? null,
          difficulty: body.difficulty,
          moves: body.moves,
          time_seconds: body.timeSeconds,
          pairs_matched: body.pairsMatched,
          total_pairs: body.totalPairs,
          is_win: body.isWin,
          coins_awarded: body.coinsAwarded ?? 0,
          xp_awarded: body.xpAwarded ?? 0,
        })
        error = result.error
        break
      }
      case 'puzzle': {
        const result = await supabase.from('puzzle_awards').insert({
          user_id: userId,
          user_name: body.userName ?? null,
          difficulty: body.difficulty,
          grid_size: body.gridSize,
          moves: body.moves,
          time_seconds: body.timeSeconds,
          puzzle_image_id: body.puzzleImageId ?? null,
          is_win: body.isWin,
          coins_awarded: body.coinsAwarded ?? 0,
          xp_awarded: body.xpAwarded ?? 0,
        })
        error = result.error
        break
      }
      case 'wordsearch': {
        const result = await supabase.from('wordsearch_awards').insert({
          user_id: userId,
          user_name: body.userName ?? null,
          difficulty: body.difficulty,
          words_found: body.wordsFound,
          total_words: body.totalWords,
          time_seconds: body.timeSeconds,
          is_win: body.isWin,
          coins_awarded: body.coinsAwarded ?? 0,
          xp_awarded: body.xpAwarded ?? 0,
        })
        error = result.error
        break
      }
      case 'pacman': {
        const result = await supabase.from('pacman_awards').insert({
          user_id: userId,
          user_name: body.userName ?? null,
          difficulty: body.difficulty,
          score: body.score,
          dots_eaten: body.dotsEaten,
          total_dots: body.totalDots,
          ghosts_eaten: body.ghostsEaten,
          time_seconds: body.timeSeconds,
          is_win: body.isWin,
          coins_awarded: body.coinsAwarded ?? 0,
          xp_awarded: body.xpAwarded ?? 0,
        })
        error = result.error
        break
      }
      default:
        return NextResponse.json({ success: false, error: 'Unknown game' }, { status: 400 })
    }

    if (error) {
      console.error(`[awards] ${game} insert failed:`, error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const winsOnly = game !== 'wheel'
    const playsToday = await countTodayAwards(game, userId, winsOnly)

    return NextResponse.json(
      { success: true, playsToday },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    )
  } catch (err) {
    console.error('[awards] POST error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
