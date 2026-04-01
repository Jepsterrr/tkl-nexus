import type { Metadata } from 'next';
import { CorporateContent } from './CorporateContent';

export const metadata: Metadata = {
  title: 'För Företag',
  description:
    'Nå hela Luleå tekniska universitets studentkår via Teknologkårens arbetsmarknadsportal. Publicera exjobb, boka event och stärk ert employer brand.',
  openGraph: {
    title: 'För Företag – TKL Nexus',
    description: 'Nå 1600+ ingenjörsstudenter i Luleå via Teknologkåren.',
    url: 'https://tkl-nexus.se/corporate',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function CorporatePage() {
  return <CorporateContent />;
}
