'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { CookieSettings } from '@/components/ui/CookieSettings';
import { EASE_OUT_EXPO } from '@/lib/motion';

const CARD_STYLE = {
  background: 'var(--about-card-bg)',
  border: '1px solid var(--about-card-border)',
  backdropFilter: 'blur(12px)',
} as const;

const ACCENT = { color: 'var(--text-red)' } as const;

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl p-6" style={CARD_STYLE}>
      <h2 className="hero-text font-bold text-base mb-3" style={ACCENT}>{title}</h2>
      {children}
    </div>
  );
}

export function PrivacyContent() {
  const { t } = useLanguage();
  const p = t.privacy;

  return (
    <main className="relative min-h-svh pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" id="main-content">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 15% 20%, rgba(227,6,19,0.07) 0%, transparent 55%),' +
            'radial-gradient(ellipse 50% 40% at 85% 80%, rgba(139,92,246,0.05) 0%, transparent 55%)',
        }}
        aria-hidden="true"
      />
      <GradientOrb color="red" size={500} top="10%" left="60%" opacity={0.05} />

      <div className="relative max-w-2xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          className="mb-10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium hero-text-muted hover:hero-text transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {p.back}
          </Link>
        </motion.div>

        <StaggerReveal>
          {/* hero-reveal (CSS) — LCP-elementet får inte vänta på hydration */}
          <div className="hero-reveal">
            <h1
              className="hero-text font-black mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              {p.title}
            </h1>
          </div>

          <RevealItem>
            <p className="hero-text-muted text-base leading-relaxed mb-10">{p.intro}</p>
          </RevealItem>

          {/* Personuppgiftsansvarig */}
          <RevealItem>
            <SectionCard title={p.controllerTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.controllerBody}</p>
              <p className="hero-text-muted text-sm mt-1">
                <a href="mailto:web@tklnexus.se" className="underline underline-offset-2 hover:opacity-80 transition-opacity" style={ACCENT}>
                  web@tklnexus.se
                </a>
              </p>
            </SectionCard>
          </RevealItem>

          {/* Vad vi samlar in */}
          <RevealItem>
            <SectionCard title={p.dataTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.dataBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Cookies och lokal lagring */}
          <RevealItem>
            <SectionCard title={p.cookiesTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.cookiesBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Cookie-inställningar — toggle för att ändra samtycke i efterhand */}
          <RevealItem>
            <CookieSettings />
          </RevealItem>

          {/* Rättslig grund */}
          <RevealItem>
            <SectionCard title={p.legalTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.legalBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Ändamål */}
          <RevealItem>
            <SectionCard title={p.purposeTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.purposeBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Automatiserat beslutsfattande */}
          <RevealItem>
            <SectionCard title={p.automatedTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.automatedBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Åldersgräns */}
          <RevealItem>
            <SectionCard title={p.ageTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.ageBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Personuppgiftsbiträde */}
          <RevealItem>
            <SectionCard title={p.processorTitle}>
              <p className="hero-text-muted text-sm leading-relaxed mb-2">{p.processorBody}</p>
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={ACCENT}
              >
                {p.processorLinkLabel}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </SectionCard>
          </RevealItem>

          {/* Lagringstid */}
          <RevealItem>
            <SectionCard title={p.retentionTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.retentionBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Internationell överföring */}
          <RevealItem>
            <SectionCard title={p.transferTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">{p.transferBody}</p>
            </SectionCard>
          </RevealItem>

          {/* Dina rättigheter */}
          <RevealItem>
            <SectionCard title={p.rightsTitle}>
              <p className="hero-text-muted text-sm mb-3">{p.rightsIntro}</p>
              <ul className="space-y-1.5 mb-3">
                {p.rightsList.split('\n').map((item) => (
                  <li key={item} className="hero-text-muted text-sm flex gap-2">
                    <span style={ACCENT} aria-hidden="true">—</span>
                    <span>{item.replace(/^[^—]+—\s*/, '')}</span>
                  </li>
                ))}
              </ul>
              <p className="hero-text-muted text-sm leading-relaxed">{p.rightsHow}</p>
            </SectionCard>
          </RevealItem>

          {/* Klagomål till IMY */}
          <RevealItem>
            <SectionCard title={p.imyTitle}>
              <p className="hero-text-muted text-sm leading-relaxed mb-2">{p.imyBody}</p>
              <a
                href="https://www.imy.se"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={ACCENT}
              >
                {p.imyLinkLabel}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </SectionCard>
          </RevealItem>

          {/* Kontakt */}
          <RevealItem>
            <SectionCard title={p.contactTitle}>
              <p className="hero-text-muted text-sm leading-relaxed">
                {p.contactBody}{' '}
                <a
                  href="mailto:web@tklnexus.se"
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={ACCENT}
                >
                  web@tklnexus.se
                </a>
              </p>
            </SectionCard>
          </RevealItem>
        </StaggerReveal>
      </div>
    </main>
  );
}
