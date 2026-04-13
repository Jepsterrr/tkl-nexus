import { Metadata } from 'next';
import { CareerContent } from './CareerContent';

export const metadata: Metadata = {
  title: 'Karriärportalen | TKL Nexus',
  description: 'Hitta ditt nästa exjobb, praktikplats eller karriärsteg via TKL Nexus.',
  openGraph: {
    title: 'Karriärportalen | TKL Nexus',
    description: 'Hitta ditt nästa exjobb, praktikplats eller karriärsteg via TKL Nexus.',
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
