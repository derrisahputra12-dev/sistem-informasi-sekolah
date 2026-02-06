-- ============================================
-- FIX: RLS POLICIES FOR REGISTRATION
-- Run this in Supabase SQL Editor to fix registration
-- ============================================

-- Allow authenticated users to insert their first school (for registration)
CREATE POLICY "Authenticated can create school" ON schools
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to insert their own user profile (for registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.uid());
