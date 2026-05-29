-- Add time_limit_seconds column to puzzle_config (like memory_config has)
-- This changes the puzzle game from "complete as fast as possible" to "complete before time runs out"

ALTER TABLE public.puzzle_config 
ADD COLUMN time_limit_seconds integer NOT NULL DEFAULT 120;

-- Set reasonable defaults based on difficulty
UPDATE public.puzzle_config SET time_limit_seconds = 60 WHERE difficulty = 'easy';
UPDATE public.puzzle_config SET time_limit_seconds = 90 WHERE difficulty = 'medium';
UPDATE public.puzzle_config SET time_limit_seconds = 120 WHERE difficulty = 'hard';

-- Add comment
COMMENT ON COLUMN public.puzzle_config.time_limit_seconds IS 'Time limit in seconds to complete the puzzle. If time runs out, player loses.';
