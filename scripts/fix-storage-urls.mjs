/**
 * fix-storage-urls.mjs
 *
 * One-off migration script: rewrites Supabase Storage URLs in the hotspot
 * tables after moving from the old instance to the new one.
 *
 * Replaces:  sarayaconnect.deployer3000.halvooo.com
 * With:      saraya.deployer3000.halvooo.com
 *
 * Run once from the repo root:
 *   node scripts/fix-storage-urls.mjs
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY set below (or as env var)
 */

import { createClient } from '@supabase/supabase-js'

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SUPABASE_URL       = 'https://saraya.deployer3000.halvooo.com'
const SERVICE_ROLE_KEY   = process.env.SERVICE_ROLE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3Njk4Mjg2MCwiZXhwIjo0OTMyNjU2NDYwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.4mOrXNQMDUAO-JcviGsOeAthN_N0NHH7k6r03Ht1weM'

const NEW_BASE = 'https://saraya.deployer3000.halvooo.com/storage/v1/object/public'

// Each entry: [old bucket name, new bucket name]
// The regex matches ANY domain so it works regardless of which domain run already happened.
const BUCKET_RENAMES = [
  ['es_upload',       'sarayaconnect-es'],
  ['pametno_upload',  'sarayaconnect-pametno'],
  ['memory-cards',    'gamelauncher-memory'],
  ['puzzle-images',   'gamelauncher-puzzle'],
  ['rewards',         'sarayaconnect-rewards'],
]

// Regex: matches the full storage URL up to and including the old bucket name + slash,
// regardless of which domain is currently stored.
const BUCKET_PATTERNS = BUCKET_RENAMES.map(([oldBucket, newBucket]) => ({
  regex: new RegExp(`https?://[^/]+/storage/v1/object/public/${oldBucket}/`, 'g'),
  replacement: `${NEW_BASE}/${newBucket}/`,
  oldBucket,
}))

function rewriteUrl(val) {
  if (!val || typeof val !== 'string') return val
  let result = val
  for (const { regex, replacement } of BUCKET_PATTERNS) {
    result = result.replace(regex, replacement)
  }
  return result
}

function rewriteValue(val) {
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return JSON.stringify(parsed.map((entry) => rewriteValue(entry)))
      } catch {
        // fall back to plain string rewrite
      }
    }
    return rewriteUrl(val)
  }
  if (Array.isArray(val)) return val.map((entry) => rewriteValue(entry))
  if (val && typeof val === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(val)) out[k] = rewriteValue(v)
    return out
  }
  return val
}

function needsRewrite(val) {
  if (!val) return false
  if (Array.isArray(val)) return val.some((entry) => needsRewrite(entry))
  if (typeof val === 'object') return Object.values(val).some((entry) => needsRewrite(entry))
  if (typeof val !== 'string') return false
  const trimmed = val.trim()

  // JSON array stored as text: check whether any element needs rewrite
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) return false
      return parsed.some((entry) => needsRewrite(entry))
    } catch {
      // Fall through to plain-string matching on malformed JSON payloads
    }
  }

  return BUCKET_PATTERNS.some(({ regex }) => {
    regex.lastIndex = 0
    return regex.test(val)
  })
}

// ─── TABLES & COLUMNS THAT HOLD STORAGE URLs ─────────────────────────────────

// sarayaconnect schema
const TARGETS_SC = [
  { table: 'hs_hero_videos',      columns: ['video_url', 'video_url_alt', 'poster_url'] },
  { table: 'hs_hero_banners',     columns: ['image_url'] },
  { table: 'hs_news_cards',       columns: ['image_url'] },
  { table: 'hs_block_items',      columns: ['image_url'] },
  { table: 'playnwin',            columns: ['image_url'] },
  { table: 'hs_editors_picks',    columns: ['image_url'] },
  { table: 'hs_discovery_places', columns: ['image_url'] },
  { table: 'hs_navigation_chips', columns: ['custom_icon', 'icon'] },
  { table: 'po_products',         columns: ['image_url'] },
  { table: 'es_businesses',       columns: ['media'] },
  { table: 'es_attractions',      columns: ['media'] },
  { table: 'es_events',           columns: ['media'] },
  { table: 'es_sub_events',       columns: ['media'] },
  { table: 'es_categories',       columns: ['image', 'icon'] },
  { table: 'es_types',            columns: ['image'] },
]

// gamelauncher schema
const TARGETS_GL = [
  { table: 'memory_cards',        columns: ['image_url'] },
  { table: 'puzzle_images',       columns: ['image_url'] },
]

// rewardscenter schema
const TARGETS_RC = [
  { table: 'rewards',             columns: ['image_url'] },
  { table: 'reward_categories',   columns: ['icon'] },
  { table: 'achievements',        columns: ['icon'] },
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function fixColumn(schemaClient, table, column) {
  // Build an OR filter matching any old bucket name in the column value
  const orFilter = BUCKET_RENAMES
    .map(([oldBucket]) => `${column}.like.%/storage/v1/object/public/${oldBucket}/%`)
    .join(',')

  let { data: rows, error } = await schemaClient
    .from(table)
    .select(`id, ${column}`)
    .or(orFilter)

  // json/jsonb columns cannot use .like; fall back to full scan for one-off migration.
  if (error && error.message.includes('operator does not exist')) {
    const fallback = await schemaClient
      .from(table)
      .select(`id, ${column}`)
    rows = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error(`  ✗ ${table}.${column} — fetch error: ${error.message}`)
    return 0
  }

  const data = (rows || []).filter(row => needsRewrite(row[column]))

  if (data.length === 0) {
    console.log(`  · ${table}.${column} — nothing to fix`)
    return 0
  }

  let fixed = 0
  for (const row of data) {
    const oldVal = row[column]
    const newVal = rewriteValue(oldVal)

    const { error: updateError } = await schemaClient
      .from(table)
      .update({ [column]: newVal })
      .eq('id', row.id)

    if (updateError) {
      console.error(`  ✗ ${table}.${column} id=${row.id} — ${updateError.message}`)
    } else {
      console.log(`  ✓ ${table}.${column} id=${row.id}`)
      console.log(`      ${oldVal}`)
      console.log(`    → ${newVal}`)
      fixed++
    }
  }

  return fixed
}

async function main() {
  if (SERVICE_ROLE_KEY === 'REPLACE_WITH_SERVICE_ROLE_KEY') {
    console.error('ERROR: set SERVICE_ROLE_KEY env var or paste it into the script.')
    process.exit(1)
  }

  console.log('Fixing storage URLs (domain + bucket renames)...\n')

  const sc = supabase.schema('sarayaconnect')
  const gl = supabase.schema('gamelauncher')
  const rc = supabase.schema('rewardscenter')

  let total = 0

  console.log('── sarayaconnect ──')
  for (const { table, columns } of TARGETS_SC) {
    for (const col of columns) total += await fixColumn(sc, table, col)
  }

  console.log('\n── gamelauncher ──')
  for (const { table, columns } of TARGETS_GL) {
    for (const col of columns) total += await fixColumn(gl, table, col)
  }

  console.log('\n── rewardscenter ──')
  for (const { table, columns } of TARGETS_RC) {
    for (const col of columns) total += await fixColumn(rc, table, col)
  }

  console.log(`\nDone — ${total} row(s) updated.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
