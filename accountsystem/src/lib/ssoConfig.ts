const DEFAULT_REDIRECTS = [
  'http://localhost:3000',
  'http://localhost:3004',
  'http://localhost:3005',
  'https://accounts.saraya.solutions',
];

function normalizeList(value?: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const SSO_COOKIE_DOMAIN = process.env.SSO_COOKIE_DOMAIN || '.saraya.solutions';
export const SSO_COOKIE_NAME = process.env.SSO_COOKIE_NAME || 'sb-auth-token';
export const SSO_CODE_TTL_SECONDS = Number(process.env.SSO_CODE_TTL_SECONDS || '60');

const allowedRedirects = new Set([
  ...DEFAULT_REDIRECTS,
  ...normalizeList(process.env.SSO_ALLOWED_REDIRECTS),
]);

const allowedOrigins = new Set([
  ...DEFAULT_REDIRECTS.map((value) => {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  }).filter(Boolean) as string[],
  ...normalizeList(process.env.SSO_ALLOWED_ORIGINS)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return value;
      }
    })
    .filter(Boolean),
]);

export function isRedirectAllowed(target: string | null): boolean {
  if (!target) return false;
  try {
    const url = new URL(target);
    const origin = url.origin;
    if (allowedRedirects.has(target) || allowedRedirects.has(origin)) {
      return true;
    }
    // Allow bare host matches (e.g., pametnoodabrano.com)
    for (const entry of allowedRedirects) {
      if (!entry.includes('://') && url.hostname.endsWith(entry)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const normalized = new URL(origin).origin;
    return allowedOrigins.has(normalized);
  } catch {
    return allowedOrigins.has(origin);
  }
}

export function appendParams(baseUrl: string, params: Record<string, string | undefined>) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}
