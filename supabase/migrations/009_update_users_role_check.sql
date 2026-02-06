-- Update users_role_check constraint to include 'system_admin'
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('system_admin', 'super_admin', 'admin', 'teacher', 'staff', 'student', 'parent'));
