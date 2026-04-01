import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import OfflineBanner from '@/components/layout/OfflineBanner';
import BusinessProvider from '@/components/BusinessContext';
import FeedbackButton from '@/components/FeedbackButton';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BusinessProvider>
      <OfflineBanner />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[240px] flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
          <FeedbackButton />
        </div>
      </div>
      <MobileTabBar />
    </BusinessProvider>
  );
}
