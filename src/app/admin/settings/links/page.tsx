import type { Metadata } from 'next';
import { LinksForm } from '@/components/admin/settings/LinksForm';

export const metadata: Metadata = { title: 'Länkar — TKL Admin' };

export default function LinksSettingsPage() {
  return <LinksForm />;
}
