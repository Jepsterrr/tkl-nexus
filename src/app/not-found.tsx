import type { Metadata } from 'next';
import { NotFoundContent } from './NotFoundContent';

export const metadata: Metadata = {
  title: 'Sidan kunde inte hittas',
  robots: { index: false },
};

export default function NotFound() {
  return <NotFoundContent />;
}
