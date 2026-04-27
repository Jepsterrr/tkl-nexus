import type { Metadata } from 'next';
import { AdminsContent } from '@/components/admin/admins/AdminsContent';

export const metadata: Metadata = { title: 'Adminhantering — TKL Admin' };

export default function AdminsPage() {
  return <AdminsContent />;
}
