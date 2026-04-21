import { Metadata } from 'next';
import { CareerContent } from './CareerContent';

export const metadata: Metadata = {
  alternates: { canonical: '/career' },
  title: 'Exjobb & Praktik vid LTU',
  description:
    'Hitta exjobb, praktik, traineeprogram och ingenjörsjobb vid Luleå tekniska universitet. Aktuella annonser från företag som rekryterar LTU-studenter i Luleå och Norrbotten.',
  keywords: [
    'exjobb LTU', 'exjobb Luleå', 'examensarbete LTU', 'praktik LTU', 'praktikplats Luleå',
    'trainee ingenjör', 'ingenjörsjobb Luleå', 'jobb LTU', 'studentjobb Luleå',
    'rekrytering LTU', 'nyexaminerad ingenjör', 'karriär Luleå tekniska universitet',
  ],
  openGraph: {
    title: 'Exjobb & Praktik vid LTU',
    description:
      'Hitta exjobb, praktik, traineeprogram och ingenjörsjobb vid Luleå tekniska universitet. Aktuella annonser från företag som rekryterar LTU-studenter.',
    url: 'https://tklnexus.se/career',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function CareerPage() {
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://tklnexus.se/' },
      { '@type': 'ListItem', position: 2, name: 'Karriär & Exjobb', item: 'https://tklnexus.se/career' },
    ],
  };
  return (
    <main className="min-h-svh bg-cosmic-bg selection:bg-[#8B5CF6]/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <p className="sr-only">
        Hitta exjobb, praktikplatser, traineeprogram och ingenjörsjobb hos företag som samarbetar med Teknologkåren vid Luleå tekniska universitet. Sök bland aktuella annonser från teknik- och industriföretag i Luleå, Norrbotten och resten av Sverige. Passa på att bygga kontakter och starta din ingenjörskarriär redan under studietiden.
      </p>
      <CareerContent />
    </main>
  );
}
