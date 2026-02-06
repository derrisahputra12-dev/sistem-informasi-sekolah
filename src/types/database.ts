export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionPlan = "free" | "pro" | "enterprise";
export type UserRole =
  | "system_admin"
  | "super_admin"
  | "admin"
  | "teacher"
  | "staff"
  | "student"
  | "parent";
export type StudentStatus = "active" | "graduated" | "transferred" | "dropped";
export type StaffStatus = "active" | "inactive" | "retired";
export type LetterType = "incoming" | "outgoing";
export type Gender = "male" | "female";

export interface FeatureFlags {
  ppdb: boolean;
  e_raport: boolean;
  attendance: boolean;
  finance: boolean;
  library: boolean;
  inventory: boolean;
  rpp: boolean;
  fingerprint: boolean;
}

// Core Tables
export interface School {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  education_level?: 'sd' | 'smp' | 'sma' | 'smk';
  address: string | null;
  phone: string | null;
  email: string | null;
  subscription_plan: SubscriptionPlan;
  feature_flags: FeatureFlags;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  school_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

// Master Data
export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface GradeLevel {
  id: string;
  school_id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
}

export interface Position {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Students
export interface Student {
  id: string;
  school_id: string;
  nisn: string;
  nis: string;
  full_name: string;
  birth_date: string;
  birth_place: string;
  gender: Gender;
  religion: string;
  address: string | null;
  phone: string | null;
  photo_url: string | null;
  status: StudentStatus;
  admission_year: number;
  enrollment_type: string;
  nik_siswa: string | null;
  no_kip: string | null;
  health_history: string | null;
  parent_type: 'parent' | 'guardian';
  father_name: string | null;
  father_nik: string | null;
  father_phone: string | null;
  mother_name: string | null;
  mother_nik: string | null;
  mother_phone: string | null;
  guardian_name: string | null;
  guardian_nik: string | null;
  guardian_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
}

// Staff
export interface Staff {
  id: string;
  school_id: string;
  nip: string | null;
  full_name: string;
  gender: Gender;
  position_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  photo_url: string | null;
  status: StaffStatus;
  join_date: string;
  created_at: string;
  updated_at: string;
}

// Curriculum
export interface ClassGroup {
  id: string;
  school_id: string;
  academic_year_id: string;
  grade_level_id: string;
  name: string;
  homeroom_teacher_id: string | null;
  capacity: number;
  created_at: string;
}

export interface StudentClassEnrollment {
  id: string;
  student_id: string;
  class_group_id: string;
  enrollment_date: string;
  status: string;
  created_at: string;
}

export interface TeachingAssignment {
  id: string;
  school_id: string;
  academic_year_id: string;
  teacher_id: string;
  subject_id: string;
  class_group_id: string;
  hours_per_week: number;
  created_at: string;
}

export interface Schedule {
  id: string;
  school_id: string;
  teaching_assignment_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  created_at: string;
}

// Attendance
export type AttendanceStatus = 'present' | 'sick' | 'permitted' | 'absent';
export type StaffAttendanceStatus = 'present' | 'sick' | 'permitted' | 'absent' | 'leave';

export interface StudentAttendance {
  id: string;
  school_id: string;
  student_id: string;
  class_group_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface StaffAttendance {
  id: string;
  school_id: string;
  staff_id: string;
  date: string;
  status: StaffAttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
}

// E-Raport
export interface CompetencyType {
  id: string;
  school_id: string;
  name: string;
  code: string;
  description: string | null;
  weight: number;
  created_at: string;
}

export interface StudentGrade {
  id: string;
  school_id: string;
  academic_year_id: string;
  semester: 1 | 2;
  student_id: string;
  subject_id: string;
  competency_type_id: string | null;
  score: number | null;
  predicate: string | null;
  description: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportCard {
  id: string;
  school_id: string;
  academic_year_id: string;
  semester: 1 | 2;
  student_id: string;
  class_group_id: string;
  total_sick_days: number;
  total_permitted_days: number;
  total_absent_days: number;
  class_rank: number | null;
  homeroom_notes: string | null;
  principal_notes: string | null;
  status: 'draft' | 'finalized' | 'printed';
  finalized_at: string | null;
  finalized_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Extracurricular {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  coach_id: string | null;
  schedule: string | null;
  created_at: string;
}

export interface StudentExtracurricular {
  id: string;
  student_id: string;
  extracurricular_id: string;
  academic_year_id: string;
  predicate: string | null;
  notes: string | null;
  created_at: string;
}

export interface Letter {
  id: string;
  school_id: string;
  letter_number: string;
  type: LetterType;
  subject: string;
  sender: string | null;
  recipient: string | null;
  date: string;
  file_url: string | null;
  status: string;
  created_at: string;
}

// Database helper types
export interface Database {
  public: {
    Tables: {
      schools: {
        Row: School;
        Insert: Omit<School, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<School, "id" | "created_at" | "updated_at">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
      };
      academic_years: {
        Row: AcademicYear;
        Insert: Omit<AcademicYear, "id" | "created_at">;
        Update: Partial<Omit<AcademicYear, "id" | "created_at">>;
      };
      grade_levels: {
        Row: GradeLevel;
        Insert: Omit<GradeLevel, "id" | "created_at">;
        Update: Partial<Omit<GradeLevel, "id" | "created_at">>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, "id" | "created_at">;
        Update: Partial<Omit<Subject, "id" | "created_at">>;
      };
      positions: {
        Row: Position;
        Insert: Omit<Position, "id" | "created_at">;
        Update: Partial<Omit<Position, "id" | "created_at">>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Student, "id" | "created_at" | "updated_at">>;
      };
      student_documents: {
        Row: StudentDocument;
        Insert: Omit<StudentDocument, "id" | "uploaded_at">;
        Update: Partial<Omit<StudentDocument, "id" | "uploaded_at">>;
      };
      staff: {
        Row: Staff;
        Insert: Omit<Staff, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Staff, "id" | "created_at" | "updated_at">>;
      };
      letters: {
        Row: Letter;
        Insert: Omit<Letter, "id" | "created_at">;
        Update: Partial<Omit<Letter, "id" | "created_at">>;
      };
    };
  };
}
