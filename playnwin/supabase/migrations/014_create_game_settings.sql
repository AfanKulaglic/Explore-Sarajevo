-- Create game_settings table to control which games are active
CREATE TABLE IF NOT EXISTS game_settings (
  id SERIAL PRIMARY KEY,
  game_key VARCHAR(50) UNIQUE NOT NULL,
  game_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default games
INSERT INTO game_settings (game_key, game_name, is_active, sort_order) VALUES
  ('wheel', 'Wheel of Fortune', true, 1),
  ('memory', 'Memory Match', true, 2),
  ('puzzle', 'Puzzle Challenge', true, 3),
  ('wordsearch', 'Word Search', true, 4),
  ('pacman', 'Pac-Man', true, 5),
  ('scratch', 'Scratch Cards', false, 6)
ON CONFLICT (game_key) DO NOTHING;

-- Enable RLS
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read game settings
CREATE POLICY "Anyone can read game settings"
  ON game_settings FOR SELECT
  USING (true);

-- Only service role can update (admin API)
CREATE POLICY "Service role can update game settings"
  ON game_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);
