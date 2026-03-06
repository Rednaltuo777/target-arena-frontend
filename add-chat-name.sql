-- Lägg till chat_name kolumn i users-tabellen
ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_name TEXT;

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_users_chat_name ON users(chat_name);
