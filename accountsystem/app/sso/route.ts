import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";
import { appendParams, isRedirectAllowed } from "@/lib/ssoConfig";
import { createSsoCode } from "@/lib/ssoCodes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!isRedirectAllowed(redirectUri)) {
    return NextResponse.json({ success: false, error: "redirect_uri not allowed" }, { status: 400 });
  }

  const supabase = createSupabaseRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const fallback = appendParams(redirectUri!, {
      error: "login_required",
      state: state || undefined,
    });
    return NextResponse.redirect(fallback);
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.ip || null;
  const userAgent = request.headers.get("user-agent");

  const { code } = await createSsoCode({
    accountId: session.user.id,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    sessionExpiresAt: session.expires_at,
    redirectUri: redirectUri!,
    state,
    userAgent,
    ipAddress,
  });

  const target = appendParams(redirectUri!, {
    code,
    state: state || undefined,
  });

  return NextResponse.redirect(target);
}
