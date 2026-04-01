import type { Metadata } from 'next';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'Om oss',
  description:
    'Vår vision: Att vara den självklara bryggan mellan Luleå tekniska universitets studenter och näringslivet. Läs om vår resa från 2019 till idag.',
  openGraph: {
    title: 'Om TKL Nexus',
    description: 'Den självklara bryggan mellan LTU-studenter och näringslivet.',
    url: 'https://tkl-nexus.se/about',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
