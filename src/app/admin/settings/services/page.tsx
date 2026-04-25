import type { Metadata } from 'next';
import { ServicesForm } from '@/components/admin/settings/ServicesForm';

export const metadata: Metadata = { title: 'Tjänster — TKL Admin' };

export default function ServicesSettingsPage() {
  return <ServicesForm />;
}
