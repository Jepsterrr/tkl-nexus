import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  title: 'Om TKL NEXUS – Teknologkårens Arbetsmarknadsportal',
  description:
    'TKL NEXUS är Teknologkårens arbetsmarknadsgrupp vid Luleå tekniska universitet. Vi kopplar samman LTU-studenter med näringsliv och skapar möjligheter till exjobb, praktik och karriärstart i Norrbotten.',
  keywords: [
    'Teknologkåren LTU', 'arbetsmarknadsgrupp LTU', 'TKL NEXUS historia',
    'karriärorganisation Luleå', 'studenter näringsliv LTU', 'kontakt Teknologkåren',
  ],
  openGraph: {
    title: 'Om TKL NEXUS – Teknologkårens Arbetsmarknadsportal',
    description:
      'Vi kopplar samman LTU-studenter med näringsliv och skapar möjligheter till exjobb, praktik och karriärstart i Norrbotten.',
    url: 'https://tklnexus.se/about',
    siteName: 'TKL NEXUS',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://tklnexus.se/' },
      { '@type': 'ListItem', position: 2, name: 'Om oss', item: 'https://tklnexus.se/about' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <AboutContent />
    </>
  );
}
