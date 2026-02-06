-- Refine parent/guardian fields in students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS parent_type VARCHAR(20) DEFAULT 'parent' CHECK (parent_type IN ('parent', 'guardian')),
ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_nik VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_nik VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_nik VARCHAR(20),
ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20);

-- Drop old fields that are no longer used
ALTER TABLE students DROP COLUMN IF EXISTS parent_name;
ALTER TABLE students DROP COLUMN IF EXISTS parent_phone;
