'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { CONTACT_ITEMS } from '@/lib/types';

const OUR_PAGES = [
  { label: 'Teknologkåren', href: 'https://www.teknologkaren.se', external: true },
  { label: 'LARV', href: 'https://larv.org', external: true },
];

const SECTION_PAGES = [
  { href: 'https://teknologkaren.se/om-oss/sektioner/datasektionen' },
  { href: 'https://teknologkaren.se/om-oss/sektioner/geosektionen' },
  { href: 'https://teknologkaren.se/om-oss/sektioner/i-sektionen' },
  { href: 'https://teknologkaren.se/om-oss/sektioner/maskinsektionen' },
];

const SECTION_LABELS = ['Datasektionen', 'Geosektionen', 'I-sektionen', 'Maskinsektionen'];

const CONTACT = [
  { label: CONTACT_ITEMS[0].label, href: CONTACT_ITEMS[0].href },
  { label: CONTACT_ITEMS[1].label, href: CONTACT_ITEMS[1].href, external: CONTACT_ITEMS[1].external },
  { label: CONTACT_ITEMS[2].label, href: CONTACT_ITEMS[2].href, external: CONTACT_ITEMS[2].external },
];

export function Footer() {
  const { t } = useLanguage();

  const QUICK_LINKS = [
    { label: t.footer.links.students, href: '/students' },
    { label: t.footer.links.corporate, href: '/corporate' },
    { label: t.footer.links.about, href: '/about' },
    { label: t.footer.links.contact, href: '/about#kontakt' },
  ];

  return (
    <footer className="relative border-t border-white/8 bg-black/30 backdrop-blur-md footer-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src="/Logo/TKL NEXUS.svg" alt="TKL Nexus" width={32} height={32} />
              <span className="footer-text font-black text-lg tracking-tight select-none">
                TKL
              </span>
              <span className="font-bold text-lg tracking-wide text-red-500">
                Nexus
              </span>
            </div>
            <p className="footer-text-muted text-sm leading-relaxed max-w-xs">
              {t.footer.description}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t.footer.quickLinks}>
            <h3 className="footer-text text-xs font-semibold uppercase tracking-widest mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="footer-text-muted text-sm hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Our pages */}
          <nav aria-label={t.footer.ourPages}>
            <h3 className="footer-text text-xs font-semibold uppercase tracking-widest mb-4">
              {t.footer.ourPages}
            </h3>
            <ul className="space-y-2.5">
              {OUR_PAGES.map(({ label, href, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="footer-text-muted text-sm hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="footer-text text-xs font-semibold uppercase tracking-widest mt-6 mb-4">
              {t.footer.ourSections}
            </h3>
            <ul className="space-y-2.5">
              {SECTION_PAGES.map(({ href }, i) => (
                <li key={href}>
                  <Link href={href} className="footer-text-muted text-sm hover:text-white transition-colors duration-150">
                    {SECTION_LABELS[i]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <nav aria-label={t.footer.contactLabel}>
            <h3 className="footer-text text-xs font-semibold uppercase tracking-widest mb-4">
              {t.footer.contactLabel}
            </h3>
            <ul className="space-y-2.5">
              {CONTACT.map(({ label, href, external }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="footer-text-muted text-sm hover:text-white transition-colors duration-150 break-all"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="footer-text-subtle text-xs">
            © {new Date().getFullYear()} TKL Nexus. {t.footer.copyright}
          </p>
          <p className="footer-text-subtle text-xs">
            {t.footer.builtBy}
          </p>
        </div>
      </div>
    </footer>
  );
}
