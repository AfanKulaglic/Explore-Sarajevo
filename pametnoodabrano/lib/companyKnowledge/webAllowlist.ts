/**
 * Hosts the chatbot may fetch (SSRF guard). Only https, only these trees.
 * Add new marketing domains here after review — not from unchecked user input.
 */
export function isChatbotWebFetchAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local')) return false

  if (h === 'sarayasolutions.com' || h.endsWith('.sarayasolutions.com')) return true
  if (h === 'pametnoodabrano.com' || h.endsWith('.pametnoodabrano.com')) return true
  if (h === 'getarproduct.com' || h.endsWith('.getarproduct.com')) return true

  return false
}

/** Default home URLs to snapshot (edit here or override via CHATBOT_WEB_URLS). */
export const DEFAULT_CHATBOT_WEB_URLS: readonly string[] = [
  'https://sarayasolutions.com/',
  'https://bihdiscovery.com/',
  'https://hs.saraya.solutions/',
  'https://pametnoodabrano.com/',
  'https://rewards.saraya.solutions/',
  'https://saraya.games/',
  'https://www.getarproduct.com/',
]
