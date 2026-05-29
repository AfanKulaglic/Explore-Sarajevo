-- Add probability weight column to wheel_prizes
-- Higher weight = higher chance of landing on this prize
-- Default weight of 100 means equal probability for all prizes initially

ALTER TABLE public.wheel_prizes 
ADD COLUMN probability_weight integer NOT NULL DEFAULT 100;

-- Add a comment explaining the column
COMMENT ON COLUMN public.wheel_prizes.probability_weight IS 'Relative weight for prize selection probability. Higher = more likely. Default 100 means equal chance.';
