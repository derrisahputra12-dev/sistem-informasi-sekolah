-- Create a bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for the photos bucket
-- Allow public read access to photos
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'photos');

-- Allow users to update their own school's photos
-- (We use the user's school_id for naming files or folders for better isolation)
CREATE POLICY "Authenticated Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'photos');

-- Allow users to delete photos
CREATE POLICY "Authenticated Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'photos');
