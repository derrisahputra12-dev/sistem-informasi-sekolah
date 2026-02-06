'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

// ===========================
// CLASS GROUPS (ROMBEL)
// ===========================

export async function getClassGroups(academicYearId?: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from('class_groups')
    .select(`
      id, name, capacity, 
      grade_levels(id, name),
      academic_years(id, name),
      staff:homeroom_teacher_id(id, full_name)
    `)
    .eq('school_id', user.school_id)
    .order('name', { ascending: true })

  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId)
  }

  const { data } = await query
  return data || []
}

export async function getClassGroup(id: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('class_groups')
    .select(`
      *,
      grade_levels(name),
      academic_years(name),
      staff:homeroom_teacher_id(full_name),
      student_class_enrollments(
        id,
        students(id, full_name, nisn, photo_url)
      )
    `)
    .eq('id', id)
    .eq('school_id', user.school_id)
    .single()

  return data
}

export async function createClassGroup(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('class_groups').insert({
    school_id: user.school_id,
    academic_year_id: formData.get('academic_year_id') as string,
    grade_level_id: formData.get('grade_level_id') as string,
    name: formData.get('name') as string,
    homeroom_teacher_id: formData.get('homeroom_teacher_id') as string || null,
    capacity: parseInt(formData.get('capacity') as string) || 30,
  })

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/rombel')
  return { success: true }
}

export async function deleteClassGroup(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('class_groups')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/rombel')
  return { success: true }
}

// ===========================
// STUDENT ENROLLMENTS
// ===========================

export async function addStudentToClass(studentId: string, classGroupId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('student_class_enrollments').insert({
    student_id: studentId,
    class_group_id: classGroupId,
  })

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/rombel')
  return { success: true }
}

export async function removeStudentFromClass(enrollmentId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('student_class_enrollments')
    .delete()
    .eq('id', enrollmentId)

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/rombel')
  return { success: true }
}

// ===========================
// TEACHING ASSIGNMENTS
// ===========================

export async function getTeachingAssignments(academicYearId?: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from('teaching_assignments')
    .select(`
      id, hours_per_week,
      staff:teacher_id(id, full_name),
      subjects(id, name),
      class_groups(id, name)
    `)
    .eq('school_id', user.school_id)

  if (academicYearId) {
    query = query.eq('academic_year_id', academicYearId)
  }

  const { data } = await query
  return data || []
}

export async function createTeachingAssignment(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('teaching_assignments').insert({
    school_id: user.school_id,
    academic_year_id: formData.get('academic_year_id') as string,
    teacher_id: formData.get('teacher_id') as string,
    subject_id: formData.get('subject_id') as string,
    class_group_id: formData.get('class_group_id') as string,
    hours_per_week: parseInt(formData.get('hours_per_week') as string) || 2,
  })

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/pengajar')
  return { success: true }
}

export async function deleteTeachingAssignment(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('teaching_assignments')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/pengajar')
  return { success: true }
}

// ===========================
// SCHEDULES
// ===========================

export async function getSchedules(classGroupId?: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from('schedules')
    .select(`
      *,
      teaching_assignments(
        subjects(name),
        staff:teacher_id(full_name),
        class_groups(name)
      )
    `)
    .eq('school_id', user.school_id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (classGroupId) {
    query = query.eq('teaching_assignments.class_group_id', classGroupId)
  }

  const { data } = await query
  return data || []
}

export async function createSchedule(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('schedules').insert({
    school_id: user.school_id,
    teaching_assignment_id: formData.get('teaching_assignment_id') as string,
    day_of_week: parseInt(formData.get('day_of_week') as string),
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    room: formData.get('room') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/jadwal')
  return { success: true }
}

export async function deleteSchedule(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/kurikulum/jadwal')
  return { success: true }
}
