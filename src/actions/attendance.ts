'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

// ===========================
// STUDENT ATTENDANCE
// ===========================

export async function getStudentAttendance(date: string, classGroupId?: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from('student_attendance')
    .select(`
      *,
      students(id, full_name, nisn, photo_url)
    `)
    .eq('school_id', user.school_id)
    .eq('date', date)

  if (classGroupId) {
    query = query.eq('class_group_id', classGroupId)
  }

  const { data } = await query
  return data || []
}

export async function getStudentAttendanceSummary(studentId: string, startDate: string, endDate: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('student_attendance')
    .select('status')
    .eq('school_id', user.school_id)
    .eq('student_id', studentId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (!data) return null

  return {
    present: data.filter(a => a.status === 'present').length,
    sick: data.filter(a => a.status === 'sick').length,
    permitted: data.filter(a => a.status === 'permitted').length,
    absent: data.filter(a => a.status === 'absent').length,
    total: data.length,
  }
}

export async function recordStudentAttendance(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('student_attendance').upsert({
    school_id: user.school_id,
    student_id: formData.get('student_id') as string,
    class_group_id: formData.get('class_group_id') as string,
    date: formData.get('date') as string,
    status: formData.get('status') as string,
    check_in_time: formData.get('check_in_time') as string || null,
    notes: formData.get('notes') as string || null,
    recorded_by: user.id,
  }, { onConflict: 'student_id,date' })

  if (error) return { error: error.message }

  revalidatePath('/presensi/siswa')
  return { success: true }
}

export async function bulkRecordStudentAttendance(
  classGroupId: string,
  date: string,
  records: Array<{ student_id: string; status: string; notes?: string }>
) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const attendanceRecords = records.map(record => ({
    school_id: user.school_id,
    student_id: record.student_id,
    class_group_id: classGroupId,
    date: date,
    status: record.status,
    notes: record.notes || null,
    recorded_by: user.id,
  }))

  const { error } = await supabase
    .from('student_attendance')
    .upsert(attendanceRecords, { onConflict: 'student_id,date' })

  if (error) return { error: error.message }

  revalidatePath('/presensi/siswa')
  return { success: true }
}

// ===========================
// STAFF ATTENDANCE
// ===========================

export async function getStaffAttendance(date: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('staff_attendance')
    .select(`
      *,
      staff(id, full_name, nip, photo_url)
    `)
    .eq('school_id', user.school_id)
    .eq('date', date)

  return data || []
}

export async function recordStaffAttendance(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('staff_attendance').upsert({
    school_id: user.school_id,
    staff_id: formData.get('staff_id') as string,
    date: formData.get('date') as string,
    status: formData.get('status') as string,
    check_in_time: formData.get('check_in_time') as string || null,
    check_out_time: formData.get('check_out_time') as string || null,
    notes: formData.get('notes') as string || null,
  }, { onConflict: 'staff_id,date' })

  if (error) return { error: error.message }

  revalidatePath('/presensi/pegawai')
  return { success: true }
}

export async function getAttendanceReport(startDate: string, endDate: string, type: 'student' | 'staff') {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const table = type === 'student' ? 'student_attendance' : 'staff_attendance'
  
  const { data } = await supabase
    .from(table)
    .select('*')
    .eq('school_id', user.school_id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  return data || []
}
