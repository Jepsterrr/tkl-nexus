import type { Metadata } from 'next';
import { EditDealContent } from './EditDealContent';

export const dynamic = 'force-static';
export const metadata: Metadata = { title: 'Redigera deal — TKL Admin' };

export default function EditDealPage() {
  return <EditDealContent />;
}
