import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, { ...options, cache: 'no-store' });
        }
      }
    });
    const supabase = client.schema('gamelauncher');

    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .order('sort_order', { ascending: true });

    console.log('[Game Settings API] Raw DB response:', JSON.stringify(data));

    if (error) {
      console.error('Error fetching game settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Game settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
