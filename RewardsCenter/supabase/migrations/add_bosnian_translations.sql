-- Migration: Add Bosnian language fields to rewards, tournaments, achievements, and categories
-- Run this migration manually in your Supabase SQL editor

-- ============================================
-- REWARDS TABLE - Add Bosnian fields
-- ============================================
ALTER TABLE public.rewards 
ADD COLUMN IF NOT EXISTS title_bosnian character varying,
ADD COLUMN IF NOT EXISTS subtitle_bosnian character varying,
ADD COLUMN IF NOT EXISTS description_bosnian text;

COMMENT ON COLUMN public.rewards.title_bosnian IS 'Bosnian translation of the reward title';
COMMENT ON COLUMN public.rewards.subtitle_bosnian IS 'Bosnian translation of the reward subtitle';
COMMENT ON COLUMN public.rewards.description_bosnian IS 'Bosnian translation of the reward description';

-- ============================================
-- TOURNAMENTS TABLE - Add Bosnian fields
-- ============================================
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS title_bosnian character varying,
ADD COLUMN IF NOT EXISTS description_bosnian text,
ADD COLUMN IF NOT EXISTS rules_bosnian text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.tournaments.title_bosnian IS 'Bosnian translation of the tournament title';
COMMENT ON COLUMN public.tournaments.description_bosnian IS 'Bosnian translation of the tournament description';
COMMENT ON COLUMN public.tournaments.rules_bosnian IS 'Bosnian translation of the tournament rules';

-- ============================================
-- ACHIEVEMENTS TABLE - Add Bosnian fields
-- ============================================
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS title_bosnian character varying,
ADD COLUMN IF NOT EXISTS description_bosnian text;

COMMENT ON COLUMN public.achievements.title_bosnian IS 'Bosnian translation of the achievement title';
COMMENT ON COLUMN public.achievements.description_bosnian IS 'Bosnian translation of the achievement description';

-- ============================================
-- REWARD_CATEGORIES TABLE - Add Bosnian fields
-- ============================================
ALTER TABLE public.reward_categories 
ADD COLUMN IF NOT EXISTS name_bosnian character varying,
ADD COLUMN IF NOT EXISTS description_bosnian text;

COMMENT ON COLUMN public.reward_categories.name_bosnian IS 'Bosnian translation of the category name';
COMMENT ON COLUMN public.reward_categories.description_bosnian IS 'Bosnian translation of the category description';

-- ============================================
-- Verify migration was successful
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added Bosnian fields to: rewards, tournaments, achievements, reward_categories';
END $$;
