import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
