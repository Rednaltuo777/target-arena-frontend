-- Kör detta i Supabase SQL Editor för att fixa kristers_adept's bokningsproblem

-- 1. Se alla bokningar för kristers_adept
SELECT b.*, u.email 
FROM bookings b
JOIN users u ON b.user_id = u.user_id
WHERE u.email = 'kristers_adept@hotmail.com';

-- 2. Radera ALLA gamla bokningar för kristers_adept (kör detta om du hittar några)
DELETE FROM bookings 
WHERE user_id IN (
  SELECT user_id FROM users WHERE email = 'kristers_adept@hotmail.com'
);

-- 3. Verifiera att de är borta
SELECT COUNT(*) as antal_bokningar
FROM bookings b
JOIN users u ON b.user_id = u.user_id
WHERE u.email = 'kristers_adept@hotmail.com';
