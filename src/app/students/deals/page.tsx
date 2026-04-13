import type { Metadata } from 'next';
import { DealsContent } from './DealsContent';

export const metadata: Metadata = {
  title: 'Nexus Deals – TKL Nexus',
  description:
    'Exklusiva rabatter och förmåner för kårmedlemmar i Teknologkåren vid LTU. Se alla Nexus Deals.',
};

export default function DealsPage() {
  return <DealsContent />;
}
