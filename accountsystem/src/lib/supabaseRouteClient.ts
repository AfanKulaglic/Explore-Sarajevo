import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SSO_COOKIE_DOMAIN, SSO_COOKIE_NAME } from "./ssoConfig";

export function createSupabaseRouteClient(response?: NextResponse) {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          if (!response) return;
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
              domain: SSO_COOKIE_DOMAIN,
            });
          });
        },
      },
      cookieOptions: {
        name: SSO_COOKIE_NAME,
        domain: SSO_COOKIE_DOMAIN,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}
