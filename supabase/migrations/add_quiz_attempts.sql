-- Add quiz_attempts column to christmas_players table
ALTER TABLE christmas_players 
ADD COLUMN IF NOT EXISTS quiz_attempts INTEGER DEFAULT 0;

-- Update existing players to have 1 attempt if they completed the quiz
UPDATE christmas_players 
SET quiz_attempts = 1 
WHERE completed_at IS NOT NULL AND quiz_attempts IS NULL;

-- Set default to 0 for players who haven't completed
UPDATE christmas_players 
SET quiz_attempts = 0 
WHERE completed_at IS NULL AND quiz_attempts IS NULL;
