import type { Metadata } from 'next';
import { Sora, DM_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { HtmlLangSync } from '@/components/providers/HtmlLangSync';
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});
const dmSans = DM_Sans({
  variable: '--font-dm-sans',
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
    'TKL Nexus kopplar ihop LTU-studenter och företag via exjobb, praktik, events och förmåner. Teknologkårens officiella arbetsmarknadsportal.',
  keywords: ['LTU', 'Teknologkåren', 'exjobb', 'praktik', 'ingenjör', 'karriär', 'Luleå'],
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
  return (
    <html lang="sv" className={`${sora.variable} ${dmSans.variable} dark`}>
      <link rel="icon" href="/Logo/TKL NEXUS.svg" sizes="any"/>
      <body className="antialiased min-h-svh bg-cosmic-bg overflow-x-hidden">
        <LanguageProvider>
          <HtmlLangSync />
          <ThemeProvider>
            <a href="#main-content" className="skip-nav">
              Hoppa till innehåll
            </a>
            <Navbar />
            <main id="main-content" className="relative overflow-x-hidden">{children}</main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
