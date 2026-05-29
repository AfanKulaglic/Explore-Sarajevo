import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getUserFromBearer } from "@/lib/supabaseServer";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin(request: NextRequest): Promise<User | NextResponse> {
  if (!adminEmails.length) {
    return NextResponse.json({ error: "Admin emails not configured" }, { status: 500 });
  }

  const headerEmail = request.headers.get("x-admin-email")?.toLowerCase();
  const user = await getUserFromBearer(request.headers.get("authorization") ?? undefined);

  const resolvedEmail = user?.email?.toLowerCase() ?? headerEmail;
  if (!resolvedEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminEmails.includes(resolvedEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (user) {
    return user;
  }

  return {
    id: "admin-header",
    email: resolvedEmail,
    aud: "",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  } as User;
}
