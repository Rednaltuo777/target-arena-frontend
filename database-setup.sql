-- SQL för att skapa tabeller i Supabase

-- 1. Skapa users-tabell
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_id UUID,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  approved BOOLEAN DEFAULT FALSE,
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Skapa available_slots-tabell  
CREATE TABLE IF NOT EXISTS available_slots (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_lanes INTEGER DEFAULT 9,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_available_slots_date ON available_slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
