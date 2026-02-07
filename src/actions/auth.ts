'use server'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendRegistrationRequestEmail, sendWaitingVerificationEmail, sendForgotPasswordEmail } from '@/lib/email'

export async function login(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: 'Konfigurasi aplikasi belum lengkap (API Keys missing). Silakan hubungi administrator.' }
  }

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }


  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'Email atau password Anda salah' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const adminSupabase = await createAdminClient()

  const emailRaw = formData.get('email') as string
  const schoolNameRaw = formData.get('schoolName') as string
  const fullNameRaw = formData.get('fullName') as string
  const educationLevel = formData.get('educationLevel') as string
  const phoneRaw = formData.get('phone') as string

  // 1. Basic Validation & Normalization
  if (!emailRaw || !schoolNameRaw || !fullNameRaw || !educationLevel || !phoneRaw) {
    return { error: 'Semua kolom wajib diisi' }
  }

  const email = emailRaw.trim().toLowerCase()
  const schoolName = schoolNameRaw.trim()
  const fullName = fullNameRaw.trim()
  const phone = phoneRaw.trim()

  // 2. Check if already registered in pending or active users
  const { data: existingPending } = await adminSupabase
    .from('pending_registrations')
    .select('id, status')
    .ilike('email', email)
    .eq('status', 'pending')
    .single()

  const { data: existingUser } = await adminSupabase
    .from('users')
    .select('id, email')
    .ilike('email', email)
    .single()

  if (existingPending || existingUser) {
    return { error: 'Email ini sudah terdaftar dalam sistem (sebagai pengguna aktif atau permintaan tertunda).' }
  }

  // 3. Insert into pending_registrations
  const { data: registration, error: regError } = await adminSupabase
    .from('pending_registrations')
    .insert({
      school_name: schoolName,
      full_name: fullName,
      email: email,
      phone: phone,
      education_level: educationLevel,
      status: 'pending'
    })
    .select()
    .single()

  if (regError) {
    console.error('Registration error:', regError)
    return { error: regError.message }
  }

  // 4. Send Emails (Non-blocking)
  try {
    await sendRegistrationRequestEmail({
      schoolName: registration.school_name,
      fullName: registration.full_name,
      email: registration.email,
      token: registration.token
    });
    
    await sendWaitingVerificationEmail(registration.email);
  } catch (emailError) {
    console.error('Failed to send notification emails:', emailError);
  }

  return { success: true, registration }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Wrapped with React cache() to dedupe calls within a single request
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*, schools(id, name, slug, favicon_url, logo_url, education_level)')
    .eq('id', user.id)
    .single()

  return profile
})
export async function updateInitialPassword(newPassword: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesi tidak ditemukan' }

  // 1. Update Auth Password
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Clear must_change_password flag
  const { error: dbError } = await supabase
    .from('users')
    .update({ must_change_password: false })
    .eq('id', user.id)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function forgotPassword(formData: FormData) {
  const adminSupabase = await createAdminClient()
  const email = formData.get('email') as string
  
  // Detect current host from request to handle port mismatches (e.g., 3000 vs 3001)
  const host = (await headers()).get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const appUrl = `${protocol}://${host}`

  // Generate a recovery link using Admin SDK
  const { data, error } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  })

  if (error) {
    return { error: error.message }
  }

  // Instead of using action_link (which goes to Supabase first),
  // construct our own URL with the hashed_token to go directly to our confirm route
  // This allows our server to call verifyOtp with the token_hash
  const resetLink = `${appUrl}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/reset-password`

  // Send the email manually using our configured provider (Mailjet/Resend)
  try {
    await sendForgotPasswordEmail(email, resetLink, appUrl);
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Gagal mengirim email reset password' }
  }
}



export async function verifyOtpForReset(email: string, token: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery'
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // 1. Server-side validation (Double check)
  if (password !== confirmPassword) {
    return { error: 'Password tidak cocok' }
  }

  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: 'Password tidak memenuhi kriteria keamanan (min 8 karakter, huruf & angka)' }
  }

  // 2. Update Password
  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  // 3. Security Hardening: Sign out from all other devices
  // This ensures if the reset was due to a compromised account, 
  // the attacker is kicked out immediately.
  await supabase.auth.signOut({ scope: 'others' })

  revalidatePath('/', 'layout')
  return { success: true }
}

