import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'Om TKL Nexus – Teknologkårens Arbetsmarknadsportal | LTU',
  description:
    'TKL Nexus är Teknologkårens arbetsmarknadsgrupp vid Luleå tekniska universitet. Vi kopplar samman LTU-studenter med näringsliv och skapar möjligheter till exjobb, praktik och karriärstart i Norrbotten.',
  keywords: [
    'Teknologkåren LTU', 'arbetsmarknadsgrupp LTU', 'TKL Nexus historia',
    'karriärorganisation Luleå', 'studenter näringsliv LTU', 'kontakt Teknologkåren',
  ],
  openGraph: {
    title: 'Om TKL Nexus – Teknologkårens Arbetsmarknadsportal',
    description:
      'Vi kopplar samman LTU-studenter med näringsliv och skapar möjligheter till exjobb, praktik och karriärstart i Norrbotten.',
    url: 'https://tklnexus.se/about',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
