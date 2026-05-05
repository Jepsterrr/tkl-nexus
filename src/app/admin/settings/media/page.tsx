import type { Metadata } from 'next';
import { MediaForm } from '@/components/admin/settings/MediaForm';

export const metadata: Metadata = { title: 'Bilder — TKL Admin' };

export default function MediaSettingsPage() {
  return <MediaForm />;
}
