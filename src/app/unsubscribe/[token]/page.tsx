import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';
import Link from 'next/link';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ uid?: string }>;
}

export default async function UnsubscribePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { uid } = await searchParams;

  if (!uid || !verifyUnsubscribeToken(uid, token)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-text-primary mb-2">유효하지 않은 링크</h1>
          <p className="text-sm text-text-secondary mb-6">
            이 수신 거부 링크가 유효하지 않거나 만료되었습니다.
          </p>
          <Link
            href="/"
            className="text-sm text-accent-blue hover:underline"
          >
            홈으로 돌아가기
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
          수신 거부가 완료되었습니다
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          마케팅 이메일이 더 이상 발송되지 않습니다.<br />
          서비스 알림(새 리뷰, 주간 요약)은 Settings에서 별도로 관리할 수 있습니다.
        </p>
        <Link
          href="/"
          className="text-sm text-accent-blue hover:underline"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
