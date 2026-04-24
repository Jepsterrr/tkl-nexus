import type { Metadata } from 'next';
import { DealsContent } from './DealsContent';

export const metadata: Metadata = { title: 'Deals — TKL Admin' };

export default function DealsPage() {
  return <DealsContent />;
}
