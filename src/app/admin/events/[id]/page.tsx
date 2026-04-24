import type { Metadata } from 'next';
import { EditEventContent } from './EditEventContent';

export const metadata: Metadata = { title: 'Redigera event — TKL Admin' };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditEventContent id={id} />;
}
