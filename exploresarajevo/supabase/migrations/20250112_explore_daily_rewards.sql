-- Migration for Explore Sarajevo daily rewards tracking
-- Run this in the Central Account System Supabase database

-- Create explore_daily_rewards table to track daily login and item reading rewards
CREATE TABLE IF NOT EXISTS public.explore_daily_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id TEXT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
    daily_login_claimed BOOLEAN DEFAULT FALSE,
    items_read INTEGER DEFAULT 0,
    items_coins_earned INTEGER DEFAULT 0,
    item_slugs TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per day
    CONSTRAINT explore_daily_rewards_account_date_unique UNIQUE (account_id, reward_date)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_explore_daily_rewards_account_id ON public.explore_daily_rewards(account_id);
CREATE INDEX IF NOT EXISTS idx_explore_daily_rewards_reward_date ON public.explore_daily_rewards(reward_date);
CREATE INDEX IF NOT EXISTS idx_explore_daily_rewards_account_date ON public.explore_daily_rewards(account_id, reward_date);

-- Enable Row Level Security
ALTER TABLE public.explore_daily_rewards ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role full access (for API routes)
CREATE POLICY "Service role has full access to explore_daily_rewards"
    ON public.explore_daily_rewards
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_explore_daily_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_explore_daily_rewards_updated_at ON public.explore_daily_rewards;
CREATE TRIGGER update_explore_daily_rewards_updated_at
    BEFORE UPDATE ON public.explore_daily_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_explore_daily_rewards_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.explore_daily_rewards IS 'Tracks daily rewards for Explore Sarajevo app (login bonus + business/attraction reading)';
COMMENT ON COLUMN public.explore_daily_rewards.account_id IS 'Reference to the central account (TEXT id from accounts table)';
COMMENT ON COLUMN public.explore_daily_rewards.daily_login_claimed IS 'Whether the daily 300 coin login bonus was claimed';
COMMENT ON COLUMN public.explore_daily_rewards.items_read IS 'Number of businesses/attractions read today';
COMMENT ON COLUMN public.explore_daily_rewards.items_coins_earned IS 'Total coins earned from reading today (max 1700)';
COMMENT ON COLUMN public.explore_daily_rewards.item_slugs IS 'Array of "type:slug" keys for items read today';

-- Reward values:
-- Daily login: 300 coins
-- Premium highlighted: 200 coins
-- Highlighted (featured): 100 coins
-- Regular: 50 coins
-- Max daily from reading: 1700 coins
