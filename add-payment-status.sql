-- Lägg till betalningsstatus i bookings-tabellen
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;

-- Lägg till kolumn för banornummer (1-9)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lane_number INTEGER;

-- Skapa index för snabbare queries
CREATE INDEX IF NOT EXISTS idx_bookings_paid ON bookings(paid);
CREATE INDEX IF NOT EXISTS idx_bookings_lane ON bookings(lane_number);
