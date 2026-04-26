import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EditCareerContent } from './EditCareerContent';

export const metadata: Metadata = { title: 'Redigera annons — TKL Admin' };

export default function EditCareerPage() {
  return (
    <Suspense>
      <EditCareerContent />
    </Suspense>
  );
}
