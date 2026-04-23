import type { Metadata } from 'next';
import { AuthGuard } from '@/components/admin/AuthGuard';

export const metadata: Metadata = {
  title: 'TKL Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
