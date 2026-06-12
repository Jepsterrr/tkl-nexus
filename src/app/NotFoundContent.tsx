'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function NotFoundContent() {
  const { t } = useLanguage();
  const nf = t.notFound;
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative min-h-[calc(100svh-var(--navbar-height,72px))] flex flex-col items-center justify-center px-4 sm:px-6 text-center overflow-hidden"
      aria-labelledby="not-found-heading"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
        className="relative z-10 flex flex-col items-center"
      >
        <p
          aria-hidden="true"
          className="font-bold leading-none select-none"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(6rem, 18vw, 12rem)',
            background: 'linear-gradient(135deg, #E30613, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          404
        </p>

        <h1 id="not-found-heading" className="hero-text text-2xl sm:text-3xl font-bold mt-4">
          {nf.heading}
        </h1>

        <p className="hero-text-muted text-base sm:text-lg max-w-md mt-3 leading-relaxed">
          {nf.description}
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-[#E30613] to-[#c00510] text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#E30613]/30 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          {nf.cta}
        </Link>
      </motion.div>
    </section>
  );
}
