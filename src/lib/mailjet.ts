import Mailjet from 'node-mailjet';

const mailjet = process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET
  ? Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_API_SECRET
    )
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  fromEmail = process.env.MAILJET_SENDER_EMAIL || 'noreply@resend.dev',
  fromName = 'Sistem Informasi Sekolah',
}: SendEmailParams) {
  if (!mailjet) {
    console.warn('Mailjet is not configured (missing API Key/Secret). Skipping email.');
    return { success: false, error: 'Mailjet not configured' };
  }

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    return { success: true, data: result.body };
  } catch (error: any) {
    console.error('Mailjet Error:', error.statusCode, error.message);
    return { success: false, error: error.message };
  }
}
