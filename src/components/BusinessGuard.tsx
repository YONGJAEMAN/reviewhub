'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessContext } from '@/components/BusinessContext';

export default function BusinessGuard({ children }: { children: React.ReactNode }) {
  const { businesses, loading } = useBusinessContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && businesses.length === 0) {
      router.replace('/onboarding');
    }
  }, [loading, businesses, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return null;
  }

  return <>{children}</>;
}
