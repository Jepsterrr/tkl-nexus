'use client';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { HeroSection } from '@/components/sections/HeroSection';
import { BenefitCardComponent } from '@/components/ui/BenefitCard';
import { JobCard } from '@/components/ui/JobCard';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import type { BenefitCard, JobCardProps } from '@/lib/types';
const OPPORTUNITIES: JobCardProps[] = [
  {
    title: 'Exjobb – Prediktiv analys för energidata',
    company: 'Ditt Företag AB',
    location: 'Luleå',
    type: 'Exjobb 30 hp',
    deadline: 'Start: HT 2026',
    category: 'student',
  },
  {
    title: 'Edge AI för smart logistik',
    company: 'Ditt Företag AB',
    location: 'Skellefteå',
    type: 'Exjobb 30 hp',
    deadline: 'Start: HT 2026',
    category: 'student',
  },
  {
    title: 'Sommarjobb – Hållbar produktutveckling',
    company: 'GreenTech Luleå',
    location: 'Luleå',
    type: 'Sommarpraktik',
    deadline: '30 Apr',
    category: 'student',
  },
  {
    title: 'Traineeprogram – Systemutveckling',
    company: 'Nordic Software',
    location: 'Remote',
    type: 'Trainee',
    deadline: '15 Apr',
    category: 'student',
  },
];
export function StudentsContent() {
  const { t } = useLanguage();
  const { students } = t;
  const BENEFITS: BenefitCard[] = [
    {
      title: students.benefits.learn.title,
      description: students.benefits.learn.description,
      iconName: 'BookOpen',
      accentColor: 'green',
    },
    {
      title: students.benefits.career.title,
      description: students.benefits.career.description,
      iconName: 'Rocket',
      accentColor: 'green',
    },
    {
      title: students.benefits.network.title,
      description: students.benefits.network.description,
      iconName: 'Target',
      accentColor: 'green',
    },
  ];
  return (
    <>
      <HeroSection
        badge={students.badge}
        heading={students.heading}
        headingAccent={students.headingAccent}
        description={students.description}
        ctas={[
          { label: students.ctaExplore, href: '#mojligheter', variant: 'primary' },
          { label: students.ctaDeals, href: '#deals', variant: 'secondary' },
        ]}
        accentColor="green"
      />
      
      {/* Benefits */}
      <section
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="benefits-heading"
      >
        <GradientOrb color="green" size={400} top="40%" left="75%" opacity={0.07} />
        <div className="max-w-6xl mx-auto">
          <StaggerReveal className="mb-10">
            <RevealItem className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
              <h2 id="benefits-heading" className="hero-text-subtle text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                {students.benefitsTitle}
              </h2>
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
            </RevealItem>
          </StaggerReveal>
          <div className="flex gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="min-w-70 sm:min-w-0 flex-1 snap-center" style={{ marginTop: `${i * 24}px` }}>
                <BenefitCardComponent {...b} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job listings */}
      <section
        id="mojligheter"
        className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="opportunities-heading"
      >
        <div className="max-w-6xl mx-auto">
          <StaggerReveal className="mb-10">
            <RevealItem className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
              <h2 id="opportunities-heading" className="hero-text-subtle text-sm font-bold uppercase tracking-widest">
                {students.jobsTitle}
              </h2>
              <div className="h-px flex-1 bg-border" aria-hidden="true" />
            </RevealItem>
          </StaggerReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {OPPORTUNITIES.map((opp) => (
              <JobCard key={opp.title} {...opp} />
            ))}
          </div>
          {/* Nexus Deals teaser */}
          <div
            id="deals"
            className="mt-16 relative rounded-3xl overflow-hidden p-px"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(16,185,129,0.1))' }}
          >
            <div className="rounded-3xl cta-banner-bg backdrop-blur-xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="hero-text text-xl font-bold mb-2">{students.dealsTitle}</h3>
                <p className="hero-text-muted text-sm max-w-md">{students.dealsSubtitle}</p>
              </div>
              <Link
                href="/students/deals"
                className="shrink-0 px-7 py-3 rounded-2xl bg-linear-to-r from-[#10B981] to-[#059669] text-white font-semibold text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#10B981]/30 transition-all active:scale-95"
              >
                {students.dealsBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
