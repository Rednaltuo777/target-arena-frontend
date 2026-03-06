-- KOMPLETT FIX FÖR BOKNINGSPROBLEM
-- Kör detta i Supabase SQL Editor (kör rad för rad om nödvändigt)

-- 1. Ta bort den problematiska constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;

-- 2. Se om det finns fler constraints
SELECT conname FROM pg_constraint WHERE conrelid = 'bookings'::regclass;

-- 3. Skapa rätt constraint som endast blockerar om SAMMA användare bokar överlappande tider
-- (Detta kräver btree_gist extension)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 4. Lägg till korrekt constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS no_overlapping_bookings_per_user;

ALTER TABLE bookings 
ADD CONSTRAINT no_overlapping_bookings_per_user 
EXCLUDE USING gist (
  user_id WITH =,
  tstzrange(start_time, end_time) WITH &&
);

-- 5. Verifiera att det fungerar - prova att lägga till en testbokning
-- (byt ut UUID nedan med en riktig user_id från users-tabellen)
-- INSERT INTO bookings (user_id, start_time, end_time)
-- VALUES (
--   'PASTE_UUID_HERE',
--   '2026-01-30 15:00:00+00',
--   '2026-01-30 16:30:00+00'
-- );
