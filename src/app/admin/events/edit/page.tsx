import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EditEventContent } from './EditEventContent';

export const metadata: Metadata = { title: 'Redigera event — TKL Admin' };

export default function EditEventPage() {
  return (
    <Suspense>
      <EditEventContent />
    </Suspense>
  );
}
