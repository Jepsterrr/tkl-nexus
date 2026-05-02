import type { Metadata } from 'next';
import { PostContent } from './PostContent';

export const metadata: Metadata = {
  alternates: { canonical: '/corporate/post' },
  title: 'Annonsera hos TKL NEXUS — Publicera Jobb, Event & Deals',
  description:
    'Skicka in er jobbannons, event eller deal till Teknologkårens arbetsmarknadsportal. Vi publicerar manuellt och återkommer så snart vi kan.',
  keywords: [
    'annonsera exjobb LTU', 'publicera event LTU', 'nexus deals företag',
    'samarbeta Teknologkåren', 'rekrytera studenter Luleå',
  ],
  openGraph: {
    title: 'Annonsera hos TKL NEXUS — Publicera Jobb, Event & Deals',
    description: 'Publicera jobb, event och deals till LTU:s 1 600+ studenter.',
    url: 'https://tklnexus.se/corporate/post',
    siteName: 'TKL NEXUS',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function PostPage() {
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://tklnexus.se/' },
      { '@type': 'ListItem', position: 2, name: 'För företag', item: 'https://tklnexus.se/corporate' },
      { '@type': 'ListItem', position: 3, name: 'Publicera erbjudande', item: 'https://tklnexus.se/corporate/post' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <PostContent />
    </>
  );
}
