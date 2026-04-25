import type { Metadata } from 'next';
import { Unbounded, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { SettingsProvider } from '@/components/providers/SettingsProvider';
import { HtmlLangSync } from '@/components/providers/HtmlLangSync';
import { ScrollProvider } from '@/components/providers/ScrollProvider';
import { ScrollContainer } from '@/components/providers/ScrollContainer';
import { ScrollResetter } from '@/components/providers/ScrollResetter';

const unbounded = Unbounded({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});
const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TKL Nexus – Karriärportal för LTU-studenter & Företag',
    template: '%s | TKL Nexus',
  },
  description:
    'TKL Nexus kopplar LTU-studenter och företag via exjobb, praktik, events och förmåner. Teknologkårens officiella arbetsmarknadsportal vid LTU.',
  keywords: [
    'LTU', 'Luleå tekniska universitet', 'Teknologkåren', 'TKL Nexus',
    'exjobb', 'exjobb LTU', 'exjobb Luleå', 'examensarbete LTU',
    'praktik', 'praktik LTU', 'praktikplats Luleå',
    'trainee', 'traineeprogram ingenjör',
    'ingenjörsjobb', 'ingenjörsjobb Luleå', 'ingenjör', 'civilingenjör', 'högskoleingenjör',
    'karriär', 'karriärstart', 'studentjobb', 'nyexaminerad ingenjör',
    'arbetsmarknad', 'arbetsmarknadsportal', 'rekrytering LTU', 'rekrytera ingenjörer',
    'Luleå', 'Norrbotten', 'norra Sverige',
    'datateknik', 'maskinteknik', 'elektroteknik', 'industriell ekonomi', 'samhällsbyggnad',
    'employer branding LTU', 'kårförmåner', 'studentrabatt',
    'arbetsmarknadsdagar Luleå', 'nätverkande studenter',
  ],
  metadataBase: new URL('https://tklnexus.se'),
  openGraph: {
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TKL Nexus' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TKL Nexus',
    alternateName: 'Teknologkårens Arbetsmarknadsportal',
    url: 'https://tklnexus.se',
    logo: {
      '@type': 'ImageObject',
      url: 'https://tklnexus.se/og-image.png',
      width: 1200,
      height: 630,
    },
    description: 'TKL Nexus är Teknologkårens officiella arbetsmarknadsportal vid Luleå tekniska universitet — kopplar samman LTU-studenter med exjobb, praktik och karriärmöjligheter.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Luleå',
      addressRegion: 'Norrbotten',
      addressCountry: 'SE',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Teknologkåren vid LTU',
      url: 'https://www.teknologkaren.se',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TKL Nexus',
    url: 'https://tklnexus.se',
    description: 'Arbetsmarknadsportal för LTU-studenter — exjobb, praktik, trainee och karriärevent.',
  };

  return (
    <html lang="sv" className={`${unbounded.variable} ${hankenGrotesk.variable} dark`}>
      <head>
        <link rel="icon" href="/Logo/TKL NEXUS.svg" sizes="any" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="antialiased bg-cosmic-bg overflow-x-hidden">
        <LanguageProvider>
          <HtmlLangSync />
          <SettingsProvider>
            <ThemeProvider>
              <ScrollProvider>
                <ScrollResetter />
                <a href="#main-content" className="skip-nav">
                  Hoppa till innehåll
                </a>
                <Navbar />
                <ScrollContainer>
                  <main id="main-content" className="relative overflow-x-hidden">
                    {children}
                  </main>
                  <Footer />
                </ScrollContainer>
              </ScrollProvider>
            </ThemeProvider>
          </SettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
