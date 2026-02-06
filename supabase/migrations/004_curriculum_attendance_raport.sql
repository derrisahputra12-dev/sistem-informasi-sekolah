-- ============================================
-- PHASE 2 & 3: CURRICULUM, ATTENDANCE, E-RAPORT
-- ============================================

-- ============================================
-- CURRICULUM TABLES
-- ============================================

-- Rombongan Belajar (Class Groups)
CREATE TABLE class_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    grade_level_id UUID NOT NULL REFERENCES grade_levels(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "X IPA 1", "VII A"
    homeroom_teacher_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    capacity INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student class enrollment
CREATE TABLE student_class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_group_id UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, moved, graduated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_group_id)
);

-- Teaching assignments
CREATE TABLE teaching_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_group_id UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    hours_per_week INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(teacher_id, subject_id, class_group_id, academic_year_id)
);

-- Class schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teaching_assignment_id UUID NOT NULL REFERENCES teaching_assignments(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ATTENDANCE TABLES
-- ============================================

-- Student attendance
CREATE TABLE student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_group_id UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- present, sick, permitted, absent
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Staff attendance
CREATE TABLE staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- present, sick, permitted, absent, leave
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

-- ============================================
-- E-RAPORT TABLES
-- ============================================

-- Competency types for K13/Merdeka curriculum
CREATE TABLE competency_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- KI-1, KI-2, KI-3, KI-4, or P5 domains
    code VARCHAR(20) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code)
);

-- Student grades
CREATE TABLE student_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    competency_type_id UUID REFERENCES competency_types(id) ON DELETE SET NULL,
    score DECIMAL(5,2),
    predicate VARCHAR(5), -- A, B, C, D, E
    description TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report cards (Raport)
CREATE TABLE report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_group_id UUID NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
    total_sick_days INTEGER DEFAULT 0,
    total_permitted_days INTEGER DEFAULT 0,
    total_absent_days INTEGER DEFAULT 0,
    class_rank INTEGER,
    homeroom_notes TEXT,
    principal_notes TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, finalized, printed
    finalized_at TIMESTAMPTZ,
    finalized_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, academic_year_id, semester)
);

-- Extracurricular activities
CREATE TABLE extracurriculars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coach_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    schedule VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student extracurricular participation
CREATE TABLE student_extracurriculars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    extracurricular_id UUID NOT NULL REFERENCES extracurriculars(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    predicate VARCHAR(50), -- Sangat Baik, Baik, Cukup
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, extracurricular_id, academic_year_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_class_groups_school ON class_groups(school_id);
CREATE INDEX idx_class_groups_academic_year ON class_groups(academic_year_id);
CREATE INDEX idx_student_enrollments_class ON student_class_enrollments(class_group_id);
CREATE INDEX idx_teaching_assignments_teacher ON teaching_assignments(teacher_id);
CREATE INDEX idx_schedules_day ON schedules(day_of_week);
CREATE INDEX idx_student_attendance_date ON student_attendance(date);
CREATE INDEX idx_student_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance(date);
CREATE INDEX idx_student_grades_student ON student_grades(student_id);
CREATE INDEX idx_student_grades_subject ON student_grades(subject_id);
CREATE INDEX idx_report_cards_student ON report_cards(student_id);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teaching_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurriculars ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_extracurriculars ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Class Groups
CREATE POLICY "View class groups" ON class_groups
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage class groups" ON class_groups
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Student Class Enrollments
CREATE POLICY "View student enrollments" ON student_class_enrollments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM class_groups WHERE id = class_group_id AND school_id = get_user_school_id())
    );

CREATE POLICY "Manage student enrollments" ON student_class_enrollments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM class_groups WHERE id = class_group_id AND school_id = get_user_school_id()) AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Teaching Assignments
CREATE POLICY "View teaching assignments" ON teaching_assignments
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage teaching assignments" ON teaching_assignments
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Schedules
CREATE POLICY "View schedules" ON schedules
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage schedules" ON schedules
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Student Attendance
CREATE POLICY "View student attendance" ON student_attendance
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage student attendance" ON student_attendance
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'teacher'))
    );

-- Staff Attendance
CREATE POLICY "View staff attendance" ON staff_attendance
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage staff attendance" ON staff_attendance
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Competency Types
CREATE POLICY "View competency types" ON competency_types
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage competency types" ON competency_types
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Student Grades
CREATE POLICY "View student grades" ON student_grades
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage student grades" ON student_grades
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'teacher'))
    );

-- Report Cards
CREATE POLICY "View report cards" ON report_cards
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage report cards" ON report_cards
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'teacher'))
    );

-- Extracurriculars
CREATE POLICY "View extracurriculars" ON extracurriculars
    FOR SELECT USING (school_id = get_user_school_id());

CREATE POLICY "Manage extracurriculars" ON extracurriculars
    FOR ALL USING (
        school_id = get_user_school_id() AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
    );

-- Student Extracurriculars
CREATE POLICY "View student extracurriculars" ON student_extracurriculars
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM extracurriculars WHERE id = extracurricular_id AND school_id = get_user_school_id())
    );

CREATE POLICY "Manage student extracurriculars" ON student_extracurriculars
    FOR ALL USING (
        EXISTS (SELECT 1 FROM extracurriculars WHERE id = extracurricular_id AND school_id = get_user_school_id()) AND
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'teacher'))
    );
