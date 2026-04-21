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
  return (
    <main className="min-h-svh bg-cosmic-bg selection:bg-[#8B5CF6]/30">
      <CareerContent />
    </main>
  );
}
