import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";
import { isRedirectAllowed } from "@/lib/ssoConfig";

/**
 * Redirect-based SSO linking for cross-domain scenarios.
 * Used when the calling site is on a completely different domain (e.g., pametnoodabrano.com)
 * and cannot share cookies with .saraya.solutions.
 * 
 * Flow:
 * 1. Client site redirects here with tokens in URL params
 * 2. This endpoint sets the session cookie as first-party
 * 3. Redirects back to the client site
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const redirectUri = searchParams.get("redirect_uri");

  // Validate redirect URI
  if (!redirectUri || !isRedirectAllowed(redirectUri)) {
    return NextResponse.json(
      { error: "Invalid or missing redirect_uri" },
      { status: 400 }
    );
  }

  // If no tokens provided, just redirect back (nothing to link)
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(redirectUri);
  }

  // Create response that will redirect back
  const response = NextResponse.redirect(redirectUri);
  
  // Set the session cookie on accounts.saraya.solutions
  const supabase = createSupabaseRouteClient(response);
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error("Failed to set SSO session:", error.message);
    // Still redirect back, but the SSO won't work
  }

  return response;
}
