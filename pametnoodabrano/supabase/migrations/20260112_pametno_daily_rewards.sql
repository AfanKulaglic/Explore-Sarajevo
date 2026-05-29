-- Pametno Saraya Daily Rewards Table
-- This table tracks daily login rewards and article reading rewards for users
-- 
-- IMPORTANT: Daily rewards reset at 00:00 CET (Central European Time)
-- The application uses getTodayCET() to determine the current date in CET timezone
--
-- Reward Structure:
-- - Daily login: 500 coins (one-time per day)
-- - Article reading: 50 coins per article (max 30 articles = 1500 coins)
-- - Daily cap: 2000 coins total (500 + 1500)
-- - Streak multiplier from RewardsCenter applies to all rewards
--
-- This table is in the CENTRAL ACCOUNT database (not the CMS database)

CREATE TABLE IF NOT EXISTS pametno_daily_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,  -- References accounts.id (TEXT type)
    reward_date DATE NOT NULL, -- Stored in CET timezone (application handles conversion)
    
    -- Daily login reward (granted once when user first visits the site each day)
    daily_login_claimed BOOLEAN DEFAULT FALSE,
    daily_login_coins INTEGER DEFAULT 0,
    
    -- Article reading rewards (50 coins per article, max 30 articles/day = 1500 coins)
    articles_read INTEGER DEFAULT 0,
    articles_coins_earned INTEGER DEFAULT 0,
    article_slugs TEXT[] DEFAULT '{}', -- Track which articles were read to prevent duplicates
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per day (CET date)
    UNIQUE(account_id, reward_date)
);

-- Index for faster lookups by account and date
CREATE INDEX IF NOT EXISTS idx_pametno_daily_rewards_account_date 
ON pametno_daily_rewards(account_id, reward_date DESC);

-- Index for date-based queries (e.g., cleanup of old records)
CREATE INDEX IF NOT EXISTS idx_pametno_daily_rewards_date 
ON pametno_daily_rewards(reward_date);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pametno_daily_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pametno_daily_rewards_updated_at ON pametno_daily_rewards;
CREATE TRIGGER trigger_pametno_daily_rewards_updated_at
    BEFORE UPDATE ON pametno_daily_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_pametno_daily_rewards_updated_at();

-- RLS policies
ALTER TABLE pametno_daily_rewards ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (needed for API routes)
CREATE POLICY "Service role has full access to pametno_daily_rewards"
ON pametno_daily_rewards
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read their own records
CREATE POLICY "Users can read their own pametno_daily_rewards"
ON pametno_daily_rewards
FOR SELECT
TO authenticated
USING (account_id = auth.uid());

-- Optional: Add foreign key constraint if accounts table exists
-- Uncomment if running on central account database with accounts table:
-- ALTER TABLE pametno_daily_rewards 
--   ADD CONSTRAINT pametno_daily_rewards_account_id_fkey 
--   FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;
