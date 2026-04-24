import type { Metadata } from 'next';
import { EditCareerContent } from './EditCareerContent';

export const metadata: Metadata = { title: 'Redigera annons — TKL Admin' };

export default async function EditCareerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCareerContent id={id} />;
}
