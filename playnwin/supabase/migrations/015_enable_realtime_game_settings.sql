-- Enable Realtime for game_settings table
-- This allows clients to subscribe to changes via websocket

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE game_settings;
