import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/adminAuth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Server-side guard — route is invisible to non-admins. API routes have
  // their own requireAdmin() check as defense in depth.
  if (!session?.user?.id) redirect('/login?callbackUrl=/admin');
  if (!isAdminEmail(session.user.email)) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl font-bold text-navy">ReviewHub</Link>
            <span className="text-xs font-semibold bg-navy text-white px-2 py-0.5 rounded">ADMIN</span>
          </div>
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-navy transition-colors">
            Dashboard
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
