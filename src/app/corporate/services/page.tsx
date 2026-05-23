import type { Metadata } from 'next';
import { ServicesContent } from './ServicesContent';

export const metadata: Metadata = {
  alternates: { canonical: '/corporate/services' },
  title: 'Produktportfölj — TKL NEXUS Tjänster & Aktiviteter',
  description:
    'Aktiviteter, tjänster och marknadsföring för företag som vill nå LTU:s 1 600+ studenter via Teknologkåren.',
  openGraph: {
    title: 'Produktportfölj — TKL NEXUS',
    description: 'Se hela utbudet av aktiviteter, tjänster och marknadsföring.',
    url: 'https://tklnexus.se/corporate/services',
    siteName: 'TKL NEXUS',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function ServicesPage() {
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://tklnexus.se/' },
      { '@type': 'ListItem', position: 2, name: 'För företag', item: 'https://tklnexus.se/corporate' },
      { '@type': 'ListItem', position: 3, name: 'Tjänster', item: 'https://tklnexus.se/corporate/services' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <ServicesContent />
    </>
  );
}
