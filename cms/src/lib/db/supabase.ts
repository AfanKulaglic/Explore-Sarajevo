import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️  Supabase credentials missing in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
}

// Use service role for CMS - bypasses RLS (CMS is admin-only anyway)
export const supabase = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Service role client for storage operations (bypasses RLS)
export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase;

// Pre-scoped schema client — use this for all application table queries
export const sc = supabase.schema('sarayaconnect');

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await sc.from('es_categories').select('count').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    return true;
  } catch (err) {
    throw err;
  }
}

export default supabase;
