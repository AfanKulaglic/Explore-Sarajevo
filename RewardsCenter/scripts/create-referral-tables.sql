-- Create user_referrals table for storing referral codes and relationships
CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id TEXT NOT NULL UNIQUE,
    referral_code TEXT UNIQUE,
    referred_by TEXT,  -- account_id of who referred them
    referred_at TIMESTAMPTZ,  -- when they used a referral code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_referrals_account_id ON user_referrals(account_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referral_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred_by ON user_referrals(referred_by);

-- Create referral_rewards table for tracking rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id TEXT NOT NULL,  -- account who gets the reward
    referred_id TEXT NOT NULL,  -- account who was referred or whose code was used
    coins_awarded INTEGER NOT NULL DEFAULT 5000,
    is_welcome_bonus BOOLEAN DEFAULT FALSE,  -- true if this was for entering a code (not for being referred)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred_id ON referral_rewards(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_created_at ON referral_rewards(created_at);

-- Enable Row Level Security (optional, adjust as needed)
-- ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies if RLS is enabled (commented out by default)
-- CREATE POLICY "Users can view their own referral data" ON user_referrals
--     FOR SELECT USING (true);
-- CREATE POLICY "Users can update their own referral data" ON user_referrals
--     FOR UPDATE USING (true);
-- CREATE POLICY "Users can insert referral data" ON user_referrals
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Users can view their own rewards" ON referral_rewards
--     FOR SELECT USING (true);
-- CREATE POLICY "Service can insert rewards" ON referral_rewards
--     FOR INSERT WITH CHECK (true);
