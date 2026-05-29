import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabaseDb";
import { requireAdmin } from "@/lib/auth/adminGuard";

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const adminUser = await requireAdmin(request);
  if (adminUser instanceof NextResponse) return adminUser;

  try {
    const { data: activities, error } = await db
      .from("activity_events")
      .select(
        `
        id,
        event_type,
        coins_delta,
        tokens_delta,
        xp_delta,
        metadata,
        created_at,
        platform:platforms(code, name)
      `
      )
      .eq("account_id", params.accountId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching activities:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
