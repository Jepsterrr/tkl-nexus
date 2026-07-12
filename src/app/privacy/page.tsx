import type { Metadata } from 'next';
import { PrivacyContent } from './PrivacyContent';

// Indexeras medvetet: en publik integritetspolicy är en förtroendesignal,
// och noindex + sitemap-listning gav motstridiga signaler i Search Console.
export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description: 'Hur TKL NEXUS hanterar dina uppgifter och cookies.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
