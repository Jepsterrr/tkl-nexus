'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function PrivacyContent() {
  const { t } = useLanguage();
  const p = t.privacy;

  const sections = [
    { title: p.dataTitle, body: p.dataBody },
    { title: p.purposeTitle, body: p.purposeBody },
    { title: p.retentionTitle, body: p.retentionBody },
    { title: p.rightsTitle, body: p.rightsBody },
  ];

  return (
    <main className="relative min-h-svh pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" id="main-content">
      {/* Decorative background */}
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
        {/* Back link */}
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
          {/* Heading */}
          <RevealItem>
            <h1
              className="hero-text font-black mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.03em' }}
            >
              {p.title}
            </h1>
          </RevealItem>

          <RevealItem>
            <p className="hero-text-muted text-base leading-relaxed mb-10">{p.intro}</p>
          </RevealItem>

          {/* Sections */}
          {sections.map(({ title, body }) => (
            <RevealItem key={title}>
              <div
                className="mb-6 rounded-2xl p-6"
                style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)', backdropFilter: 'blur(12px)' }}
              >
                <h2
                  className="hero-text font-bold text-base mb-2"
                  style={{ color: 'var(--text-red)' }}
                >
                  {title}
                </h2>
                <p className="hero-text-muted text-sm leading-relaxed">{body}</p>
              </div>
            </RevealItem>
          ))}

          {/* Contact section */}
          <RevealItem>
            <div
              className="mb-6 rounded-2xl p-6"
              style={{ background: 'var(--about-card-bg)', border: '1px solid var(--about-card-border)', backdropFilter: 'blur(12px)' }}
            >
              <h2
                className="hero-text font-bold text-base mb-2"
                style={{ color: 'var(--text-red)' }}
              >
                {p.contactTitle}
              </h2>
              <p className="hero-text-muted text-sm leading-relaxed">
                {p.contactBody}{' '}
                <a
                  href="mailto:web@tklnexus.se"
                  className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-red)' }}
                >
                  web@tklnexus.se
                </a>
              </p>
            </div>
          </RevealItem>
        </StaggerReveal>
      </div>
    </main>
  );
}
