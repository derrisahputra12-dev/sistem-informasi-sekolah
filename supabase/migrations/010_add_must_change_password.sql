-- Add must_change_password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Update existing super_admins created via registration to true if they haven't logged in much 
-- (optional, but good for consistency)
UPDATE users SET must_change_password = TRUE WHERE role = 'super_admin';
