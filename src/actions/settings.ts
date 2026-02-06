'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { uploadPhoto } from './storage'

export async function updateSchoolProfile(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const schoolId = user.school_id

  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  // Only update fields if they are present in formData
  const fields = ['name', 'address', 'phone', 'email']
  fields.forEach(field => {
    const value = formData.get(field)
    if (value !== null) {
      updateData[field] = value as string
    }
  })

  const logoFile = formData.get('logo') as File
  const isLogoRemoved = formData.get('logo-removed') === 'true'

  // Handle Logo & Favicon Sync
  if (logoFile && logoFile.size > 0) {
    try {
      const logoUrl = await uploadPhoto(logoFile, 'branding')
      updateData.logo_url = logoUrl
      // Synchronize favicon with logo as requested
      updateData.favicon_url = logoUrl
    } catch (err) {
      console.error('Logo upload failed:', err)
      return { error: 'Gagal mengunggah logo' }
    }
  } else if (isLogoRemoved) {
    updateData.logo_url = null
    updateData.favicon_url = null
  }

  const { error } = await supabase
    .from('schools')
    .update(updateData)
    .eq('id', schoolId)

  if (error) {
    console.error('Update school error:', error)
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
  return { success: true }
}
