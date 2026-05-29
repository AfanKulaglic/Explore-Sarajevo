import { load } from 'cheerio'
import { unstable_cache } from 'next/cache'

import { DEFAULT_CHATBOT_WEB_URLS, isChatbotWebFetchAllowedHost } from '@/lib/companyKnowledge/webAllowlist'

const FETCH_TIMEOUT_MS = 12_000
const MAX_HTML_BYTES = 600_000
const MAX_TEXT_PER_URL = 12_000
const MAX_TOTAL_WEB_CHARS = 28_000

function parseEnvUrlList(): string[] {
  const raw = process.env.CHATBOT_WEB_URLS?.trim()
  if (!raw) return [...DEFAULT_CHATBOT_WEB_URLS]
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function normalizeAndValidateUrl(raw: string): string | null {
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    if (!isChatbotWebFetchAllowedHost(u.hostname)) return null
    u.hash = ''
    return u.toString()
  } catch {
    return null
  }
}

async function fetchOneSite(url: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'SarayaCompanyChatbot/1.0 (+https://sarayasolutions.com)',
      },
    })

    if (!res.ok) {
      return `### ${url}\n[Could not load: HTTP ${res.status}]`
    }

    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_HTML_BYTES) {
      return `### ${url}\n[Skipped: response larger than ${MAX_HTML_BYTES} bytes]`
    }

    const html = new TextDecoder('utf-8', { fatal: false }).decode(buf)
    const $ = load(html)
    $('script, style, noscript, iframe, svg, template').remove()
    let text = $('body').text() || ''
    text = text.replace(/\s+/g, ' ').trim()
    if (!text) {
      return `### ${url}\n[No visible text in HTML — page may be mostly JavaScript; use static content or sitemap URLs if needed.]`
    }
    if (text.length > MAX_TEXT_PER_URL) {
      text = `${text.slice(0, MAX_TEXT_PER_URL)}…`
    }
    return `### ${url}\n${text}`
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    return `### ${url}\n[Fetch error: ${msg}]`
  } finally {
    clearTimeout(timer)
  }
}

async function buildWebDigestUncached(): Promise<string> {
  if (process.env.CHATBOT_WEB_FETCH !== '1') {
    return ''
  }

  const candidates = parseEnvUrlList()
  const urls: string[] = []
  for (const c of candidates) {
    const ok = normalizeAndValidateUrl(c)
    if (ok) urls.push(ok)
  }

  if (urls.length === 0) return ''

  const chunks = await Promise.all(urls.map((u) => fetchOneSite(u)))
  const joined = chunks.join('\n\n').trim()
  if (joined.length <= MAX_TOTAL_WEB_CHARS) return joined
  return `${joined.slice(0, MAX_TOTAL_WEB_CHARS)}\n\n[…web digest truncated…]`
}

/**
 * Cached HTML→text snapshots of allowlisted sites (1h default).
 * SPAs often return little text without a headless browser — see env notes.
 */
export async function getCachedWebKnowledgeDigest(): Promise<string> {
  const cached = unstable_cache(buildWebDigestUncached, ['company-chat-web-digest-v1'], {
    revalidate: Number(process.env.CHATBOT_WEB_CACHE_SECONDS) || 3600,
    tags: ['company-chat-web'],
  })
  return cached()
}
