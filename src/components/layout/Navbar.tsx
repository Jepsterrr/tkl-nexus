'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, GraduationCap, Info, Home, Menu, X, Sun, Moon, Monitor, CalendarDays } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import type { Locale } from '@/lib/i18n';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const scrollContainer = useScrollContainer();

  if (pathname.startsWith('/admin')) return null;

  const NAV_LINKS = [
    { href: '/', label: t.nav.home, Icon: Home },
    { href: '/corporate', label: t.nav.corporate, Icon: Building2 },
    { href: '/students', label: t.nav.students, Icon: GraduationCap },
    { href: '/events', label: t.nav.events, Icon: CalendarDays },
    { href: '/about', label: t.nav.about, Icon: Info },
  ] as const;

  const themeIcons = [
    { value: 'dark' as const, Icon: Moon, label: t.nav.themedark },
    { value: 'light' as const, Icon: Sun, label: t.nav.themelight },
    { value: 'system' as const, Icon: Monitor, label: t.nav.themesystem },
  ];

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;
    const onScroll = () => setScrolled(container.scrollTop > 20);
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [scrollContainer]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3/4"
        role="navigation"
        aria-label={t.nav.mainNav}
      >
        <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/30' : ''}`}>
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 dark:bg-[#0a0118]/30 light:bg-white/80" />

          <div className="relative px-5 py-3.5 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded-lg"
              aria-label="TKL Nexus"
            >
              <img src="/Logo/TKL NEXUS.svg" alt="TKL Nexus" width={32} height={32} />
              <span className="nav-text font-bold text-base select-none" style={{ letterSpacing: '-0.03em' }}>
                TKL
              </span>
              <span className="font-semibold text-base tracking-wide text-red-500">
                Nexus
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] ${
                      isActive
                        ? 'nav-text'
                        : 'nav-text-muted hover:nav-text hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl bg-linear-to-r from-[#E30613]/20 to-[#E30613]/10 border border-[#E30613]/30"
                        style={{ boxShadow: '0 0 16px rgba(227,6,19,0.25)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side: theme toggle + lang + cta */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {/* Theme toggle */}
              <div
                role="group"
                aria-label={t.nav.chooseTheme}
                className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl nav-control-bg border nav-control-border"
              >
                {themeIcons.map(({ value, Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-label={label}
                    aria-pressed={theme === value}
                    className={`p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-all duration-200 ${
                      theme === value
                        ? 'nav-control-active'
                        : 'nav-text-subtle hover:nav-text-muted'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>

              {/* Language toggle */}
              <div className="flex items-center gap-0 rounded-xl nav-control-border border overflow-hidden text-xs font-semibold">
                {(['sv', 'en'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    aria-pressed={locale === lang}
                    aria-label={lang === 'sv' ? t.nav.langSv : t.nav.langEn}
                    className={`px-3 min-h-[44px] flex items-center justify-center transition-all duration-200 ${
                      locale === lang
                        ? 'nav-control-active'
                        : 'nav-text-subtle hover:nav-text-muted'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Kontakt CTA */}
              <Link
                href="/about#kontakt"
                className="px-4 py-2 rounded-xl bg-linear-to-r from-[#E30613] to-[#c00510] text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#E30613]/30 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
              >
                {t.nav.contact}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 nav-text rounded-xl hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-22 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-sm md:hidden"
          >
            <div className="rounded-2xl border border-white/10 dark:border-white/10 light:border-black/10 backdrop-blur-2xl dark:bg-[#0a0118]/85 light:bg-white/92">
              <nav className="relative p-3 space-y-1" aria-label={t.nav.mobileNav}>
                {NAV_LINKS.map(({ href, label, Icon }) => {
                  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#E30613]/15 nav-text border border-[#E30613]/30'
                          : 'nav-text-muted hover:nav-text hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      {label}
                    </Link>
                  );
                })}

                <div className="pt-2 pb-1 px-4 flex items-center justify-between gap-3">
                  {/* Mobile theme toggle */}
                  <div role="group" aria-label={t.nav.chooseTheme} className="flex items-center gap-1">
                    {themeIcons.map(({ value, Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        aria-label={label}
                        aria-pressed={theme === value}
                        className={`p-2.5 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-medium transition-all ${
                          theme === value ? 'nav-control-active' : 'nav-text-subtle hover:nav-text-muted'
                        }`}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  {/* Mobile language toggle */}
                  <div className="flex items-center gap-1">
                    {(['sv', 'en'] as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLocale(lang)}
                        aria-pressed={locale === lang}
                        aria-label={lang === 'sv' ? t.nav.langSv : t.nav.langEn}
                        className={`px-3 min-h-[44px] flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                          locale === lang ? 'nav-control-active' : 'nav-text-subtle hover:nav-text-muted'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  href="/about#kontakt"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-3 mt-3 rounded-xl bg-linear-to-r from-[#E30613] to-[#c00510] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#E30613]/30 transition-all"
                >
                  {t.nav.contact}
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
