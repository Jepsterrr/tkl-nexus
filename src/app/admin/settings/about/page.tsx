import type { Metadata } from 'next';
import { AboutForm } from '@/components/admin/settings/AboutForm';

export const metadata: Metadata = { title: 'Om oss — TKL Admin' };

export default function AboutSettingsPage() {
  return <AboutForm />;
}
