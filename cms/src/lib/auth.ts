import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET = process.env.SESSION_JWT_SECRET || 'fallback-secret-change-in-production';
export const TOKEN_COOKIE = 'auth_token';
const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface TokenPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function signToken(user: TokenPayload): string {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// For API route handlers - verifies auth from request cookies
export async function verifyAuth(request: NextRequest): Promise<TokenPayload | null> {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// For use in route handlers - creates a Set-Cookie header value
export function createAuthCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = TOKEN_TTL_SECONDS;
  const secure = isProduction ? '; Secure' : '';
  return `${TOKEN_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function createClearAuthCookieHeader(): string {
  return `${TOKEN_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

// For use in server components/actions
export async function getAuthFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
