import type { Metadata } from 'next';
import { HomeContent } from './HomeContent';

export const metadata: Metadata = {
  title: 'TKL Nexus – Karriärportal för LTU-studenter & Företag',
  description:
    'TKL Nexus kopplar LTU-studenter och företag via exjobb, praktik, events och förmåner. Teknologkårens officiella arbetsmarknadsportal vid LTU.',
  openGraph: {
    title: 'TKL Nexus – Karriärportal för LTU-studenter & Företag',
    description:
      'TKL Nexus kopplar LTU-studenter och företag via exjobb, praktik, events och förmåner. Teknologkårens officiella arbetsmarknadsportal vid LTU.',
    url: 'https://tklnexus.se',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TKL Nexus' }],
  },
};

export default function HomePage() {
  return <HomeContent />;
}
