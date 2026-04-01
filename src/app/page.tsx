import type { Metadata } from 'next';
import { HomeContent } from './HomeContent';

export const metadata: Metadata = {
  title: 'TKL Nexus – Teknologkårens Arbetsmarknadsportal',
  description:
    'TKL Nexus förenar LTU-studenter och framgångsrika företag via exjobb, events, förmåner och direktkontakt — allt samlat på ett ställe.',
  openGraph: {
    title: 'TKL Nexus',
    description: 'Teknologkårens Arbetsmarknadsportal – Luleå tekniska universitet',
    url: 'https://tkl-nexus.se',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeContent />;
}
