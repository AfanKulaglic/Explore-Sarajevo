-- Create user_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  achievement_slug TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, achievement_slug)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_account ON user_achievements(account_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_slug ON user_achievements(achievement_slug);
