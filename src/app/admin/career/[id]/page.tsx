import type { Metadata } from 'next';
import { EditCareerContent } from './EditCareerContent';

export const dynamic = 'force-static';
export const metadata: Metadata = { title: 'Redigera annons — TKL Admin' };

export default function EditCareerPage() {
  return <EditCareerContent />;
}
