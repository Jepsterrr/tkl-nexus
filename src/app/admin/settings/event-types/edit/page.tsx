import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EditEventTypeContent } from './EditEventTypeContent';

export const metadata: Metadata = { title: 'Redigera eventtyp — TKL Admin' };

export default function EditEventTypePage() {
  return (
    <Suspense>
      <EditEventTypeContent />
    </Suspense>
  );
}
