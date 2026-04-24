import type { Metadata } from 'next';
import { CareersContent } from './CareersContent';

export const metadata: Metadata = { title: 'Jobb & Exjobb — TKL Admin' };

export default function CareerAdminPage() {
  return <CareersContent />;
}
