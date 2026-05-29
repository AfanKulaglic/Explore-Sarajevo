import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSocialFollowsTable() {
  console.log('Creating social_follows table...')
  
  // Try to create the table using raw SQL via RPC or direct query
  // Since we can't run raw SQL directly, let's try inserting and see if table exists
  
  const { error: checkError } = await supabase
    .from('rewards_social_follows')
    .select('id')
    .limit(1)
  
  if (checkError && checkError.code === '42P01') {
    console.log('Table does not exist. Please run the following SQL in your Supabase SQL Editor:')
    console.log(`
CREATE TABLE IF NOT EXISTS social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  coins_awarded INTEGER NOT NULL DEFAULT 2000,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_follows_user_id ON social_follows(user_id);
    `)
    process.exit(1)
  } else if (checkError) {
    console.error('Error checking table:', checkError)
    process.exit(1)
  }
  
  console.log('✓ social_follows table exists!')
}

createSocialFollowsTable()
