'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'

export async function getPendingRegistrations() {
  try {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('Error fetching registrations:', error)
      return []
    }
    
    return data || []
  } catch (err) {
    console.error('getPendingRegistrations failed:', err)
    return []
  }
}

export async function approveRegistration(id: string) {
  const supabase = await createAdminClient()
  
  // 1. Get registration details
  const { data: registration, error: fetchError } = await supabase
    .from('pending_registrations')
    .select('*')
    .eq('id', id)
    .single()
    
  if (fetchError || !registration) {
    return { error: 'Registrasi tidak ditemukan' }
  }
  
  if (registration.status !== 'pending') {
    return { error: 'Registrasi sudah diproses' }
  }

  // 2. Generate password
  const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase() + '!';
  const email = registration.email.trim().toLowerCase();

  try {
    // 3. Create or Get Auth User
    let userId: string;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: registration.full_name }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.status === 422) {
        // Find existing user efficiently
        // Note: listUsers() returns 50 by default. For most cases this is enough, 
        // but let's be more robust by checking if they are there.
        const { data: { users } } = await supabase.auth.admin.listUsers();
        let existing = users.find(u => u.email?.toLowerCase() === email);
        
        // If not found in first 50, we might need to search specifically
        // In the interest of clean code, we'll try to find them by ID if we can 
        // but since we don't have it, listUsers is our best bet in Admin.
        
        if (!existing) {
          throw new Error(`Email ${email} sudah terdaftar di sistem Autentikasi tetapi tidak ditemukan dalam daftar sinkronisasi. Silakan hapus user ini secara manual di Dashboard Supabase.`);
        }
        
        // Update password for local dev/testing convenience
        await supabase.auth.admin.updateUserById(existing.id, { password });
        userId = existing.id;
      } else {
        throw new Error(authError.message);
      }
    } else {
      userId = authData.user.id;
    }

    // 4. Create School
    const slug = registration.school_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: registration.school_name.trim(),
        slug: slug,
        education_level: registration.education_level,
      })
      .select()
      .single();

    if (schoolError) throw new Error(schoolError.message);

    // 5. Upsert User Profile (handles existing profiles)
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        school_id: school.id,
        email: email,
        full_name: registration.full_name.trim(),
        role: 'super_admin',
        is_active: true,
        must_change_password: true,
      }, { onConflict: 'id' });

    if (profileError) throw new Error(profileError.message);

    // 6. Update pending registration status
    await supabase
      .from('pending_registrations')
      .update({ status: 'approved' })
      .eq('id', id);

    // 7. Send Approval Email (Non-blocking)
    try {
      await sendApprovalEmail(email, password);
    } catch (emailError) {
      console.error('Failed to send approval email (system action):', emailError);
    }

    revalidatePath('/system/registrations')
    
    return { 
      success: true, 
      data: {
        email: email,
        password: password,
        phone: registration.phone,
        fullName: registration.full_name,
        schoolName: registration.school_name
      }
    }
  } catch (err: any) {
    console.error('Approval failed:', err);
    return { error: err.message }
  }
}

export async function rejectRegistration(id: string) {
  try {
    const supabase = await createAdminClient()
    
    // 1. Update status to rejected
    const { data: registration, error: updateError } = await supabase
      .from('pending_registrations')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('email, school_name')
      .single();

    if (updateError) {
      return { error: updateError.message }
    }

    if (registration) {
      try {
        await sendRejectionEmail(registration.email, registration.school_name);
      } catch (emailError) {
        console.error('Failed to send rejection email (system action):', emailError);
      }
    }
    
    revalidatePath('/system/registrations')
    return { success: true }
  } catch (err: any) {
    console.error('Rejection failed:', err);
    return { error: err.message || 'Gagal menolak registrasi' }
  }
}
