'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutGrid, ExternalLink, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { ProductCard } from '@/components/ui/ProductCard';
// Service-lagret importeras dynamiskt i effekten — statisk import drar in
// Firestore-SDK:t (~145 kB gzip) i sidans hydration-bundle och försämrar LCP.
import type { TKLProduct } from '@/lib/schemas/product';

const CATEGORY_ORDER: TKLProduct['category'][] = ['activities', 'services', 'marketing'];

const CATEGORY_ACCENT: Record<TKLProduct['category'], string> = {
  activities: '#3B82F6',
  services: '#10B981',
  marketing: '#F59E0B',
};

const BADGE_STYLE: React.CSSProperties = {
  background: 'var(--glass-purple-bg)',
  border: '1px solid var(--glass-purple-border)',
  color: 'var(--text-purple)',
  boxShadow: '0 0 20px var(--purple-glow)',
};

const PDF_URL =
  'https://teknologkaren.se/media/wsghslun/tkl-produktportfölj-2024.pdf';

export function ServicesContent() {
  const { t } = useLanguage();
  const s = t.services;

  const [products, setProducts] = useState<TKLProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    import('@/lib/services/products')
      .then((m) => m.getProducts())
      .then((data) => { if (!cancelled) { setProducts(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError(s.error); setLoading(false); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const grouped = CATEGORY_ORDER.reduce<Record<TKLProduct['category'], TKLProduct[]>>(
    (acc, cat) => {
      acc[cat] = products.filter((p) => p.category === cat);
      return acc;
    },
    { activities: [], services: [], marketing: [] }
  );

  const categoryLabel: Record<TKLProduct['category'], string> = {
    activities: s.categoriesActivities,
    services: s.categoriesServices,
    marketing: s.categoriesMarketing,
  };

  return (
    <>
      {/* HERO */}
      <section
        className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="services-hero-heading"
      >
        <GradientOrb color="purple" size={500} top="0%" left="60%" opacity={0.07} />
        <GradientOrb color="purple" size={280} top="60%" left="-5%" opacity={0.04} />

        <div className="relative max-w-4xl mx-auto z-10">
          <StaggerReveal className="text-center" delay={0.05}>
            <RevealItem className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold" style={BADGE_STYLE}>
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                {s.badge}
              </span>
            </RevealItem>
            {/* hero-reveal (CSS) — LCP-elementet får inte vänta på hydration */}
            <div className="hero-reveal">
              <h1
                id="services-hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-black hero-text hero-heading"
              >
                {s.heading}{' '}
                <span style={{ color: '#8B5CF6' }}>{s.headingAccent}</span>
              </h1>
            </div>
            <RevealItem>
              <p className="mt-6 text-base sm:text-lg hero-text-muted max-w-2xl mx-auto leading-relaxed">
                {s.description}
              </p>
            </RevealItem>
            <RevealItem className="flex flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/about#kontakt"
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
              >
                {s.contactBtn}
              </Link>
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.22)', color: '#8B5CF6' }}
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                {s.downloadBtn}
              </a>
            </RevealItem>
          </StaggerReveal>
        </div>
      </section>

      {/* PRODUCT SECTIONS */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="max-w-6xl mx-auto space-y-20">
          {loading && (
            <p className="text-center hero-text-muted py-16">{s.loading}</p>
          )}

          {error && !loading && (
            <div className="flex justify-center py-16">
              <div className="text-center">
                <p className="hero-text-muted mb-4">{error}</p>
                <button
                  onClick={() => setFetchKey((k) => k + 1)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}
                >
                  {s.retry}
                </button>
              </div>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <p className="text-center hero-text-muted py-16">{s.empty}</p>
          )}

          {!loading && !error && CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            const accent = CATEGORY_ACCENT[cat];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-8 pb-3" style={{ borderBottom: `1px solid ${accent}28` }}>
                  <span className="w-1.5 h-5 rounded-full" style={{ background: accent }} aria-hidden="true" />
                  <h2 className="text-xl font-bold hero-text">
                    {categoryLabel[cat]}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} accentColor={accent} />
                  ))}
                </div>
                {/* Section-level CTA */}
                <div className="mt-8 flex justify-center sm:justify-start">
                  <Link
                    href="/about#kontakt"
                    className="inline-flex items-center gap-2 text-sm font-semibold hero-text-muted hover:hero-text transition-all duration-200 hover:gap-3"
                  >
                    {s.contactBtn}
                    <ArrowRight className="w-4 h-4" style={{ color: accent }} aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
