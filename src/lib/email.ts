import { Resend } from 'resend';
import { sendEmail as sendMailjet } from './mailjet';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');
const FROM_EMAIL = process.env.MAILJET_SENDER_EMAIL || 'noreply@resend.dev';
const FROM_NAME = 'Sistem Informasi Sekolah';

export async function sendRegistrationRequestEmail({
  schoolName,
  fullName,
  email,
  token,
}: {
  schoolName: string;
  fullName: string;
  email: string;
  token: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const approveUrl = `${appUrl}/api/registrations/approve?token=${token}`;
  const rejectUrl = `${appUrl}/api/registrations/reject?token=${token}`;

  const subject = `Permintaan Pendaftaran Sekolah Baru: ${schoolName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Permintaan Pendaftaran Sekolah Baru</h2>
      <p>Halo Admin, ada permintaan pendaftaran sekolah baru dengan detail sbb:</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <ul style="list-style: none; padding: 0;">
          <li><strong>Nama Sekolah:</strong> ${schoolName}</li>
          <li><strong>Nama Lengkap:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
      </div>
      <div style="margin-top: 20px; display: flex; gap: 10px;">
        <a href="${approveUrl}" style="background-color: #00b91f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Terima & Kirim Password</a>
        <a href="${rejectUrl}" style="background-color: #e91f1f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-left: 10px;">Tolak Permintaan</a>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #eee; pt: 10px;">
        Klik tombol di atas untuk memproses permintaan ini secara otomatis. Jika tombol tidak berfungsi, silakan login ke Dashboard Developer.
      </p>
    </div>
  `;

  // Try Mailjet first
  const { success: mjSuccess } = await sendMailjet({
    to: 'derrisahputra12@gmail.com',
    subject,
    html,
  });

  if (mjSuccess) return;

  // Fallback to Resend
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: 'derrisahputra12@gmail.com',
    subject,
    html,
  });

  if (error) {
    console.error('Failed to send registration request email (Resend):', error);
  }
}

export async function sendWaitingVerificationEmail(userEmail: string) {
  const subject = 'Pendaftaran Sekolah - Sedang Diverifikasi';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Pendaftaran Berhasil Terkirim</h2>
      <p>Halo, terima kasih telah mendaftarkan sekolah Anda.</p>
      <p>Permintaan Anda sedang ditinjau oleh tim administrator kami. Mohon tunggu verifikasi selanjutnya.</p>
      <p>Jika disetujui, Anda akan menerima email balasan berisi password untuk masuk ke sistem.</p>
      <p style="margin-top: 20px;">Salam,<br/>Tim Sistem Informasi Sekolah</p>
    </div>
  `;

  // Try Mailjet
  const { success: mjSuccess } = await sendMailjet({
    to: userEmail,
    subject,
    html,
  });

  if (mjSuccess) return;

  // Fallback to Resend
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: userEmail,
    subject,
    html,
  });

  if (error) {
    console.error('Failed to send waiting verification email (Resend):', error);
  }
}

export async function sendApprovalEmail(userEmail: string, password: string) {
  const subject = 'Pendaftaran Sekolah Disetujui';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #00b91f;">Pendaftaran Sekolah Disetujui!</h2>
      <p>Selamat, permintaan pendaftaran sekolah Anda telah disetujui.</p>
      <p>Berikut adalah detail akun Admin Sekolah Anda:</p>
      <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <ul style="list-style: none; padding: 0;">
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Password:</strong> <code style="font-weight: bold; font-size: 1.1em;">${password}</code></li>
        </ul>
      </div>
      <p>Silakan login di: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" style="color: #3b82f6; text-decoration: underline;">Halaman Login</a></p>
      <p style="background: #fffbeb; padding: 10px; border-radius: 6px; border-left: 4px solid #f59e0b; font-size: 13px;">
        <strong>Penting:</strong> Segera ganti password Anda setelah berhasil masuk demi keamanan data sekolah.
      </p>
      <p style="margin-top: 20px;">Salam,<br/>Tim Sistem Informasi Sekolah</p>
    </div>
  `;

  // Try Mailjet
  const { success: mjSuccess } = await sendMailjet({
    to: userEmail,
    subject,
    html,
  });

  if (mjSuccess) return;

  // Fallback to Resend
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: userEmail,
    subject,
    html,
  });

  if (error) {
    console.error('Failed to send approval email (Resend):', error);
    throw new Error(`Gagal mengirim email approval: ${error.message}`);
  }
}

export async function sendRejectionEmail(userEmail: string, schoolName: string) {
  const subject = 'Pendaftaran Sekolah Belum Disetujui';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e91f1f;">Pendaftaran Sekolah</h2>
      <p>Halo, mohon maaf permintaan pendaftaran sekolah <strong>${schoolName}</strong> belum dapat kami setujui saat ini.</p>
      <p>Kemungkinan data yang Anda masukkan kurang lengkap atau tidak valid. Silakan coba mendaftar ulang dengan data yang benar.</p>
      <p style="margin-top: 20px;">Salam,<br/>Tim Sistem Informasi Sekolah</p>
    </div>
  `;

  // Try Mailjet
  const { success: mjSuccess } = await sendMailjet({
    to: userEmail,
    subject,
    html,
  });

  if (mjSuccess) return;

  // Fallback to Resend
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: userEmail,
    subject,
    html,
  });

  if (error) {
    console.error('Failed to send rejection email (Resend):', error);
  }
}

export async function sendForgotPasswordEmail(userEmail: string, resetLink: string, providedAppUrl?: string) {
  // Use the Supabase action_link directly - it handles verification securely
  const subject = 'Atur Ulang Kata Sandi Anda';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Permintaan Atur Ulang Kata Sandi</h2>
      <p>Halo,</p>
      <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Atur Ulang Kata Sandi</a>
      </div>
      
      <p>Tautan ini akan kedaluwarsa dalam 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
      <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; font-size: 13px; color: #666;">
        Jika tombol tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br/>
        <span style="word-break: break-all; color: #3b82f6;">${resetLink}</span>
      </p>
      <p style="margin-top: 25px;">Salam,<br/>Tim Sistem Informasi Sekolah</p>
    </div>
  `;




  // Try Mailjet
  const { success: mjSuccess } = await sendMailjet({
    to: userEmail,
    subject,
    html,
  });

  if (mjSuccess) return;

  // Fallback to Resend
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: userEmail,
    subject,
    html,
  });

  if (error) {
    console.error('Failed to send forgot password email (Resend):', error);
    throw new Error(`Gagal mengirim email reset password: ${error.message}`);
  }
}

