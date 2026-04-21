import type { Metadata } from 'next';
import { CorporateContent } from './CorporateContent';

export const metadata: Metadata = {
  alternates: { canonical: '/corporate' },
  title: 'Rekrytera LTU-studenter & Annonsera Exjobb',
  description:
    'Nå 1 600+ ingenjörsstudenter vid Luleå tekniska universitet. Publicera exjobb och praktikplatser, boka events och stärk ert employer brand via Teknologkårens arbetsmarknadsportal.',
  keywords: [
    'rekrytera ingenjörer LTU', 'annonsera exjobb Luleå', 'employer branding LTU',
    'samarbeta Teknologkåren', 'praktikplatser LTU', 'ingenjörsstudenter Luleå',
    'event LTU', 'arbetsmarknadsmässa Luleå', 'rekrytering civilingenjör',
  ],
  openGraph: {
    title: 'Rekrytera LTU-studenter & Annonsera Exjobb',
    description:
      'Nå 1 600+ ingenjörsstudenter vid LTU. Publicera exjobb, boka event och stärk ert employer brand via Teknologkåren.',
    url: 'https://tklnexus.se/corporate',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function CorporatePage() {
  return <CorporateContent />;
}
