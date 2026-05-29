-- Create social_follows table for tracking social media follow rewards
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  coins_awarded INTEGER NOT NULL DEFAULT 2000,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one claim per user per platform
  CONSTRAINT unique_user_platform UNIQUE (user_id, platform)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_follows_user_id ON social_follows(user_id);

-- Enable Row Level Security (optional, depending on your setup)
-- ALTER TABLE social_follows ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own follows
-- CREATE POLICY "Users can read own follows" ON social_follows
--   FOR SELECT USING (auth.uid() = user_id);
