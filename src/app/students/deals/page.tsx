import type { Metadata } from 'next';
import { DealsContent } from './DealsContent';

export const metadata: Metadata = {
  alternates: { canonical: '/students/deals' },
  title: 'Studentförmåner & Rabatter för LTU-studenter | Nexus Deals',
  description:
    'Exklusiva rabatter, erbjudanden och förmåner för kårmedlemmar i Teknologkåren vid Luleå tekniska universitet. Spara pengar som LTU-student med Nexus Deals.',
  keywords: [
    'studentförmåner LTU', 'studentrabatt Luleå', 'kårförmåner Teknologkåren',
    'nexus deals', 'rabatter LTU-studenter', 'erbjudanden kårmedlem LTU',
  ],
  openGraph: {
    title: 'Studentförmåner & Rabatter för LTU-studenter | Nexus Deals',
    description:
      'Exklusiva rabatter och förmåner för kårmedlemmar i Teknologkåren vid Luleå tekniska universitet.',
    url: 'https://tklnexus.se/students/deals',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function DealsPage() {
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://tklnexus.se/' },
      { '@type': 'ListItem', position: 2, name: 'För studenter', item: 'https://tklnexus.se/students' },
      { '@type': 'ListItem', position: 3, name: 'Nexus Deals', item: 'https://tklnexus.se/students/deals' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <p className="sr-only">
        Nexus Deals samlar exklusiva rabatter, erbjudanden och förmåner för dig som är kårmedlem vid Luleå tekniska universitet. Spara pengar på programvara, utrustning, mat och tjänster under din studietid. Förmånerna uppdateras löpande av TKL Nexus arbetsmarknadsgrupp.
      </p>
      <DealsContent />
    </>
  );
}
