-- Lägg till slot_id i messages-tabellen
ALTER TABLE messages ADD COLUMN IF NOT EXISTS slot_id BIGINT;

-- Skapa index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_messages_slot_id ON messages(slot_id);

-- Skapa tabell för lässtatus per användare och tid
CREATE TABLE IF NOT EXISTS chat_reads (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  slot_id BIGINT NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, slot_id)
);

-- Index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_chat_reads_user_slot ON chat_reads(user_id, slot_id);
