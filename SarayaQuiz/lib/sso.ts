const ACCOUNTS_ORIGIN =
  process.env.NEXT_PUBLIC_ACCOUNTS_URL ||
  process.env.NEXT_PUBLIC_ACCOUNTS_ORIGIN ||
  'https://accounts.saraya.solutions'

export interface CentralSessionTokens {
  access_token: string
  refresh_token: string
}

export function buildSsoLinkRedirectUrl(session: CentralSessionTokens, returnUrl: string): string {
  const url = new URL('/api/auth/sso-link-redirect', ACCOUNTS_ORIGIN)
  url.searchParams.set('access_token', session.access_token)
  url.searchParams.set('refresh_token', session.refresh_token)
  url.searchParams.set('redirect_uri', returnUrl)
  return url.toString()
}

export async function linkCentralSession(
  session?: CentralSessionTokens | null,
  returnUrl?: string
) {
  if (!session?.access_token || !session?.refresh_token) return

  const redirectUrl = buildSsoLinkRedirectUrl(session, returnUrl || window.location.href)
  window.location.href = redirectUrl
}

export function buildSsoRedirectUrl(target: string, state: string) {
  const url = new URL('/sso', ACCOUNTS_ORIGIN)
  url.searchParams.set('redirect_uri', target)
  url.searchParams.set('state', state)
  return url.toString()
}

export const SSO_EXCHANGE_ENDPOINT = '/api/auth/exchange'
