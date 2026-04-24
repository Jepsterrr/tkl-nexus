import type { Metadata } from 'next';
import { EditDealContent } from './EditDealContent';

export const metadata: Metadata = { title: 'Redigera deal — TKL Admin' };

export default async function EditDealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditDealContent id={id} />;
}
