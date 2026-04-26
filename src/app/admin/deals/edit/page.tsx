import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EditDealContent } from './EditDealContent';

export const metadata: Metadata = { title: 'Redigera deal — TKL Admin' };

export default function EditDealPage() {
  return (
    <Suspense>
      <EditDealContent />
    </Suspense>
  );
}
