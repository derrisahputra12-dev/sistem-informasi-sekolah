'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { uploadPhoto, deletePhoto } from './storage'

function toTitleCase(str: string) {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


// ===========================
// STAFF
// ===========================

export async function getStaff() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('staff')
    .select('id, school_id, full_name, nip, gender, email, phone, address, status, join_date, position_id, photo_url, created_at, updated_at, positions(name)')
    .eq('school_id', user.school_id)
    .order('full_name', { ascending: true })

  return (data || []).map((item: any) => ({
    ...item,
    positions: Array.isArray(item.positions) ? item.positions[0] : item.positions,
  }))
}

export async function getStaffMember(id: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('staff')
    .select('*, positions(name)')
    .eq('id', id)
    .eq('school_id', user.school_id)
    .single()

  return data
}

export async function createStaff(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  let photoUrl = null
  const photoFile = formData.get('photo') as File
  if (photoFile && photoFile.size > 0) {
    try {
      photoUrl = await uploadPhoto(photoFile, 'staff')
    } catch (err) {
      console.error('Photo upload failed:', err)
    }
  }

  const { error } = await supabase.from('staff').insert({
    school_id: user.school_id,
    nip: formData.get('nip') as string || null,
    full_name: toTitleCase(formData.get('full_name') as string),
    gender: formData.get('gender') as any,
    position_id: formData.get('position_id') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    address: formData.get('address') as string || null,
    join_date: formData.get('join_date') as string,
    photo_url: photoUrl,
    status: 'active',
  })

  if (error) return { error: error.message }

  revalidatePath('/pegawai')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateStaff(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const updateData: any = {
    nip: formData.get('nip') as string || null,
    full_name: toTitleCase(formData.get('full_name') as string),
    gender: formData.get('gender') as any,
    position_id: formData.get('position_id') as string || null,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    address: formData.get('address') as string || null,
    join_date: formData.get('join_date') as string,
    status: formData.get('status') as string,
  }

  const photoFile = formData.get('photo') as File
  const photoRemoved = formData.get('photo-removed') === 'true'

  if (photoFile && photoFile.size > 0) {
    try {
      updateData.photo_url = await uploadPhoto(photoFile, 'staff')
    } catch (err) {
      console.error('Photo upload failed:', err)
    }
  } else if (photoRemoved) {
    updateData.photo_url = null
  }

  // Handle old photo deletion if updated or removed
  if (updateData.photo_url !== undefined || photoRemoved) {
    const { data: oldStaff } = await supabase
      .from('staff')
      .select('photo_url')
      .eq('id', id)
      .single()
    
    if (oldStaff?.photo_url && (updateData.photo_url || photoRemoved)) {
      await deletePhoto(oldStaff.photo_url)
    }
  }

  const { error } = await supabase
    .from('staff')
    .update(updateData)
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/pegawai')
  revalidatePath(`/pegawai/${id}`)
  return { success: true }
}


export async function deleteStaff(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  // Find photo to delete
  const { data: oldStaff } = await supabase
    .from('staff')
    .select('photo_url')
    .eq('id', id)
    .single()

  if (oldStaff?.photo_url) {
    await deletePhoto(oldStaff.photo_url)
  }

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/pegawai')
  revalidatePath('/dashboard')
  return { success: true }
}

// ===========================
// LETTERS
// ===========================

export async function getLetters() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('letters')
    .select('*')
    .eq('school_id', user.school_id)
    .order('date', { ascending: false })

  return data || []
}

export async function createLetter(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase.from('letters').insert({
    school_id: user.school_id,
    letter_number: formData.get('letter_number') as string,
    type: formData.get('type') as string,
    subject: formData.get('subject') as string,
    sender: formData.get('sender') as string || null,
    recipient: formData.get('recipient') as string || null,
    date: formData.get('date') as string,
    status: 'pending',
  })

  if (error) return { error: error.message }

  revalidatePath('/surat')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteLetter(id: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('letters')
    .delete()
    .eq('id', id)
    .eq('school_id', user.school_id)

  if (error) return { error: error.message }

  revalidatePath('/surat')
  revalidatePath('/dashboard')
  return { success: true }
}
