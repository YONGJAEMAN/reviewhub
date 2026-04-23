import { Resend } from 'resend';
import { requireEnv } from '@/lib/env';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(requireEnv('RESEND_API_KEY'));
  }
  return _resend;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const result = await getResend().emails.send({
      from: 'ReviewHub <noreply@reviewhub.app>',
      ...params,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
