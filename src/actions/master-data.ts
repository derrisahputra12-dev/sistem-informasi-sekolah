'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'

// ===========================
// ACADEMIC YEARS
// ===========================

export async function getAcademicYears() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('academic_years')
    .select('*')
    .eq('school_id', user.school_id)
    .order('start_date', { ascending: false })

  return data || []
}

export async function createAcademicYear(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('academic_years').insert({
    school_id: user.school_id,
    name: formData.get('name') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    is_active: formData.get('is_active') === 'true',
  })

  if (error) return { error: error.message }

  revalidatePath('/master/tahun-ajaran')
  return { success: true }
}

export async function deleteAcademicYear(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('academic_years')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/tahun-ajaran')
  return { success: true }
}

// ===========================
// GRADE LEVELS
// ===========================

export async function getGradeLevels() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('grade_levels')
    .select('*')
    .eq('school_id', user.school_id)
    .order('order', { ascending: true })

  return data || []
}

export async function createGradeLevel(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('grade_levels').insert({
    school_id: user.school_id,
    name: formData.get('name') as string,
    order: parseInt(formData.get('order') as string) || 0,
  })

  if (error) return { error: error.message }

  revalidatePath('/master/tingkat-kelas')
  return { success: true }
}

export async function deleteGradeLevel(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('grade_levels')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/tingkat-kelas')
  return { success: true }
}

export async function updateGradeLevel(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('grade_levels')
    .update({
      name: formData.get('name') as string,
      order: parseInt(formData.get('order') as string) || 0,
    })
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/tingkat-kelas')
  return { success: true }
}



// ===========================
// SUBJECTS
// ===========================

export async function getSubjects() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('school_id', user.school_id)
    .order('name', { ascending: true })

  return data || []
}

export async function createSubject(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('subjects').insert({
    school_id: user.school_id,
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    description: formData.get('description') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/master/mata-pelajaran')
  return { success: true }
}

export async function deleteSubject(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/mata-pelajaran')
  return { success: true }
}

// ===========================
// POSITIONS
// ===========================

export async function getPositions() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('positions')
    .select('*')
    .eq('school_id', user.school_id)
    .order('name', { ascending: true })

  return data || []
}

export async function createPosition(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('positions').insert({
    school_id: user.school_id,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/master/jabatan')
  return { success: true }
}

export async function deletePosition(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('positions')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/jabatan')
  return { success: true }
}

// ===========================
// VOCATIONAL PROGRAMS (JURUSAN)
// ===========================

export async function getVocationalPrograms() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('vocational_programs')
    .select('*')
    .eq('school_id', user.school_id)
    .order('name', { ascending: true })

  return data || []
}

export async function createVocationalProgram(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('vocational_programs').insert({
    school_id: user.school_id,
    name: formData.get('name') as string,
    code: formData.get('code') as string,
    description: formData.get('description') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/master/jurusan')
  return { success: true }
}

export async function updateVocationalProgram(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('vocational_programs')
    .update({
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string || null,
    })
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/jurusan')
  return { success: true }
}

export async function deleteVocationalProgram(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('vocational_programs')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/master/jurusan')
  return { success: true }
}

