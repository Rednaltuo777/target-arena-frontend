-- Lägg till fullständigt namn i users-tabellen
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
