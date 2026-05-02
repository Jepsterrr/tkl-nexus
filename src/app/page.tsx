import type { Metadata } from 'next';
import { HomeContent } from './HomeContent';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: 'TKL NEXUS – Karriärportal för LTU-studenter & Företag',
  description:
    'TKL NEXUS kopplar LTU-studenter och företag via exjobb, praktik, events och förmåner. Teknologkårens officiella arbetsmarknadsportal vid LTU.',
  openGraph: {
    title: 'TKL Nexus – Karriärportal för LTU-studenter & Företag',
    description:
      'TKL NEXUS kopplar LTU-studenter och företag via exjobb, praktik, events och förmåner. Teknologkårens officiella arbetsmarknadsportal vid LTU.',
    url: 'https://tklnexus.se',
    siteName: 'TKL NEXUS',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TKL NEXUS' }],
  },
};

export default function HomePage() {
  return <HomeContent />;
}
