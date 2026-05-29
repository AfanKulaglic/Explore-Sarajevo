import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  try {
    await testConnection();
    return NextResponse.json({ ok: true, connected: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, connected: false, error: message }, { status: 500 });
  }
}
