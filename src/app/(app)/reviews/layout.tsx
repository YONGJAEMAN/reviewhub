import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Feed',
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
