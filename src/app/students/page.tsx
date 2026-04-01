import type { Metadata } from 'next';
import { StudentsContent } from './StudentsContent';

export const metadata: Metadata = {
  title: 'För Studenter',
  description:
    'Hitta exjobb, praktik och traineeprogram via Teknologkårens arbetsmarknadsportal. Koppla samman din karriär med Norrlands ledande företag.',
  openGraph: {
    title: 'För Studenter – TKL Nexus',
    description: 'Exjobb, praktik, förmåner och karriärstart för LTU-studenter.',
    url: 'https://tkl-nexus.se/students',
    siteName: 'TKL Nexus',
    locale: 'sv_SE',
    type: 'website',
  },
};

export default function StudentsPage() {
  return <StudentsContent />
}
