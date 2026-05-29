import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** PostHog removed; endpoint kept for compatibility. */
export async function GET() {
  return NextResponse.json({ ok: true, analytics: 'disabled' })
}
