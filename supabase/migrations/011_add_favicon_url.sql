-- Add favicon_url to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS favicon_url TEXT;
