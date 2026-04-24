import type { Metadata } from 'next';
import { CareerForm } from '@/components/admin/career/CareerForm';

export const metadata: Metadata = { title: 'Ny annons — TKL Admin' };

export default function NewCareerPage() {
  return (
    <div className="p-6 sm:p-8">
      <CareerForm mode="create" />
    </div>
  );
}
