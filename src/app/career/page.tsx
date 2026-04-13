import { Metadata } from 'next';
import { CareerContent } from './CareerContent';

export const metadata: Metadata = {
  title: 'Karriärportalen | TKL Nexus',
  description: 'Hitta ditt nästa exjobb, praktikplats eller karriärsteg via TKL Nexus.',
};

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-cosmic-bg selection:bg-[#8B5CF6]/30">
      <CareerContent />
    </main>
  );
}
