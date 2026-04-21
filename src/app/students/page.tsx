import type { Metadata } from 'next';
import { StudentsContent } from './StudentsContent';

export const metadata: Metadata = {
  alternates: { canonical: '/students' },
  title: 'Exjobb, Praktik & Karriär för LTU-studenter',
  description:
    'Din ingång till exjobb, praktik, traineeprogram och kårförmåner som LTU-student. Koppla samman din karriär med Norrlands ledande teknik- och industriföretag via Teknologkårens arbetsmarknadsportal.',
  keywords: [
    'LTU-student', 'exjobb LTU', 'praktik LTU', 'trainee LTU', 'kårförmåner LTU',
    'karriär Luleå', 'studentjobb LTU', 'ingenjörsstudent', 'Teknologkåren förmåner',
  ],
  openGraph: {
    title: 'Exjobb, Praktik & Karriär för LTU-studenter',
    description:
      'Din ingång till exjobb, praktik, traineeprogram och kårförmåner som LTU-student. Teknologkårens arbetsmarknadsportal vid Luleå tekniska universitet.',
    url: 'https://tklnexus.se/students',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function StudentsPage() {
  return <StudentsContent />
}
