'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, GraduationCap, Info, Home, Menu, X, Sun, Moon, Monitor, CalendarDays, Briefcase, Gift, PenLine, LayoutGrid, ChevronDown, Phone, SlidersHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useScrollContainer } from '@/components/providers/ScrollProvider';
import { useNavbarState } from '@/components/providers/NavbarStateProvider';
import type { Locale } from '@/lib/i18n';

type NavChild = { href: string; label: string; Icon: LucideIcon };
type NavLinkItem = { href: string; label: string; Icon: LucideIcon; children?: NavChild[] };

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter(href: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoveredHref(href);
  }
  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setHoveredHref(null), 150);
  }
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const scrollContainer = useScrollContainer();
  const { isDrawerOpen } = useNavbarState();

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
    setSettingsOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  if (pathname.startsWith('/admin')) return null;

  const NAV_LINKS: NavLinkItem[] = [
    { href: '/', label: t.nav.home, Icon: Home },
    {
      href: '/corporate', label: t.nav.corporate, Icon: Building2,
      children: [
        { href: '/about#kontakt', label: t.nav.corporateSubAbout, Icon: Phone },
        { href: '/corporate/post', label: t.nav.corporateSubPost, Icon: PenLine },
        { href: '/corporate/services', label: t.nav.corporateSubServices, Icon: LayoutGrid },
      ],
    },
    {
      href: '/students', label: t.nav.students, Icon: GraduationCap,
      children: [
        { href: '/career', label: t.nav.studentsSubCareer, Icon: Briefcase },
        { href: '/events', label: t.nav.studentsSubEvents, Icon: CalendarDays },
        { href: '/students/deals', label: t.nav.studentsSubDeals, Icon: Gift },
      ],
    },
    { href: '/events', label: t.nav.events, Icon: CalendarDays },
    { href: '/about', label: t.nav.about, Icon: Info },
  ];

  const themeIcons = [
    { value: 'dark' as const, Icon: Moon, label: t.nav.themedark },
    { value: 'light' as const, Icon: Sun, label: t.nav.themelight },
    { value: 'system' as const, Icon: Monitor, label: t.nav.themesystem },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: isDrawerOpen ? '-140%' : 0, opacity: isDrawerOpen ? 0 : 1 }}
        transition={{ duration: isDrawerOpen ? 0.22 : 0.4, ease: isDrawerOpen ? 'easeIn' : 'easeOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3/4 lg:max-w-[min(95vw,1500px)]"
        style={{ pointerEvents: isDrawerOpen ? 'none' : 'auto' }}
        role="navigation"
        aria-label={t.nav.mainNav}
        aria-hidden={isDrawerOpen ? true : undefined}
      >
        <div className={`relative transition-all duration-300 rounded-2xl ${scrolled ? 'shadow-lg shadow-black/30 light:shadow-black/5' : ''}`}>
          {/* Glassmorphism background — overflow-hidden here so blur clips to rounded corners without clipping dropdowns */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 dark:bg-[#0a0118]/30 light:bg-white/50" />

          <div className="relative px-5 py-3.5 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] rounded-lg"
              aria-label="TKL NEXUS"
            >
              <img src="/Logo/TKL NEXUS.svg" alt="TKL NEXUS" width={32} height={32} />
              <span className="nav-text font-bold text-base select-none" style={{ letterSpacing: '-0.03em' }}>
                TKL
              </span>
              <span className="font-semibold text-base tracking-wide text-red-500">
                NEXUS
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map(({ href, label, Icon, children }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                const isOpen = hoveredHref === href && !!children;
                return (
                  <div
                    key={href}
                    className="relative"
                    onMouseEnter={() => { if (children) handleMouseEnter(href); }}
                    onMouseLeave={() => { if (children) handleMouseLeave(); }}
                    // Tangentbordsnav: öppna på fokus, stäng när fokus lämnar wrappern eller på Escape
                    onFocusCapture={() => { if (children) handleMouseEnter(href); }}
                    onBlurCapture={(e) => {
                      if (children && !e.currentTarget.contains(e.relatedTarget as Node)) {
                        handleMouseLeave();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (children && e.key === 'Escape') setHoveredHref(null);
                    }}
                  >
                    <Link
                      href={href}
                      className={`relative px-4 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-colors duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] ${
                        isActive ? 'nav-text' : 'nav-text-muted hover:nav-text hover:bg-white/5 light:hover:bg-black/5'
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
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 min-w-50 z-50"
                          onMouseEnter={() => handleMouseEnter(href)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div
                            className="rounded-xl overflow-hidden py-1"
                            style={{
                              background: 'var(--nav-dropdown-bg)',
                              border: '1px solid var(--nav-dropdown-border)',
                              backdropFilter: 'blur(20px)',
                              WebkitBackdropFilter: 'blur(20px)',
                            }}
                          >
                            {children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setHoveredHref(null)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium nav-text-muted hover:nav-text hover:bg-white/5 light:hover:bg-black/5 transition-colors"
                              >
                                <child.Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Compact controls: settings icon + contact (lg–xl) */}
            <div className="hidden lg:flex xl:hidden items-center gap-2 shrink-0">
              <div ref={settingsRef} className="relative">
                <button
                  onClick={() => setSettingsOpen((v) => !v)}
                  aria-expanded={settingsOpen}
                  aria-haspopup="true"
                  aria-label={t.nav.settings}
                  className={`p-2 rounded-xl min-h-11 min-w-11 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] ${
                    settingsOpen ? 'nav-control-active' : 'nav-text-muted hover:nav-text hover:bg-white/5'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                </button>

                <AnimatePresence>
                  {settingsOpen && (
                    <motion.div
                      key="settings-popover"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 min-w-52 z-50"
                    >
                      <div
                        className="rounded-xl p-3 flex flex-col gap-3"
                        style={{
                          background: 'var(--nav-dropdown-bg)',
                          border: '1px solid var(--nav-dropdown-border)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                        }}
                      >
                        {/* Tema */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest nav-text-subtle mb-2">
                            {t.nav.chooseTheme}
                          </p>
                          <div
                            role="group"
                            aria-label={t.nav.chooseTheme}
                            className="flex items-center gap-0.5 px-1 py-1 rounded-xl nav-control-bg border nav-control-border"
                          >
                            {themeIcons.map(({ value, Icon, label }) => (
                              <button
                                key={value}
                                onClick={() => setTheme(value)}
                                aria-label={label}
                                aria-pressed={theme === value}
                                className={`flex-1 p-2 rounded-lg min-h-9 flex items-center justify-center transition-all duration-200 ${
                                  theme === value ? 'nav-control-active' : 'nav-text-subtle hover:nav-text-muted'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Språk */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest nav-text-subtle mb-2">
                            {t.nav.chooseLang}
                          </p>
                          <div className="flex items-center gap-0 rounded-xl nav-control-border border overflow-hidden text-xs font-semibold">
                            {(['sv', 'en'] as Locale[]).map((lang) => (
                              <button
                                key={lang}
                                onClick={() => setLocale(lang)}
                                aria-pressed={locale === lang}
                                aria-label={lang === 'sv' ? t.nav.langSv : t.nav.langEn}
                                className={`flex-1 min-h-9 flex items-center justify-center transition-all duration-200 ${
                                  locale === lang ? 'nav-control-active' : 'nav-text-subtle hover:nav-text-muted'
                                }`}
                              >
                                {lang.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/about#kontakt"
                className="px-4 py-2 rounded-xl bg-linear-to-r from-[#E30613] to-[#c00510] text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#E30613]/30 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
              >
                {t.nav.contact}
              </Link>
            </div>

            {/* Right side: theme toggle + lang + cta (xl+) */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
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
                    className={`p-2 rounded-lg min-h-11 min-w-11 flex items-center justify-center transition-all duration-200 ${
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
                    className={`px-3 min-h-11 flex items-center justify-center transition-all duration-200 ${
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
              className="lg:hidden p-2 nav-text rounded-xl hover:bg-white/10 light:hover:bg-black/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
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
            className="fixed top-22 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-sm lg:hidden"
          >
            <div className="rounded-2xl border border-white/10 dark:border-white/10 light:border-black/10 backdrop-blur-2xl dark:bg-[#0a0118]/85 light:bg-white/92">
              <nav className="relative p-3 space-y-1" aria-label={t.nav.mobileNav}>
                {NAV_LINKS.map(({ href, label, Icon, children }) => {
                  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                  const isExpanded = mobileExpanded === href;
                  return (
                    <div key={href}>
                      <div className="flex items-center gap-1">
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-[#E30613]/15 nav-text border border-[#E30613]/30'
                              : 'nav-text-muted hover:nav-text hover:bg-white/5 light:hover:bg-black/5'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                          {label}
                        </Link>
                        {children && (
                          <button
                            onClick={() => setMobileExpanded(isExpanded ? null : href)}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? t.nav.hideSubmenu : t.nav.showSubmenu}
                            className="p-2.5 rounded-xl nav-text-muted hover:nav-text hover:bg-white/5 light:hover:bg-black/5 transition-all duration-200"
                          >
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="block"
                            >
                              <ChevronDown className="w-4 h-4" aria-hidden="true" />
                            </motion.span>
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {children && isExpanded && (
                          <motion.div
                            key="children"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 mt-0.5 pb-0.5 space-y-0.5">
                              {children.map((child) => {
                                const childActive = pathname === child.href;
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                                      childActive
                                        ? 'nav-text bg-white/8'
                                        : 'nav-text-muted hover:nav-text hover:bg-white/5 light:hover:bg-black/5'
                                    }`}
                                  >
                                    <child.Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                        className={`p-2.5 rounded-lg min-h-11 min-w-11 flex items-center justify-center text-xs font-medium transition-all ${
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
                        className={`px-3 min-h-11 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
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
