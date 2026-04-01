import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ReferralLandingPage({ params }: Props) {
  const { code } = await params;

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });

  if (!referrer) {
    redirect('/');
  }

  const cookieStore = await cookies();
  cookieStore.set('ref', code, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });

  redirect('/signup');
}
