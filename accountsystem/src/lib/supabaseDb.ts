import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const db = supabaseAdmin.schema('accountsystem');

// Type definitions matching the database schema
export interface Account {
  id: string;
  supabase_user_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoinWallet {
  id: string;
  account_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface XpProfile {
  id: string;
  account_id: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  code: string;
  name: string;
  type: string;
  api_key_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformMembership {
  id: string;
  account_id: string;
  platform_id: string;
  joined_at: string;
}

export interface ActivityEvent {
  id: string;
  account_id: string;
  platform_id: string;
  event_type: string;
  coins_delta: number;
  tokens_delta: number;
  xp_delta: number;
  metadata: any;
  created_at: string;
}
