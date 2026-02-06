import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendRejectionEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // 1. Find and update the pending registration
  const { data: registration, error: updateError } = await supabase
    .from('pending_registrations')
    .update({ status: 'rejected' })
    .eq('token', token)
    .eq('status', 'pending')
    .select()
    .single();

  if (updateError || !registration) {
    return NextResponse.json({ error: 'Permintaan tidak ditemukan atau sudah diproses' }, { status: 404 });
  }

  // 2. Notify user via email
  try {
    await sendRejectionEmail(registration.email, registration.school_name);
  } catch (emailError) {
    console.error('Failed to send rejection email notification:', emailError);
  }

  return new NextResponse('<h1>Pendaftaran Ditolak</h1><p>Permintaan pendaftaran telah ditolak.</p>', {
    headers: { 'Content-Type': 'text/html' },
  });
}
