import type { Metadata } from 'next';
import { PrivacyContent } from './PrivacyContent';

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description: 'Hur TKL NEXUS hanterar dina uppgifter och cookies.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
