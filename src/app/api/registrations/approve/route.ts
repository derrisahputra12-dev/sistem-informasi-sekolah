import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendApprovalEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // 1. Find the pending registration
  const { data: registration, error: findError } = await supabase
    .from('pending_registrations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (findError || !registration) {
    return NextResponse.json({ error: 'Permintaan tidak ditemukan atau sudah diproses' }, { status: 404 });
  }

  // 2. Generate random password
  const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase() + '!';

  try {
    // 3. Create or Get Auth User
    let userId: string;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: registration.email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: registration.full_name }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        let existing = users.find(u => u.email?.toLowerCase() === registration.email.toLowerCase());
        
        if (!existing) {
          throw new Error('Email sudah terdaftar tetapi tidak dapat ditemukan untuk sinkronisasi.');
        }
        
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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: registration.school_name,
        slug: slug,
        education_level: registration.education_level,
      })
      .select()
      .single();

    if (schoolError) throw new Error(schoolError.message);

    // 5. Upsert User Profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        school_id: school.id,
        email: registration.email,
        full_name: registration.full_name,
        role: 'super_admin',
        is_active: true,
        must_change_password: true,
      }, { onConflict: 'id' });

    if (profileError) throw new Error(profileError.message);

    // 6. Update pending registration status
    await supabase
      .from('pending_registrations')
      .update({ status: 'approved' })
      .eq('id', registration.id);

    // 7. Prepare WhatsApp Details for User
    let userPhone = registration.phone.replace(/[^0-9]/g, '');
    if (userPhone.startsWith('0')) {
      userPhone = '62' + userPhone.slice(1);
    } else if (userPhone.startsWith('8')) {
      userPhone = '62' + userPhone;
    }
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
    const waUserMsg = encodeURIComponent(
      `*SELAMAT! PENDAFTARAN SEKOLAH DISETUJUI*\n\n` +
      `Halo *${registration.full_name}*,\n` +
      `Pendaftaran sekolah *${registration.school_name}* telah disetujui.\n\n` +
      `Berikut adalah detail akun Admin Anda:\n` +
      `- *Email:* ${registration.email}\n` +
      `- *Password:* ${password}\n\n` +
      `Silakan login di sini:\n` +
      `${loginUrl}\n\n` +
      `_Penting: Segera ganti password Anda setelah login demi keamanan._`
    );
    const waUserLink = `https://wa.me/${userPhone}?text=${waUserMsg}`;

    // 8. Send Approval Email (Non-blocking)
    try {
      await sendApprovalEmail(registration.email, password);
    } catch (emailError) {
      console.error('Failed to send approval email (api-route):', emailError);
    }

    return new NextResponse(`
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen font-sans">
          <div class="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Disetujui!</h1>
            <p class="text-slate-600 mb-8 px-4">Akun administrator untuk <strong>${registration.school_name}</strong> telah berhasil dibuat.</p>
            
            <div class="space-y-4">
              <a href="${waUserLink}" class="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105">
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.022-.014-.463-.232-.53-.255-.067-.023-.116-.034-.165.044-.049.078-.191.232-.234.281-.043.049-.086.055-.153.022-.24-.12-.843-.311-1.604-.988-.592-.527-.993-1.176-1.11-1.373-.116-.197-.012-.303.087-.402.09-.089.197-.232.296-.347.1-.115.133-.197.197-.328.065-.132.033-.247-.017-.347-.05-.1-.165-.398-.226-.546-.06-.145-.123-.125-.168-.125-.044-.001-.094-.001-.145-.001s-.132.019-.201.093c-.069.074-.264.258-.264.63s.27.731.308.782c.038.051.523.801 1.267 1.123.177.077.315.124.423.158.178.057.34.048.468.029.143-.021.463-.189.529-.372.066-.183.066-.341.046-.372-.02-.03-.075-.05-.153-.082zm.126-12.382c-4.991 0-9.052 4.062-9.052 9.052 0 1.594.417 3.149 1.208 4.516l-1.284 4.69 4.8-.125c1.295.706 2.76 1.079 4.253 1.079 4.991 0 9.052-4.061 9.052-9.052 0-4.991-4.061-9.052-9.052-9.052zm0 16.634c-1.408 0-2.788-.379-3.991-1.096l-.286-.17-2.964.077.786-2.87-.186-.296c-.787-1.251-1.202-2.7-1.202-4.186 0-3.957 3.22-7.177 7.177-7.177 3.957 0 7.178 3.22 7.178 7.177 0 3.958-3.219 7.178-7.178 7.178z"/>
                </svg>
                Kirim Detail via WhatsApp
              </a>
              
              <a href="/dashboard" class="block w-full py-4 text-slate-500 font-medium hover:text-slate-800 transition-colors">
                Kembali ke Dashboard
              </a>
            </div>

            <p class="mt-8 text-xs text-slate-400">Pastikan Anda mengklik tombol di atas untuk mengirim password ke user secara manual via WhatsApp.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err: any) {
    console.error('Approval failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
