const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://saraya.deployer3000.halvooo.com'

function supabaseHost(): string {
  try {
    return new URL(SUPABASE_URL).host
  } catch {
    return 'saraya.deployer3000.halvooo.com'
  }
}

/** Rewrite legacy Supabase storage URLs to the current self-hosted project. */
export function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url || !url.trim()) return null
  const trimmed = url.trim()
  if (trimmed.startsWith('data:')) return trimmed

  try {
    if (trimmed.startsWith('/storage/v1/')) {
      return `https://${supabaseHost()}${trimmed}`
    }

    const parsed = new URL(trimmed)

    if (parsed.pathname.includes('/storage/v1/object/public/')) {
      parsed.protocol = 'https:'
      parsed.host = supabaseHost()
      return parsed.toString()
    }

    return trimmed
  } catch {
    return trimmed
  }
}

/** Resolved src when account has a stored avatar (URL or data URI). */
export function getAvatarSrc(
  avatarUrl: string | null | undefined,
  _seed?: string
): string | null {
  return normalizeAvatarUrl(avatarUrl)
}

/** next/image cannot optimize remote SVG (Dicebear); use a native img instead. */
export function avatarRequiresNativeImg(src: string): boolean {
  return (
    src.startsWith('data:') ||
    src.includes('api.dicebear.com') ||
    src.includes('.svg') ||
    src.includes('/svg?')
  )
}
