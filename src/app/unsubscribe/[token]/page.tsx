import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ uid?: string }>;
}

export default async function UnsubscribePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { uid } = await searchParams;
  const t = await getTranslations('unsubscribe');

  if (!uid || !verifyUnsubscribeToken(uid, token)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-text-primary mb-2">{t('invalidLink.title')}</h1>
          <p className="text-sm text-text-secondary mb-6">
            {t('invalidLink.message')}
          </p>
          <Link
            href="/"
            className="text-sm text-accent-blue hover:underline"
          >
            {t('invalidLink.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  await prisma.user.update({
    where: { id: uid },
    data: { marketingOptOut: true },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl font-bold text-text-primary mb-2">
          {t('success.title')}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {t('success.message')}<br />
          {t('success.settingsNote')}
        </p>
        <Link
          href="/"
          className="text-sm text-accent-blue hover:underline"
        >
          {t('success.backToHome')}
        </Link>
      </div>
    </div>
  );
}
