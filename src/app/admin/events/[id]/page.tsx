import type { Metadata } from 'next';
import { EditEventContent } from './EditEventContent';

export const dynamic = 'force-static';
export const metadata: Metadata = { title: 'Redigera event — TKL Admin' };

export default function EditEventPage() {
  return <EditEventContent />;
}
