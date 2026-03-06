-- Lägg till aktivitetstyp i available_slots-tabellen
ALTER TABLE available_slots ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'Precision C' CHECK (activity_type IN ('Precision C', 'Precision C+Grov'));

-- Uppdatera befintliga rader
UPDATE available_slots SET activity_type = 'Precision C' WHERE activity_type IS NULL;
