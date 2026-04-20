import type { Metadata } from 'next';
import { PostContent } from './PostContent';

export const metadata: Metadata = {
  title: 'Annonsera hos TKL Nexus — Publicera Jobb, Event & Deals | TKL Nexus',
  description:
    'Skicka in er jobbannons, event eller deal till Teknologkårens arbetsmarknadsportal. Vi publicerar manuellt och återkommer inom 2–3 arbetsdagar.',
  keywords: [
    'annonsera exjobb LTU', 'publicera event LTU', 'nexus deals företag',
    'samarbeta Teknologkåren', 'rekrytera studenter Luleå',
  ],
  openGraph: {
    title: 'Annonsera hos TKL Nexus | TKL Nexus',
    description: 'Publicera jobb, event och deals till LTU:s 1 600+ studenter.',
    url: 'https://tklnexus.se/corporate/post',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function PostPage() {
  return <PostContent />;
}
