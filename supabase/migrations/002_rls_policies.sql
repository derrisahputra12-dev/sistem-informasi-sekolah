-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get current user's school_id
-- ============================================

CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT school_id FROM users 
        WHERE id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SCHOOLS POLICIES
-- ============================================

-- Allow authenticated users to create a new school (for registration)
CREATE POLICY "Authenticated can create school" ON schools
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Users can view their own school
CREATE POLICY "Users can view own school" ON schools
    FOR SELECT USING (id = get_user_school_id());

-- Only super_admin can update school settings
CREATE POLICY "Super admin can update school" ON schools
    FOR UPDATE USING (
        id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    );

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Users can view users in their school
CREATE POLICY "Users can view school users" ON users
    FOR SELECT USING (school_id = get_user_school_id());

-- Allow users to insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Admin can insert other users in their school
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Admin can update users in their school
CREATE POLICY "Admin can update users" ON users
    FOR UPDATE USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- ============================================
-- MASTER DATA POLICIES (Same pattern for all)
-- ============================================

-- Academic Years
CREATE POLICY "View academic years" ON academic_years
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage academic years" ON academic_years
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Grade Levels
CREATE POLICY "View grade levels" ON grade_levels
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage grade levels" ON grade_levels
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Subjects
CREATE POLICY "View subjects" ON subjects
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage subjects" ON subjects
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Positions
CREATE POLICY "View positions" ON positions
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage positions" ON positions
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- ============================================
-- STUDENTS POLICIES
-- ============================================

-- All staff can view students
CREATE POLICY "View students" ON students
    FOR SELECT USING (school_id = get_user_school_id());

-- Admin and teachers can manage students
CREATE POLICY "Manage students" ON students
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'teacher'))
    );

-- Student Documents
CREATE POLICY "View student documents" ON student_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = student_documents.student_id 
            AND students.school_id = get_user_school_id()
        )
    );

CREATE POLICY "Manage student documents" ON student_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = student_documents.student_id 
            AND students.school_id = get_user_school_id()
        ) AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- ============================================
-- STAFF POLICIES
-- ============================================

CREATE POLICY "View staff" ON staff
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage staff" ON staff
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- ============================================
-- LETTERS POLICIES
-- ============================================

CREATE POLICY "View letters" ON letters
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage letters" ON letters
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'staff'))
    );
