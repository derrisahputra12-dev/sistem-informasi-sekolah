'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { uploadPhoto, deletePhoto } from './storage'

function toTitleCase(str: string) {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


export async function getStudents(status?: string) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  let query = supabase
    .from('students')
    .select('id, school_id, full_name, nisn, nis, gender, photo_url, status, admission_year, enrollment_type, created_at, updated_at')
    .eq('school_id', user.school_id)
  
  if (status) {
    query = query.eq('status', status)
  }

  const { data } = await query.order('full_name', { ascending: true })

  return data || []
}

export async function getGraduatingCount() {
  const user = await getCurrentUser()
  if (!user || !user.school_id) return 0

  const supabase = await createClient()
  
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startYear = month >= 7 ? year : year - 1
  
  let duration = 3
  const level = user.schools?.education_level
  if (level === 'sd') duration = 6
  
  const graduatingYearLimit = startYear - duration

  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', user.school_id)
    .eq('status', 'active')
    .lte('admission_year', graduatingYearLimit)

  return count || 0
}

export async function getStudent(id: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('students')
    .select('*, student_documents(*)')
    .eq('id', id)
    .eq('school_id', user.school_id)
    .single()

  return data
}

export async function createStudent(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  console.log('Creating student...')
  let photoUrl = null
  const photoFile = formData.get('photo') as File
  console.log('Photo file details:', photoFile ? { name: photoFile.name, size: photoFile.size, type: photoFile.type } : 'No photo')

  if (photoFile && photoFile.size > 0) {
    try {
      console.log('Uploading photo...')
      photoUrl = await uploadPhoto(photoFile, 'students')
      console.log('Photo uploaded, URL:', photoUrl)
    } catch (err) {
      console.error('Photo upload failed helper:', err)
    }
  }

  const { error } = await supabase.from('students').insert({
    school_id: user.school_id,
    nisn: formData.get('nisn') as string,
    nis: formData.get('nis') as string,
    full_name: toTitleCase(formData.get('full_name') as string),
    birth_date: formData.get('birth_date') as string,
    birth_place: formData.get('birth_place') as string,
    gender: formData.get('gender') as string,
    religion: formData.get('religion') as string,
    address: formData.get('address') as string || null,
    phone: formData.get('phone') as string || null,
    photo_url: photoUrl,
    admission_year: parseInt(formData.get('admission_year') as string),
    enrollment_type: formData.get('enrollment_type') as string || 'new',
    status: formData.get('enrollment_type') === 'alumni' ? 'graduated' : 'active',
    nik_siswa: formData.get('nik_siswa') as string || null,
    no_kip: formData.get('no_kip') as string || null,
    health_history: formData.get('health_history') as string || null,
    parent_type: formData.get('parent_type') as 'parent' | 'guardian' || 'parent',
    father_name: toTitleCase(formData.get('father_name') as string || ''),
    father_nik: formData.get('father_nik') as string || null,
    father_phone: formData.get('father_phone') as string || null,
    mother_name: toTitleCase(formData.get('mother_name') as string || ''),
    mother_nik: formData.get('mother_nik') as string || null,
    mother_phone: formData.get('mother_phone') as string || null,
    guardian_name: toTitleCase(formData.get('guardian_name') as string || ''),
    guardian_nik: formData.get('guardian_nik') as string || null,
    guardian_phone: formData.get('guardian_phone') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/siswa')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateStudent(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const updateData: any = {
    nisn: formData.get('nisn') as string,
    nis: formData.get('nis') as string,
    full_name: toTitleCase(formData.get('full_name') as string),
    birth_date: formData.get('birth_date') as string,
    birth_place: formData.get('birth_place') as string,
    gender: formData.get('gender') as string,
    religion: formData.get('religion') as string,
    address: formData.get('address') as string || null,
    phone: formData.get('phone') as string || null,
    status: formData.get('enrollment_type') === 'alumni' ? 'graduated' : formData.get('status') as string,
    admission_year: parseInt(formData.get('admission_year') as string),
    enrollment_type: formData.get('enrollment_type') as string || 'new',
    nik_siswa: formData.get('nik_siswa') as string || null,
    no_kip: formData.get('no_kip') as string || null,
    health_history: formData.get('health_history') as string || null,
    parent_type: formData.get('parent_type') as 'parent' | 'guardian',
    father_name: toTitleCase(formData.get('father_name') as string || ''),
    father_nik: formData.get('father_nik') as string || null,
    father_phone: formData.get('father_phone') as string || null,
    mother_name: toTitleCase(formData.get('mother_name') as string || ''),
    mother_nik: formData.get('mother_nik') as string || null,
    mother_phone: formData.get('mother_phone') as string || null,
    guardian_name: toTitleCase(formData.get('guardian_name') as string || ''),
    guardian_nik: formData.get('guardian_nik') as string || null,
    guardian_phone: formData.get('guardian_phone') as string || null,
  }

  const photoFile = formData.get('photo') as File
  const photoRemoved = formData.get('photo-removed') === 'true'
  console.log('Update photo file details:', photoFile ? { name: photoFile.name, size: photoFile.size, type: photoFile.type } : 'No photo', 'Removed:', photoRemoved)

  if (photoFile && photoFile.size > 0) {
    try {
      console.log('Updating photo...')
      updateData.photo_url = await uploadPhoto(photoFile, 'students')
      console.log('Photo updated, URL:', updateData.photo_url)
    } catch (err) {
      console.error('Photo upload failed during update:', err)
    }
  } else if (photoRemoved) {
    updateData.photo_url = null
  }

  // Handle old photo deletion if updated or removed
  if (updateData.photo_url !== undefined || photoRemoved) {
    const { data: oldStudent } = await supabase
      .from('students')
      .select('photo_url')
      .eq('id', id)
      .single()
    
    if (oldStudent?.photo_url && (updateData.photo_url || photoRemoved)) {
      await deletePhoto(oldStudent.photo_url)
    }
  }

  const { error } = await supabase
    .from('students')
    .update(updateData)
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/siswa')
  revalidatePath('/siswa/alumni')
  revalidatePath(`/siswa/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}


export async function deleteStudent(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  // Find photo to delete
  const { data: oldStudent } = await supabase
    .from('students')
    .select('photo_url')
    .eq('id', id)
    .single()

  if (oldStudent?.photo_url) {
    await deletePhoto(oldStudent.photo_url)
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/siswa')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function promoteStudentsToAlumni() {
  const user = await getCurrentUser()
  if (!user || !user.school_id) return { error: 'Unauthorized' }

  const supabase = await createClient()
  
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const startYear = month >= 7 ? year : year - 1
  
  let duration = 3
  const level = user.schools?.education_level
  if (level === 'sd') duration = 6
  
  const graduatingYearLimit = startYear - duration

  const { data, error } = await supabase
    .from('students')
    .update({ status: 'graduated' })
    .eq('school_id', user.school_id)
    .eq('status', 'active')
    .lte('admission_year', graduatingYearLimit)
    .select()

  if (error) return { error: error.message }

  revalidatePath('/siswa')
  revalidatePath('/siswa/alumni')
  return { success: true, count: data?.length || 0 }
}
