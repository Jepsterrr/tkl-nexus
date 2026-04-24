import type { Metadata } from 'next';
import { DealForm } from '@/components/admin/deals/DealForm';

export const metadata: Metadata = { title: 'Ny deal — TKL Admin' };

export default function NewDealPage() {
  return (
    <div className="p-6 sm:p-8">
      <DealForm mode="create" />
    </div>
  );
}
