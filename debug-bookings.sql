-- Kör denna SQL i Supabase SQL Editor för att felsöka

-- 1. Hitta kristers_adept user_id
SELECT id, user_id, email, role, approved 
FROM users 
WHERE email = 'kristers_adept@hotmail.com';

-- 2. Kolla alla bokningar för denna användare (byt ut USER_ID med rätt värde från query 1)
SELECT * 
FROM bookings 
WHERE user_id = 'PASTE_USER_ID_HERE'
ORDER BY start_time DESC;

-- 3. Kolla constraints på bookings-tabellen
SELECT con.conname, 
       pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'bookings';

-- 4. Ta bort eventuell problematisk constraint (kör BARA om nödvändigt)
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings_per_user;

-- 5. Skapa en bättre constraint som tillåter flera användare samma tid
-- Men inte samma användare att boka överlappande tider
-- ALTER TABLE bookings ADD CONSTRAINT no_overlapping_bookings_per_user 
-- EXCLUDE USING gist (
--   user_id WITH =,
--   tstzrange(start_time, end_time) WITH &&
-- );
