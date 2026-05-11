export const dynamic = 'force-static';

export const metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-3">
          You&apos;re offline
        </h1>
        <p className="text-text-secondary leading-relaxed">
          ReviewHub needs an internet connection to fetch your reviews.
          Reconnect and reload this page to continue.
        </p>
      </div>
    </main>
  );
}
