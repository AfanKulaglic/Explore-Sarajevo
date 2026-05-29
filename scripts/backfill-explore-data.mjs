/**
 * Backfill Explore Sarajevo data after sarayaconnect schema migration:
 * - es_categories: slug, image, featured_category, display_order
 * - es_types: slug
 * - es_event_categories: link all events → Događaji (category id 2)
 *
 * Run from repo root:
 *   node scripts/backfill-explore-data.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://saraya.deployer3000.halvooo.com'
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  ''

const CHAR_MAP = {
  đ: 'd', Đ: 'd', ć: 'c', Ć: 'c', č: 'c', Č: 'c', š: 's', Š: 's', ž: 'z', Ž: 'z',
  dž: 'dz', Dž: 'dz', DŽ: 'dz',
}

function transliterate(text) {
  let result = text
  for (const [from, to] of Object.entries(CHAR_MAP)) {
    result = result.split(from).join(to)
  }
  return result.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function generateSlug(name) {
  return transliterate(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const BUCKET_REWRITES = [
  [
    /https?:\/\/[^/]+\/storage\/v1\/object\/public\/es_upload\//g,
    'https://saraya.deployer3000.halvooo.com/storage/v1/object/public/sarayaconnect-es/',
  ],
  [
    /https?:\/\/sarayaconnect\.deployer3000\.halvooo\.com\/storage\/v1\/object\/public\/es_upload\//g,
    'https://saraya.deployer3000.halvooo.com/storage/v1/object/public/sarayaconnect-es/',
  ],
]

function normalizeStorageUrl(url) {
  if (!url || typeof url !== 'string') return null
  let result = url.trim()
  if (!result) return null
  for (const [pattern, replacement] of BUCKET_REWRITES) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function parseMediaField(media) {
  if (!media) return []
  if (Array.isArray(media)) {
    return media.filter((e) => typeof e === 'string' && e.length > 0)
  }
  if (typeof media === 'string') {
    const trimmed = media.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.filter((e) => typeof e === 'string' && e.length > 0)
        }
      } catch {
        /* fall through */
      }
    }
    return trimmed ? [trimmed] : []
  }
  return []
}

function firstMediaUrl(media) {
  const urls = parseMediaField(media)
  return urls[0] ?? null
}

function coverScore(isPremium, isHighlight) {
  if (isPremium) return 3
  if (isHighlight) return 2
  return 1
}

async function getCategoryCoverUrls(sc) {
  const candidates = []

  const [{ data: businessRows }, { data: attractionRows }, { data: eventRows }] =
    await Promise.all([
      sc
        .from('es_business_categories')
        .select('category_id, is_premium, is_highlight, es_businesses(media)'),
      sc
        .from('es_attraction_categories')
        .select('category_id, is_premium, is_highlight, es_attractions(media)'),
      sc
        .from('es_event_categories')
        .select('category_id, is_premium, is_highlight, es_events(media)'),
    ])

  for (const row of businessRows || []) {
    const url = normalizeStorageUrl(firstMediaUrl(row.es_businesses?.media))
    if (url) {
      candidates.push({
        categoryId: row.category_id,
        url,
        score: coverScore(row.is_premium, row.is_highlight),
      })
    }
  }

  for (const row of attractionRows || []) {
    const url = normalizeStorageUrl(firstMediaUrl(row.es_attractions?.media))
    if (url) {
      candidates.push({
        categoryId: row.category_id,
        url,
        score: coverScore(row.is_premium, row.is_highlight),
      })
    }
  }

  for (const row of eventRows || []) {
    const url = normalizeStorageUrl(firstMediaUrl(row.es_events?.media))
    if (url) {
      candidates.push({
        categoryId: row.category_id,
        url,
        score: coverScore(row.is_premium, row.is_highlight),
      })
    }
  }

  const map = new Map()
  const bestScore = new Map()

  for (const c of candidates) {
    const prev = bestScore.get(c.categoryId) ?? 0
    if (!map.has(c.categoryId) || c.score > prev) {
      map.set(c.categoryId, c.url)
      bestScore.set(c.categoryId, c.score)
    }
  }

  return map
}

/** Homepage featured order from CMS (drag order). */
const CATEGORY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15]
const FEATURED_CATEGORY_IDS = new Set([1, 2, 3, 4, 5])
const DOGADJI_CATEGORY_ID = 2

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('Set SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const sc = supabase.schema('sarayaconnect')

  console.log('── Backfill es_event_categories (all events → Događaji) ──')
  const { data: events, error: eventsErr } = await sc.from('es_events').select('id, name')
  if (eventsErr) throw eventsErr

  const { count: existingLinks } = await sc
    .from('es_event_categories')
    .select('*', { count: 'exact', head: true })

  if ((existingLinks || 0) === 0 && events?.length) {
    const rows = events.map((e) => ({
      event_id: e.id,
      category_id: DOGADJI_CATEGORY_ID,
      is_highlight: false,
      is_premium: false,
    }))
    const { error: linkErr } = await sc.from('es_event_categories').insert(rows)
    if (linkErr) throw linkErr
    console.log(`  ✓ Linked ${rows.length} events to category ${DOGADJI_CATEGORY_ID}`)
  } else {
    console.log(`  · Skipped (${existingLinks || 0} links already exist)`)
  }

  const coverMap = await getCategoryCoverUrls(sc)

  console.log('\n── Backfill es_categories ──')
  const { data: categories, error: catErr } = await sc
    .from('es_categories')
    .select('id, name, slug, image')
    .order('id')
  if (catErr) throw catErr

  for (let i = 0; i < CATEGORY_DISPLAY_ORDER.length; i++) {
    const id = CATEGORY_DISPLAY_ORDER[i]
    const cat = categories.find((c) => c.id === id)
    if (!cat) continue

    const slug = generateSlug(cat.name)
    const image =
      normalizeStorageUrl(cat.image) || coverMap.get(cat.id) || null

    const { error } = await sc
      .from('es_categories')
      .update({
        slug,
        image,
        display_order: i,
        featured_category: FEATURED_CATEGORY_IDS.has(id),
      })
      .eq('id', id)

    if (error) {
      console.error(`  ✗ category ${id}: ${error.message}`)
    } else {
      console.log(`  ✓ ${cat.name} → slug=${slug}${image ? ' (image)' : ''}`)
    }
  }

  for (const cat of categories) {
    if (CATEGORY_DISPLAY_ORDER.includes(cat.id)) continue
    const slug = generateSlug(cat.name)
    const image =
      normalizeStorageUrl(cat.image) || coverMap.get(cat.id) || null
    const { error } = await sc
      .from('es_categories')
      .update({ slug, image, featured_category: false })
      .eq('id', cat.id)
    if (error) console.error(`  ✗ category ${cat.id}: ${error.message}`)
    else console.log(`  ✓ ${cat.name} → slug=${slug}`)
  }

  console.log('\n── Backfill es_types slugs ──')
  const { data: types, error: typesErr } = await sc.from('es_types').select('id, name, slug')
  if (typesErr) throw typesErr

  let typeFixed = 0
  for (const t of types || []) {
    if (t.slug?.trim()) continue
    const slug = generateSlug(t.name)
    const { error } = await sc.from('es_types').update({ slug }).eq('id', t.id)
    if (error) {
      console.error(`  ✗ type ${t.id}: ${error.message}`)
    } else {
      typeFixed++
    }
  }
  console.log(`  ✓ Updated ${typeFixed} type slugs`)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
