import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyContent } from './VerifyContent';

export const metadata: Metadata = {
  title: 'Verifiera inbjudan — TKL Admin',
  robots: { index: false, follow: false },
};

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}