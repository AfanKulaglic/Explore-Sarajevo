import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabaseRouteClient";
import { isAllowedOrigin } from "@/lib/ssoConfig";

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Credentials": "true",
};

function buildCorsResponse(origin: string | null, status = 200, body?: any) {
  const response = body
    ? NextResponse.json(body, { status })
    : new NextResponse(null, { status });
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  Object.entries(CORS_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return buildCorsResponse(origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedOrigin(origin)) {
    return buildCorsResponse(null, 403, { error: "Origin not allowed" });
  }

  const { access_token, refresh_token } = await request.json();

  if (!access_token || !refresh_token) {
    return buildCorsResponse(origin, 400, { error: "access_token and refresh_token are required" });
  }

  const response = buildCorsResponse(origin, 200, { success: true });
  const supabase = createSupabaseRouteClient(response);
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    return buildCorsResponse(origin, 401, { error: error.message });
  }

  return response;
}
