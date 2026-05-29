const ACCOUNTS_ORIGIN = process.env.NEXT_PUBLIC_ACCOUNTS_URL || 'https://accounts.saraya.solutions'

export interface CentralSessionTokens {
  access_token: string
  refresh_token: string
}

/**
 * For pametnoodabrano.com (different domain), we use redirect-based SSO linking.
 * This redirects to accounts.saraya.solutions which sets the cookie as first-party,
 * then redirects back to the specified URL.
 */
export function buildSsoLinkRedirectUrl(session: CentralSessionTokens, returnUrl: string): string {
  const url = new URL('/api/auth/sso-link-redirect', ACCOUNTS_ORIGIN)
  url.searchParams.set('access_token', session.access_token)
  url.searchParams.set('refresh_token', session.refresh_token)
  url.searchParams.set('redirect_uri', returnUrl)
  return url.toString()
}

/**
 * Link session to central auth for cross-site SSO.
 * For pametnoodabrano.com, this performs a redirect instead of fetch since
 * cookies cannot be shared across different domains.
 */
export async function linkCentralSession(session?: CentralSessionTokens | null, returnUrl?: string) {
  if (!session?.access_token || !session?.refresh_token) return
  
  // Redirect to accounts.saraya.solutions to set the cookie as first-party
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
