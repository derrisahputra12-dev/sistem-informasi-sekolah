'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import type { UserRole } from '@/types/database'

export async function getUsers() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'super_admin') return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('school_id', user.school_id)
    .order('full_name', { ascending: true })

  return data || []
}

export async function createUser(formData: FormData) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'super_admin') return { error: 'Unauthorized' }

  const adminSupabase = await createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as UserRole

  // Create auth user using Admin Client
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // Create user profile
  const { error: userError } = await adminSupabase
    .from('users')
    .insert({
      id: authData.user.id,
      school_id: admin.school_id,
      email: email,
      full_name: fullName,
      role: role,
      is_active: true,
      must_change_password: true,
    })

  if (userError) {
    // Cleanup auth user if profile creation fails
    await adminSupabase.auth.admin.deleteUser(authData.user.id)
    return { error: userError.message }
  }

  revalidatePath('/users')
  return { success: true }
}

export async function updateUserRole(userId: string, role: UserRole) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'super_admin') return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .eq('school_id', admin.school_id)

  if (error) return { error: error.message }

  revalidatePath('/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const admin = await getCurrentUser()
  if (!admin || admin.role !== 'super_admin') return { error: 'Unauthorized' }
  
  if (userId === admin.id) return { error: 'You cannot delete yourself' }

  const adminSupabase = await createAdminClient()

  // Delete from auth (will trigger cascaded delete if RLS/DB configured, but manually handled for safety)
  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  // User record in 'users' table should be deleted via foreign key cascade in Supabase by default
  // but we can explicitly check if needed.

  revalidatePath('/users')
  return { success: true }
}
