import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EditProductContent } from './EditProductContent';

export const metadata: Metadata = { title: 'Redigera produkt — TKL Admin' };

export default function EditProductPage() {
  return (
    <Suspense>
      <EditProductContent />
    </Suspense>
  );
}
