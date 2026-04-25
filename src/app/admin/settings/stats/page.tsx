import type { Metadata } from 'next';
import { StatsForm } from '@/components/admin/settings/StatsForm';

export const metadata: Metadata = { title: 'Statistik — TKL Admin' };

export default function StatsSettingsPage() {
  return <StatsForm />;
}
