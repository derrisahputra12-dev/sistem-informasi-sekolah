'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

// ===========================
// STUDENT GRADES
// ===========================

export async function getStudentGrades(
  studentId: string,
  academicYearId: string,
  semester: number
) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('student_grades')
    .select(`
      *,
      subjects(name, code),
      competency_types(name, code)
    `)
    .eq('school_id', user.school_id)
    .eq('student_id', studentId)
    .eq('academic_year_id', academicYearId)
    .eq('semester', semester)
    .order('subjects(name)', { ascending: true })

  return (data || []).map((item: any) => ({
    ...item,
    subjects: Array.isArray(item.subjects) ? item.subjects[0] : item.subjects,
    competency_types: Array.isArray(item.competency_types) ? item.competency_types[0] : item.competency_types,
  }))
}

export async function getClassGrades(
  classGroupId: string,
  subjectId: string,
  academicYearId: string,
  semester: number
) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  
  // Get students in the class
  const { data: enrollments } = await supabase
    .from('student_class_enrollments')
    .select(`
      students(
        id, full_name, nisn,
        student_grades(score, predicate, description)
      )
    `)
    .eq('class_group_id', classGroupId)
    .eq('status', 'active')

  return enrollments || []
}

export async function saveStudentGrade(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const gradeId = formData.get('id') as string

  const gradeData = {
    school_id: user.school_id,
    academic_year_id: formData.get('academic_year_id') as string,
    semester: parseInt(formData.get('semester') as string),
    student_id: formData.get('student_id') as string,
    subject_id: formData.get('subject_id') as string,
    competency_type_id: formData.get('competency_type_id') as string || null,
    score: parseFloat(formData.get('score') as string) || null,
    predicate: formData.get('predicate') as string || null,
    description: formData.get('description') as string || null,
    recorded_by: user.id,
  }

  if (gradeId) {
    const { error } = await supabase
      .from('student_grades')
      .update(gradeData)
      .eq('id', gradeId)
      .eq('school_id', user.school_id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('student_grades').insert(gradeData)
    if (error) return { error: error.message }
  }

  revalidatePath('/raport')
  return { success: true }
}

export async function bulkSaveGrades(
  grades: Array<{
    student_id: string
    subject_id: string
    academic_year_id: string
    semester: number
    score: number
    predicate?: string
    description?: string
  }>
) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const gradeRecords = grades.map(grade => ({
    school_id: user.school_id,
    academic_year_id: grade.academic_year_id,
    semester: grade.semester,
    student_id: grade.student_id,
    subject_id: grade.subject_id,
    score: grade.score,
    predicate: grade.predicate || calculatePredicate(grade.score),
    description: grade.description || null,
    recorded_by: user.id,
  }))

  const { error } = await supabase.from('student_grades').upsert(gradeRecords)

  if (error) return { error: error.message }

  revalidatePath('/raport')
  return { success: true }
}

function calculatePredicate(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'E'
}

// ===========================
// REPORT CARDS
// ===========================

export async function getReportCards(classGroupId: string, academicYearId: string, semester: number) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const query = supabase
    .from('report_cards')
    .select(`
      id, semester, status,
      students(id, full_name, nisn, photo_url),
      class_groups(id, name)
    `)
    .eq('school_id', user.school_id)
    .eq('class_group_id', classGroupId)
    .eq('academic_year_id', academicYearId)
    .eq('semester', semester)
    .order('students(full_name)', { ascending: true })

  const { data } = await query
  return (data || []).map((item: any) => ({
    ...item,
    students: Array.isArray(item.students) ? item.students[0] : item.students,
    class_groups: Array.isArray(item.class_groups) ? item.class_groups[0] : item.class_groups,
  }))
}

export async function getReportCard(
  studentId: string,
  academicYearId: string,
  semester: number
) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('report_cards')
    .select(`
      *,
      students(*, student_class_enrollments(class_groups(name, homeroom_teacher_id, staff:homeroom_teacher_id(full_name)))),
      academic_years(name)
    `)
    .eq('school_id', user.school_id)
    .eq('student_id', studentId)
    .eq('academic_year_id', academicYearId)
    .eq('semester', semester)
    .single()

  return data
}

export async function generateReportCard(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const studentId = formData.get('student_id') as string
  const academicYearId = formData.get('academic_year_id') as string
  const semester = parseInt(formData.get('semester') as string)
  const classGroupId = formData.get('class_group_id') as string

  // Calculate attendance summary
  const { data: attendance } = await supabase
    .from('student_attendance')
    .select('status')
    .eq('student_id', studentId)
    .eq('school_id', user.school_id)

  const total_sick_days = attendance?.filter(a => a.status === 'sick').length || 0
  const total_permitted_days = attendance?.filter(a => a.status === 'permitted').length || 0
  const total_absent_days = attendance?.filter(a => a.status === 'absent').length || 0

  const { error } = await supabase.from('report_cards').upsert({
    school_id: user.school_id,
    academic_year_id: academicYearId,
    semester: semester,
    student_id: studentId,
    class_group_id: classGroupId,
    total_sick_days,
    total_permitted_days,
    total_absent_days,
    homeroom_notes: formData.get('homeroom_notes') as string || null,
    status: 'draft',
  }, { onConflict: 'student_id,academic_year_id,semester' })

  if (error) return { error: error.message }

  revalidatePath('/raport')
  return { success: true }
}

export async function finalizeReportCard(reportCardId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('report_cards')
    .update({
      status: 'finalized',
      finalized_at: new Date().toISOString(),
      finalized_by: user.id,
    })
    .eq('id', reportCardId)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/raport')
  return { success: true }
}

// ===========================
// EXTRACURRICULARS
// ===========================

export async function getExtracurriculars() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const query = supabase
    .from('extracurriculars')
    .select(`
      id, name, description, coach_id, schedule,
      staff:coach_id(id, full_name)
    `)
    .eq('school_id', user.school_id)
    .order('name', { ascending: true })

  const { data } = await query
  return (data || []).map((item: any) => ({
    ...item,
    staff: Array.isArray(item.staff) ? item.staff[0] : item.staff,
  }))
}

export async function createExtracurricular(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('extracurriculars').insert({
    school_id: user.school_id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    coach_id: formData.get('coach_id') as string || null,
    schedule: formData.get('schedule') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/raport/ekstrakurikuler')
  return { success: true }
}

export async function deleteExtracurricular(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('extracurriculars')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/raport/ekstrakurikuler')
  return { success: true }
}
