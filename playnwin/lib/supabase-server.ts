import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const AWARD_TABLES = {
  wheel: 'wheel_awards',
  memory: 'memory_awards',
  puzzle: 'puzzle_awards',
  wordsearch: 'wordsearch_awards',
  pacman: 'pacman_awards',
} as const

export type AwardGame = keyof typeof AWARD_TABLES

let cachedEnv: Record<string, string> | null = null

function loadEnvFile(): Record<string, string> {
  if (cachedEnv) return cachedEnv
  cachedEnv = {}
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) return cachedEnv
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    cachedEnv[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return cachedEnv
}

function getEnv(name: string): string | undefined {
  return process.env[name] ?? loadEnvFile()[name]
}

export function createGameSupabaseServiceClient() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    throw new Error('Missing Supabase configuration')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'gamelauncher' },
  })
}

/** CET midnight for daily limit resets (UTC+1). */
export function getCETMidnight(): Date {
  const now = new Date()
  const utcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  )
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - 1)
  return utcMidnight
}

/** Count today's award rows for a user (select ids — reliable vs head count). */
export async function countTodayAwards(
  game: AwardGame,
  userId: string,
  winsOnly = false
): Promise<number> {
  const table = AWARD_TABLES[game]
  const supabase = createGameSupabaseServiceClient()
  const since = getCETMidnight().toISOString()

  let query = supabase
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', since)

  if (winsOnly) {
    query = query.eq('is_win', true)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(error.message)
  }
  return data?.length ?? 0
}
