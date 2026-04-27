'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, CalendarDays, Gift, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { GradientOrb } from '@/components/ui/GradientOrb';
import { StaggerReveal, RevealItem } from '@/components/motion/StaggerReveal';
import { ACCENT_COLOR_MAP } from '@/lib/types';

// Types

type ActiveTab = 'opportunity' | 'event' | 'deal';

interface OpportunityForm {
  contactName: string;
  contactEmail: string;
  title: string;
  titleEn: string;
  company: string;
  type: 'exjobb' | 'jobb' | 'praktik' | 'trainee' | '';
  location: string;
  startDate: string;
  deadline: string;
  applyUrl: string;
  description: string;
  descriptionEn: string;
}

interface EventForm {
  contactName: string;
  contactEmail: string;
  title: string;
  titleEn: string;
  date: string;
  endDate: string;
  location: string;
  section: 'data' | 'geo' | 'i' | 'maskin' | 'general' | '';
  tags: string;
  imageUrl: string;
  description: string;
  descriptionEn: string;
}

interface DealForm {
  contactName: string;
  contactEmail: string;
  company: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  discountCode: string;
  discount: string;
  link: string;
  logoUrl: string;
}

// Initial state

const EMPTY_OPPORTUNITY: OpportunityForm = {
  contactName: '', contactEmail: '', title: '', titleEn: '',
  company: '', type: '', location: '', startDate: '',
  deadline: '', applyUrl: '', description: '', descriptionEn: '',
};

const EMPTY_EVENT: EventForm = {
  contactName: '', contactEmail: '', title: '', titleEn: '',
  date: '', endDate: '', location: '', section: '',
  tags: '', imageUrl: '', description: '', descriptionEn: '',
};

const EMPTY_DEAL: DealForm = {
  contactName: '', contactEmail: '', company: '', title: '',
  titleEn: '', description: '', descriptionEn: '',
  discountCode: '', discount: '', link: '', logoUrl: '',
};

// Mailto builders

function field(label: string, value: string): string {
  return `${label}: ${value || '(ej angivet)'}`;
}

function buildOpportunityMailto(f: OpportunityForm, email: string): string {
  const subject = `[Nexus Portal] ${f.type} – ${f.company} – ${f.title}`;
  const body = [
    '=== TKL Nexus — Ny inlämning ===',
    'Typ: Jobb/Exjobb',
    `Inlämnad: ${new Date().toLocaleDateString('sv-SE')}`,
    '',
    '--- KONTAKTUPPGIFTER ---',
    field('Kontaktperson', f.contactName),
    field('Kontakt-e-post', f.contactEmail),
    '',
    '--- ANNONSDATA (career) ---',
    field('title', f.title),
    field('titleEn', f.titleEn),
    field('company', f.company),
    field('type', f.type),
    field('location', f.location),
    field('startDate', f.startDate),
    field('deadline', f.deadline),
    field('applyUrl', f.applyUrl),
    field('description (sv)', f.description),
    field('descriptionEn', f.descriptionEn),
    '',
    '--- NOTERINGAR ---',
    'Samling: career',
    'published: false (sätt till true vid publicering)',
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildEventMailto(f: EventForm, email: string): string {
  const subject = `[Event] ${f.contactName} (${f.contactEmail}) – ${f.title}`;
  const body = [
    '=== TKL Nexus — Ny inlämning ===',
    'Typ: Event',
    `Inlämnad: ${new Date().toLocaleDateString('sv-SE')}`,
    '',
    '--- KONTAKTUPPGIFTER ---',
    field('Kontaktperson', f.contactName),
    field('Kontakt-e-post', f.contactEmail),
    '',
    '--- EVENTDATA (events) ---',
    field('title', f.title),
    field('titleEn', f.titleEn),
    field('date', f.date),
    field('endDate', f.endDate),
    field('location', f.location),
    field('section', f.section),
    field('tags', f.tags),
    field('imageUrl', f.imageUrl),
    field('description (sv)', f.description),
    field('descriptionEn', f.descriptionEn),
    '',
    '--- NOTERINGAR ---',
    'Samling: events',
    'published: false (sätt till true vid publicering)',
    'tags: dela upp på kommatecken → array i Firestore',
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildDealMailto(f: DealForm, email: string): string {
  const subject = `[Deal] ${f.company} – ${f.title}`;
  const body = [
    '=== TKL Nexus — Ny inlämning ===',
    'Typ: Deal',
    `Inlämnad: ${new Date().toLocaleDateString('sv-SE')}`,
    '',
    '--- KONTAKTUPPGIFTER ---',
    field('Kontaktperson', f.contactName),
    field('Kontakt-e-post', f.contactEmail),
    '',
    '--- DEALDATA (deals) ---',
    field('company', f.company),
    field('title', f.title),
    field('titleEn', f.titleEn),
    field('description (sv)', f.description),
    field('descriptionEn', f.descriptionEn),
    field('discountCode', f.discountCode),
    field('discount', f.discount),
    field('link', f.link),
    field('logoUrl', f.logoUrl),
    '',
    '--- NOTERINGAR ---',
    'Samling: deals',
    'published: false (sätt till true vid publicering)',
  ].join('\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Validation

function isOpportunityValid(f: OpportunityForm): boolean {
  return !!(f.contactName && f.contactEmail && f.title && f.company && f.type && f.location);
}

function isEventValid(f: EventForm): boolean {
  return !!(f.contactName && f.contactEmail && f.title && f.date && f.location && f.section && f.description);
}

function isDealValid(f: DealForm): boolean {
  return !!(f.contactName && f.contactEmail && f.company && f.title && f.description);
}

// Shared styles

const inputCls =
  'w-full rounded-xl px-4 py-3 text-sm transition-all duration-150 outline-none ' +
  'bg-(--glass-bg-subtle) border border-(--glass-border-subtle) ' +
  'text-(--foreground) placeholder:text-(--muted-foreground) ' +
  'focus:ring-1 focus:ring-[rgba(59,130,246,0.4)]';

const labelCls = 'block text-xs font-semibold tracking-wide text-(--hero-text-muted) mb-1.5';

// Component

export function PostContent() {
  const { t } = useLanguage();
  const cp = t.corporatePost;
  const colors = ACCENT_COLOR_MAP['blue'];
  const { contact } = useSettings();
  const recipientEmail = contact?.email ?? 'ao@teknologkaren.se';

  const [activeTab, setActiveTab] = useState<ActiveTab>('opportunity');
  const [opp, setOpp] = useState<OpportunityForm>(EMPTY_OPPORTUNITY);
  const [evt, setEvt] = useState<EventForm>(EMPTY_EVENT);
  const [deal, setDeal] = useState<DealForm>(EMPTY_DEAL);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    let url = '';
    if (activeTab === 'opportunity') url = buildOpportunityMailto({ ...opp, contactName, contactEmail }, recipientEmail);
    else if (activeTab === 'event') url = buildEventMailto({ ...evt, contactName, contactEmail }, recipientEmail);
    else url = buildDealMailto({ ...deal, contactName, contactEmail }, recipientEmail);
    window.location.href = url;
    setSubmitted(true);
  }

  const isValid =
    activeTab === 'opportunity' ? isOpportunityValid({ ...opp, contactName, contactEmail }) :
    activeTab === 'event' ? isEventValid({ ...evt, contactName, contactEmail }) :
    isDealValid({ ...deal, contactName, contactEmail });

  function handleTabKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, currentId: ActiveTab) {
    const tabs: ActiveTab[] = ['opportunity', 'event', 'deal'];
    const idx = tabs.indexOf(currentId);
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
    else return;
    e.preventDefault();
    const nextId = tabs[nextIdx];
    setActiveTab(nextId);
    document.getElementById(`tab-${nextId}`)?.focus();
  }

  const TABS: { id: ActiveTab; label: string; Icon: typeof Briefcase }[] = [
    { id: 'opportunity', label: cp.tabs.opportunity, Icon: Briefcase },
    { id: 'event', label: cp.tabs.event, Icon: CalendarDays },
    { id: 'deal', label: cp.tabs.deal, Icon: Gift },
  ];

  const requiredDot = <span className="text-[#3B82F6] ml-0.5">*</span>;

  return (
    <>
      {/* HERO */}
      <section
        className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        aria-labelledby="post-hero-heading"
      >
        {/* depth-0: atmospheric orbs */}
        <GradientOrb color="blue" size={500} top="0%" left="60%" opacity={0.06} />
        <GradientOrb color="blue" size={300} top="40%" left="-5%" opacity={0.04} />

        {/* depth-1: diagonal grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(59,130,246,0.07) 0px, rgba(59,130,246,0.07) 1px, transparent 1px, transparent 40px),' +
              'repeating-linear-gradient(45deg, rgba(59,130,246,0.04) 0px, rgba(59,130,246,0.04) 1px, transparent 1px, transparent 40px)',
          }}
          aria-hidden="true"
        />

        {/* depth-2: hero content */}
        <div className="relative max-w-3xl mx-auto z-10">
          <StaggerReveal>
            <RevealItem>
              <Link
                href="/corporate"
                className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors duration-150 hover:opacity-80"
                style={{ color: colors.hex }}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {cp.backLabel}
              </Link>
            </RevealItem>

            <RevealItem>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  color: colors.hex,
                }}
              >
                {cp.badge}
              </span>
            </RevealItem>

            <RevealItem>
              <h1
                id="post-hero-heading"
                className="hero-text mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.04em',
                  fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 5rem)',
                }}
              >
                {cp.heading}
                <br />
                <span style={{ color: colors.hex }}>{cp.headingAccent}</span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="hero-text-muted text-base sm:text-lg leading-relaxed max-w-[56ch]">
                {cp.description}
              </p>
            </RevealItem>
          </StaggerReveal>
        </div>
      </section>

      {/* TAB NAVIGATION */}
      <div
        className="sticky top-(--navbar-height) z-20 py-4 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'var(--cosmic-bg)',
          borderBottom: '1px solid var(--glass-border-subtle)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            role="tablist"
            aria-label={cp.badge}
            className="inline-flex gap-2 p-1 rounded-2xl"
            style={{
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--glass-border-subtle)',
            }}
          >
            {TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${id}`}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  onKeyDown={(e) => handleTabKeyDown(e, id)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px]"
                  style={
                    isActive
                      ? {
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          color: colors.hex,
                          boxShadow: `0 0 16px ${colors.glow}`,
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid transparent',
                          color: 'var(--hero-text-muted)',
                        }
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            <div
              className="rounded-3xl p-6 sm:p-8 space-y-8"
              style={{
                background: 'var(--about-card-bg)',
                border: '1px solid var(--about-card-border)',
              }}
            >
              {/* Contact fields (shared across all tabs) */}
              <fieldset>
                <legend
                  className="text-base font-bold hero-text mb-5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {cp.contact.sectionTitle}
                </legend>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className={labelCls}>
                      {cp.contact.name}{requiredDot}
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      autoComplete="name"
                      aria-required="true"
                      placeholder={cp.contact.namePlaceholder}
                      className={inputCls}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className={labelCls}>
                      {cp.contact.email}{requiredDot}
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      autoComplete="email"
                      aria-required="true"
                      placeholder={cp.contact.emailPlaceholder}
                      className={inputCls}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--glass-border-subtle)' }} aria-hidden="true" />

              {/* Opportunity form */}
              {activeTab === 'opportunity' && (
                <fieldset>
                  <legend
                    className="text-base font-bold hero-text mb-5"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {cp.opportunity.sectionTitle}
                  </legend>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="opp-title" className={labelCls}>{cp.opportunity.title}{requiredDot}</label>
                        <input id="opp-title" type="text" aria-required="true" placeholder={cp.opportunity.titlePlaceholder} className={inputCls}
                          value={opp.title} onChange={e => setOpp(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="opp-titleEn" className={labelCls}>{cp.opportunity.titleEn}</label>
                        <input id="opp-titleEn" type="text" placeholder={cp.opportunity.titleEnPlaceholder} className={inputCls}
                          value={opp.titleEn} onChange={e => setOpp(p => ({ ...p, titleEn: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="opp-company" className={labelCls}>{cp.opportunity.company}{requiredDot}</label>
                        <input id="opp-company" type="text" aria-required="true" placeholder={cp.opportunity.companyPlaceholder} className={inputCls}
                          value={opp.company} onChange={e => setOpp(p => ({ ...p, company: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="opp-type" className={labelCls}>{cp.opportunity.type}{requiredDot}</label>
                        <select id="opp-type" aria-required="true" className={inputCls}
                          value={opp.type} onChange={e => setOpp(p => ({ ...p, type: e.target.value as OpportunityForm['type'] }))}>
                          <option value="" disabled>{cp.opportunity.typePlaceholder}</option>
                          <option value="exjobb">{cp.opportunity.types.exjobb}</option>
                          <option value="jobb">{cp.opportunity.types.jobb}</option>
                          <option value="praktik">{cp.opportunity.types.praktik}</option>
                          <option value="trainee">{cp.opportunity.types.trainee}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="opp-location" className={labelCls}>{cp.opportunity.location}{requiredDot}</label>
                        <input id="opp-location" type="text" aria-required="true" placeholder={cp.opportunity.locationPlaceholder} className={inputCls}
                          value={opp.location} onChange={e => setOpp(p => ({ ...p, location: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="opp-startDate" className={labelCls}>{cp.opportunity.startDate}</label>
                        <input id="opp-startDate" type="text" placeholder={cp.opportunity.startDatePlaceholder} className={inputCls}
                          value={opp.startDate} onChange={e => setOpp(p => ({ ...p, startDate: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="opp-deadline" className={labelCls}>{cp.opportunity.deadline}</label>
                        <input id="opp-deadline" type="date" className={inputCls}
                          value={opp.deadline} onChange={e => setOpp(p => ({ ...p, deadline: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="opp-applyUrl" className={labelCls}>{cp.opportunity.applyUrl}</label>
                      <input id="opp-applyUrl" type="url" placeholder={cp.opportunity.applyUrlPlaceholder} className={inputCls}
                        value={opp.applyUrl} onChange={e => setOpp(p => ({ ...p, applyUrl: e.target.value }))} />
                    </div>

                    <div>
                      <label htmlFor="opp-desc" className={labelCls}>
                        {cp.opportunity.description}
                        <span className="ml-2 font-normal opacity-60">
                          {cp.charCount.replace('{count}', String(opp.description.length))}
                        </span>
                      </label>
                      <textarea id="opp-desc" rows={5} maxLength={2000} placeholder={cp.opportunity.descriptionPlaceholder}
                        className={`${inputCls} resize-y min-h-[120px]`}
                        value={opp.description} onChange={e => setOpp(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div>
                      <label htmlFor="opp-descEn" className={labelCls}>
                        {cp.opportunity.descriptionEn}
                        <span className="ml-2 font-normal opacity-60">
                          {cp.charCount.replace('{count}', String(opp.descriptionEn.length))}
                        </span>
                      </label>
                      <textarea id="opp-descEn" rows={4} maxLength={2000} placeholder={cp.opportunity.descriptionEnPlaceholder}
                        className={`${inputCls} resize-y min-h-[100px]`}
                        value={opp.descriptionEn} onChange={e => setOpp(p => ({ ...p, descriptionEn: e.target.value }))} />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Event form */}
              {activeTab === 'event' && (
                <fieldset>
                  <legend
                    className="text-base font-bold hero-text mb-5"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {cp.event.sectionTitle}
                  </legend>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="evt-title" className={labelCls}>{cp.event.title}{requiredDot}</label>
                        <input id="evt-title" type="text" aria-required="true" placeholder={cp.event.titlePlaceholder} className={inputCls}
                          value={evt.title} onChange={e => setEvt(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="evt-titleEn" className={labelCls}>{cp.event.titleEn}</label>
                        <input id="evt-titleEn" type="text" placeholder={cp.event.titleEnPlaceholder} className={inputCls}
                          value={evt.titleEn} onChange={e => setEvt(p => ({ ...p, titleEn: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="evt-date" className={labelCls}>{cp.event.date}{requiredDot}</label>
                        <input id="evt-date" type="datetime-local" aria-required="true" className={inputCls}
                          value={evt.date} onChange={e => setEvt(p => ({ ...p, date: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="evt-endDate" className={labelCls}>{cp.event.endDate}</label>
                        <input id="evt-endDate" type="datetime-local" className={inputCls}
                          value={evt.endDate} onChange={e => setEvt(p => ({ ...p, endDate: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="evt-location" className={labelCls}>{cp.event.location}{requiredDot}</label>
                        <input id="evt-location" type="text" aria-required="true" placeholder={cp.event.locationPlaceholder} className={inputCls}
                          value={evt.location} onChange={e => setEvt(p => ({ ...p, location: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="evt-section" className={labelCls}>{cp.event.section}{requiredDot}</label>
                        <select id="evt-section" aria-required="true" className={inputCls}
                          value={evt.section} onChange={e => setEvt(p => ({ ...p, section: e.target.value as EventForm['section'] }))}>
                          <option value="" disabled>{cp.event.sectionPlaceholder}</option>
                          <option value="data">{cp.event.sections.data}</option>
                          <option value="geo">{cp.event.sections.geo}</option>
                          <option value="i">{cp.event.sections.i}</option>
                          <option value="maskin">{cp.event.sections.maskin}</option>
                          <option value="general">{cp.event.sections.general}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="evt-tags" className={labelCls}>{cp.event.tags}</label>
                        <input id="evt-tags" type="text" placeholder={cp.event.tagsPlaceholder} className={inputCls}
                          value={evt.tags} onChange={e => setEvt(p => ({ ...p, tags: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="evt-imageUrl" className={labelCls}>{cp.event.imageUrl}</label>
                        <input id="evt-imageUrl" type="url" placeholder={cp.event.imageUrlPlaceholder} className={inputCls}
                          value={evt.imageUrl} onChange={e => setEvt(p => ({ ...p, imageUrl: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="evt-desc" className={labelCls}>
                        {cp.event.description}{requiredDot}
                        <span className="ml-2 font-normal opacity-60">
                          {cp.charCount.replace('{count}', String(evt.description.length))}
                        </span>
                      </label>
                      <textarea id="evt-desc" rows={5} maxLength={2000} aria-required="true" placeholder={cp.event.descriptionPlaceholder}
                        className={`${inputCls} resize-y min-h-[120px]`}
                        value={evt.description} onChange={e => setEvt(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div>
                      <label htmlFor="evt-descEn" className={labelCls}>
                        {cp.event.descriptionEn}
                        <span className="ml-2 font-normal opacity-60">
                          {cp.charCount.replace('{count}', String(evt.descriptionEn.length))}
                        </span>
                      </label>
                      <textarea id="evt-descEn" rows={4} maxLength={2000} placeholder={cp.event.descriptionEnPlaceholder}
                        className={`${inputCls} resize-y min-h-[100px]`}
                        value={evt.descriptionEn} onChange={e => setEvt(p => ({ ...p, descriptionEn: e.target.value }))} />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Deal form */}
              {activeTab === 'deal' && (
                <fieldset>
                  <legend
                    className="text-base font-bold hero-text mb-5"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {cp.deal.sectionTitle}
                  </legend>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="deal-company" className={labelCls}>{cp.deal.company}{requiredDot}</label>
                      <input id="deal-company" type="text" aria-required="true" placeholder={cp.deal.companyPlaceholder} className={inputCls}
                        value={deal.company} onChange={e => setDeal(p => ({ ...p, company: e.target.value }))} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="deal-title" className={labelCls}>{cp.deal.title}{requiredDot}</label>
                        <input id="deal-title" type="text" aria-required="true" placeholder={cp.deal.titlePlaceholder} className={inputCls}
                          value={deal.title} onChange={e => setDeal(p => ({ ...p, title: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="deal-titleEn" className={labelCls}>{cp.deal.titleEn}</label>
                        <input id="deal-titleEn" type="text" placeholder={cp.deal.titleEnPlaceholder} className={inputCls}
                          value={deal.titleEn} onChange={e => setDeal(p => ({ ...p, titleEn: e.target.value }))} />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="deal-desc" className={labelCls}>
                        {cp.deal.description}{requiredDot}
                        <span className="ml-2 font-normal opacity-60">
                          {cp.charCount.replace('{count}', String(deal.description.length))}
                        </span>
                      </label>
                      <textarea id="deal-desc" rows={4} maxLength={2000} aria-required="true" placeholder={cp.deal.descriptionPlaceholder}
                        className={`${inputCls} resize-y min-h-[100px]`}
                        value={deal.description} onChange={e => setDeal(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div>
                      <label htmlFor="deal-descEn" className={labelCls}>
                        {cp.deal.descriptionEn}
                        <span className="ml-2 font-normal opacity-60">
                          {cp.charCount.replace('{count}', String(deal.descriptionEn.length))}
                        </span>
                      </label>
                      <textarea id="deal-descEn" rows={3} maxLength={2000} placeholder={cp.deal.descriptionEnPlaceholder}
                        className={`${inputCls} resize-y min-h-[80px]`}
                        value={deal.descriptionEn} onChange={e => setDeal(p => ({ ...p, descriptionEn: e.target.value }))} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="deal-code" className={labelCls}>{cp.deal.discountCode}</label>
                        <input id="deal-code" type="text" placeholder={cp.deal.discountCodePlaceholder} className={inputCls}
                          value={deal.discountCode} onChange={e => setDeal(p => ({ ...p, discountCode: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="deal-discount" className={labelCls}>{cp.deal.discount}</label>
                        <input id="deal-discount" type="text" placeholder={cp.deal.discountPlaceholder} className={inputCls}
                          value={deal.discount} onChange={e => setDeal(p => ({ ...p, discount: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="deal-link" className={labelCls}>{cp.deal.link}</label>
                        <input id="deal-link" type="url" placeholder={cp.deal.linkPlaceholder} className={inputCls}
                          value={deal.link} onChange={e => setDeal(p => ({ ...p, link: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="deal-logoUrl" className={labelCls}>{cp.deal.logoUrl}</label>
                        <input id="deal-logoUrl" type="url" placeholder={cp.deal.logoUrlPlaceholder} className={inputCls}
                          value={deal.logoUrl} onChange={e => setDeal(p => ({ ...p, logoUrl: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Required note + Submit */}
              <div style={{ borderTop: '1px solid var(--glass-border-subtle)', paddingTop: '1.5rem' }}>
                <p className="text-xs hero-text-muted mb-4">{cp.requiredNote}</p>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
                      role="status"
                      aria-live="polite"
                    >
                      <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} aria-hidden="true" />
                      <p className="text-sm font-medium" style={{ color: '#10B981' }}>{cp.submitSuccess}</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="sm:ml-auto text-xs underline transition-opacity hover:opacity-70 shrink-0"
                        style={{ color: '#10B981' }}
                      >
                        {cp.sendAnother}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form-actions" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-xs hero-text-subtle mb-3">{cp.submitHint}</p>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isValid}
                        aria-label={cp.submitAriaLabel}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-sm sm:text-base text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                        style={
                          isValid
                            ? {
                                background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                                boxShadow: `0 0 28px ${colors.glow}, 0 8px 32px rgba(0,0,0,0.25)`,
                              }
                            : {
                                background: 'var(--glass-bg-subtle)',
                                border: '1px solid var(--glass-border-subtle)',
                                color: 'var(--hero-text-muted)',
                              }
                        }
                      >
                        {cp.submit}
                        <ArrowLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Info banner */}
            <p className="mt-4 text-center text-xs hero-text-muted">
              {cp.infoBanner}
            </p>

          </motion.div>
        </div>
      </section>
    </>
  );
}
