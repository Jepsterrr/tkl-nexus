'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { CONTACT_ITEMS } from '@/lib/types';


export function Footer() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const { contact, about, links } = useSettings();

  if (pathname.startsWith('/admin')) return null;

  const footerEmail = contact?.email ?? CONTACT_ITEMS[0].label;
  const footerEmailHref = contact?.email ? `mailto:${contact.email}` : CONTACT_ITEMS[0].href;
  const footerLinkedin = contact?.linkedin || CONTACT_ITEMS[1].href;
  const footerInstagram = contact?.instagram || CONTACT_ITEMS[2].href;

  const sectionItems =
    links?.sectionLinks && links.sectionLinks.length === 4
      ? links.sectionLinks
      : [
          { name: 'Datasektionen', href: 'https://teknologkaren.se/om-oss/sektioner/datasektionen' },
          { name: 'Geosektionen', href: 'https://teknologkaren.se/om-oss/sektioner/geosektionen' },
          { name: 'I-sektionen', href: 'https://teknologkaren.se/om-oss/sektioner/i-sektionen' },
          { name: 'Maskinsektionen', href: 'https://teknologkaren.se/om-oss/sektioner/maskinsektionen' },
        ];

  const QUICK_LINKS = [
    { label: t.footer.links.students, href: '/students' },
    { label: t.footer.links.corporate, href: '/corporate' },
    { label: t.footer.links.about, href: '/about' },
    { label: t.footer.links.contact, href: '/about#kontakt' },
  ];

  return (
    <footer className="relative border-t border-border bg-[#0a0118]/30 backdrop-blur-md footer-theme">
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
                NEXUS
              </span>
            </div>
            <p className="footer-text-muted text-sm leading-relaxed max-w-xs">
              {(locale === 'sv' ? about?.footerDescSv : about?.footerDescEn) ?? t.footer.description}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t.footer.quickLinks}>
            <h3 className="footer-text text-sm font-bold tracking-tight mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="footer-text-muted text-sm hover:footer-text transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Our pages */}
          <nav aria-label={t.footer.ourPages}>
            <h3 className="footer-text text-sm font-bold tracking-tight mb-4">
              {t.footer.ourPages}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={links?.teknologkaren || 'https://www.teknologkaren.se'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text-muted text-sm hover:footer-text transition-colors duration-150"
                >
                  Teknologkåren
                </a>
              </li>
              <li>
                <a
                  href={links?.larv || 'https://larv.org'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text-muted text-sm hover:footer-text transition-colors duration-150"
                >
                  LARV
                </a>
              </li>
            </ul>
            <h3 className="footer-text text-xs font-semibold uppercase tracking-widest mt-6 mb-4">
              {t.footer.ourSections}
            </h3>
            <ul className="space-y-2.5">
              {sectionItems.map(({ name, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-text-muted text-sm hover:footer-text transition-colors duration-150"
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <nav aria-label={t.footer.contactLabel}>
            <h3 className="footer-text text-sm font-bold tracking-tight mb-4">
              {t.footer.contactLabel}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={footerEmailHref}
                  className="footer-text-muted text-sm hover:footer-text transition-colors duration-150 break-all"
                >
                  {footerEmail}
                </a>
              </li>
              <li>
                <a
                  href={footerLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text-muted text-sm hover:footer-text transition-colors duration-150 break-all"
                >
                  {CONTACT_ITEMS[1].label}
                </a>
              </li>
              <li>
                <a
                  href={footerInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-text-muted text-sm hover:footer-text transition-colors duration-150 break-all"
                >
                  {CONTACT_ITEMS[2].label}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="footer-text-subtle text-xs">
            © {new Date().getFullYear()} TKL NEXUS. {t.footer.copyright}
          </p>
          <p className="footer-text-subtle text-xs">
            {t.footer.builtBy}
          </p>
        </div>
      </div>
    </footer>
  );
}
