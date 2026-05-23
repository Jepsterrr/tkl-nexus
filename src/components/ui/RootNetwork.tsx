'use client';

import { useRef, useEffect, useState, useCallback, useMemo, useId } from 'react';
import Link from 'next/link';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap, Building2, Briefcase, CalendarDays, Gift,
  PenLine, LayoutGrid, ArrowRight, Phone,
} from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useTheme } from '@/components/providers/ThemeProvider';

// Geometry helpers

type Vec = { x: number; y: number };
function f(n: number) { return n.toFixed(2); }

function getBottomCenter(el: HTMLElement, c: HTMLElement): Vec {
  const er = el.getBoundingClientRect();
  const cr = c.getBoundingClientRect();
  return { x: er.left - cr.left + er.width / 2, y: er.bottom - cr.top };
}

function getTopCenter(el: HTMLElement, c: HTMLElement): Vec {
  const er = el.getBoundingClientRect();
  const cr = c.getBoundingClientRect();
  return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top };
}

function lerp(a: Vec, b: Vec, t: number): Vec {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Slight S-curve trunk */
function trunkD(from: Vec, to: Vec): string {
  const dy = to.y - from.y;
  return (
    `M ${f(from.x)} ${f(from.y)} ` +
    `C ${f(from.x)} ${f(from.y + dy * 0.35)} ` +
    `${f(to.x)} ${f(to.y - dy * 0.15)} ` +
    `${f(to.x)} ${f(to.y)}`
  );
}

/** Branch from junction to leaf */
function branchD(junc: Vec, child: Vec): string {
  const dy = child.y - junc.y;
  return (
    `M ${f(junc.x)} ${f(junc.y)} ` +
    `C ${f(junc.x)} ${f(junc.y + dy * 0.58)} ` +
    `${f(child.x)} ${f(child.y - dy * 0.28)} ` +
    `${f(child.x)} ${f(child.y)}`
  );
}

/** Main branch from central junction to a parent node — fans left or right */
function mainBranchD(from: Vec, to: Vec): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return (
    `M ${f(from.x)} ${f(from.y)} ` +
    `C ${f(from.x + dx * 0.12)} ${f(from.y + dy * 0.52)} ` +
    `${f(to.x - dx * 0.06)} ${f(to.y - dy * 0.22)} ` +
    `${f(to.x)} ${f(to.y)}`
  );
}

/** Small decorative stub off a branch */
function stubD(origin: Vec, angleDeg: number, len: number): string {
  const rad = (angleDeg * Math.PI) / 180;
  const ex = origin.x + Math.cos(rad) * len;
  const ey = origin.y + Math.sin(rad) * len;
  const cpx = origin.x + Math.cos(rad + 0.35) * len * 0.55;
  const cpy = origin.y + Math.sin(rad + 0.35) * len * 0.55;
  return `M ${f(origin.x)} ${f(origin.y)} Q ${f(cpx)} ${f(cpy)} ${f(ex)} ${f(ey)}`;
}

// Types

interface Dest {
  href: string; label: string; desc: string; Icon: LucideIcon; hex: string;
}

interface Stub { origin: Vec; angle: number; len: number }

interface Geometry {
  svgW: number; svgH: number;
  hubBottom: Vec;
  mainJunc: Vec;
  mainTrunk: string;
  mainLeft: string;
  mainRight: string;
  sTrunk: string; sJunc: Vec; sPBY: number;
  sBranches: string[]; sChildTops: Vec[];
  sStubs: Stub[];
  cTrunk: string; cJunc: Vec; cPBY: number;
  cBranches: string[]; cChildTops: Vec[];
  cStubs: Stub[];
}

export interface RootNetworkStrings {
  ctaLabel: string;
  ctaStudents: string; ctaStudentsSub: string;
  ctaCorporate: string; ctaCorporateSub: string;
  subCareerLabel: string; subCareerDesc: string;
  subEventsLabel: string; subEventsDesc: string;
  subDealsLabel: string; subDealsDesc: string;
  subCorporateLabel: string; subCorporateDesc: string;
  subPostLabel: string; subPostDesc: string;
  subServicesLabel: string; subServicesDesc: string;
}

// Stub angle configs
const S_STUB_ANGLES = [-118, -90, -62] as const;
const C_STUB_ANGLES = [-108, -90, -72] as const;
const E = EASE_OUT_EXPO;

// Sub-card component (defined outside RootNetwork to prevent unmount/remount on parent re-render)

interface ChildCardProps {
  d: Dest;
  elRef: React.RefObject<HTMLDivElement | null>;
  delay: number;
  isInView: boolean;
  reduceMotion: boolean | null;
}

function ChildCard({ d, elRef, delay, isInView, reduceMotion }: ChildCardProps) {
  return (
    <motion.div
      ref={elRef}
      initial={{ opacity: 0, y: 12 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduceMotion ? 0 : 0.40, delay, ease: E }}
    >
      <Link
        href={d.href}
        className="group flex flex-col items-start gap-3 p-5 rounded-2xl transition-all duration-200
                   hover:scale-[1.04] active:scale-[0.97] focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          background: 'var(--rn-child-bg)',
          border: `1px solid ${d.hex}38`,
          minHeight: '150px',
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${d.hex}18`, border: `1px solid ${d.hex}35` }}
        >
          <d.Icon className="w-5 h-5" style={{ color: d.hex }} aria-hidden="true" />
        </div>
        <div>
          <div className="text-base font-bold hero-text leading-tight">{d.label}</div>
          <div className="text-sm leading-snug hero-text-muted mt-1 line-clamp-3">{d.desc}</div>
        </div>
      </Link>
    </motion.div>
  );
}

// Component

export function RootNetwork({
  ctaLabel, ctaStudents, ctaStudentsSub, ctaCorporate, ctaCorporateSub,
  subCareerLabel, subCareerDesc,
  subEventsLabel, subEventsDesc,
  subDealsLabel, subDealsDesc,
  subCorporateLabel, subCorporateDesc,
  subPostLabel, subPostDesc,
  subServicesLabel, subServicesDesc,
}: RootNetworkStrings) {

  // Theme — derive colors and opacities from resolved theme
  const { resolved } = useTheme();
  const isLight = resolved === 'light';
  const GREEN  = isLight ? '#047857' : '#10B981';
  const PURPLE = isLight ? '#6D28D9' : '#8B5CF6';
  const RED    = isLight ? '#B90010' : '#E30613';
  const lineO  = isLight ? 0.90 : 0.78;
  const bloomO = isLight ? 0.22 : 0.14;
  const stubO  = isLight ? 0.16 : 0.10;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef       = useRef<HTMLDivElement>(null);
  const sParentRef   = useRef<HTMLDivElement>(null);
  const cParentRef   = useRef<HTMLDivElement>(null);
  const sC0 = useRef<HTMLDivElement>(null);
  const sC1 = useRef<HTMLDivElement>(null);
  const sC2 = useRef<HTMLDivElement>(null);
  const cC0 = useRef<HTMLDivElement>(null);
  const cC1 = useRef<HTMLDivElement>(null);
  const cC2 = useRef<HTMLDivElement>(null);
  const inViewRef = useRef<HTMLDivElement>(null);

  // State
  const [geo, setGeo]      = useState<Geometry | null>(null);
  const isInView           = useInView(inViewRef, { once: true, margin: '-50px' });
  const reduceMotion       = useReducedMotion();
  const filterId           = useId();

  // Measurement
  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;

    const hub = hubRef.current;
    const sp  = sParentRef.current;
    const cp  = cParentRef.current;
    const scs = [sC0.current, sC1.current, sC2.current];
    const ccs = [cC0.current, cC1.current, cC2.current];
    if (!hub || !sp || !cp || scs.some(r => !r) || ccs.some(r => !r)) return;

    const hubB  = getBottomCenter(hub, c);
    const sPT   = getTopCenter(sp, c);
    const cPT   = getTopCenter(cp, c);
    const sPB   = getBottomCenter(sp, c);
    const cPB   = getBottomCenter(cp, c);
    const sTops = (scs as HTMLDivElement[]).map(r => getTopCenter(r, c));
    const cTops = (ccs as HTMLDivElement[]).map(r => getTopCenter(r, c));

    // Offset connection points so branches visually enter into the card boxes
    const ENTER_PARENT = 9; // px inside parent card tops/bottoms
    const ENTER_SUB    = 5; // px inside sub-card tops
    const sPT_in = { x: sPT.x, y: sPT.y + ENTER_PARENT };
    const cPT_in = { x: cPT.x, y: cPT.y + ENTER_PARENT };

    const sTops_in = sTops.map(t => ({ x: t.x, y: t.y + ENTER_SUB }));
    const cTops_in = cTops.map(t => ({ x: t.x, y: t.y + ENTER_SUB }));

    // Central junction: 55% from hub bottom toward midpoint of parent outer tops
    const midParentY = (sPT.y + cPT.y) / 2;
    const mainJunc: Vec = { x: hubB.x, y: hubB.y + (midParentY - hubB.y) * 0.55 };

    // Sub-junctions: 40% from each parent inner bottom toward avg inner child top
    const sAvgY = sTops_in.reduce((s, v) => s + v.y, 0) / 3;
    const cAvgY = cTops_in.reduce((s, v) => s + v.y, 0) / 3;
    const sJunc: Vec = { x: sPB.x, y: sPB.y + (sAvgY - sPB.y) * 0.40 };
    const cJunc: Vec = { x: cPB.x, y: cPB.y + (cAvgY - cPB.y) * 0.40 };

    // Decorative stubs along sub-branches
    const sStubs: Stub[] = sTops_in.map((top, i) => ({
      origin: lerp(sJunc, top, 0.58),
      angle: S_STUB_ANGLES[i],
      len: 20 + i * 6,
    }));
    const cStubs: Stub[] = cTops_in.map((top, i) => ({
      origin: lerp(cJunc, top, 0.58),
      angle: C_STUB_ANGLES[i],
      len: 18 + i * 5,
    }));

    const cr = c.getBoundingClientRect();
    setGeo({
      svgW: cr.width, svgH: cr.height,
      hubBottom: hubB,
      mainJunc,
      mainTrunk: trunkD(hubB, mainJunc),
      mainLeft:  mainBranchD(mainJunc, sPT_in),
      mainRight: mainBranchD(mainJunc, cPT_in),
      sTrunk: trunkD(sPB, sJunc), sJunc, sPBY: sPB.y,
      sBranches: sTops_in.map(t => branchD(sJunc, t)), sChildTops: sTops_in, sStubs,
      cTrunk: trunkD(cPB, cJunc), cJunc, cPBY: cPB.y,
      cBranches: cTops_in.map(t => branchD(cJunc, t)), cChildTops: cTops_in, cStubs,
    });
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const t = setTimeout(measure, 80);
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [measure]);

  // Re-measure on theme change so geometry reflects new layout if anything shifts
  useEffect(() => { measure(); }, [isLight, measure]);

  // Destination data
  const STUDENT_DESTS = useMemo<Dest[]>(() => [
    { href: '/career',         label: subCareerLabel, desc: subCareerDesc, Icon: Briefcase,    hex: '#3B82F6' },
    { href: '/events',         label: subEventsLabel, desc: subEventsDesc, Icon: CalendarDays, hex: '#8B5CF6' },
    { href: '/students/deals', label: subDealsLabel,  desc: subDealsDesc,  Icon: Gift,         hex: '#F59E0B' },
  ], [subCareerLabel, subCareerDesc, subEventsLabel, subEventsDesc, subDealsLabel, subDealsDesc]);

  const CORPORATE_DESTS = useMemo<Dest[]>(() => [
    { href: '/corporate/post',     label: subPostLabel,      desc: subPostDesc,      Icon: PenLine,    hex: '#3B82F6' },
    { href: '/corporate/services', label: subServicesLabel,  desc: subServicesDesc,  Icon: LayoutGrid, hex: '#8B5CF6' },
    { href: '/about#kontakt',      label: subCorporateLabel, desc: subCorporateDesc, Icon: Phone,      hex: '#E30613' },
  ], [subPostLabel, subPostDesc, subServicesLabel, subServicesDesc, subCorporateLabel, subCorporateDesc]);

  // Animation helpers
  const pathAnim = (delay: number, dur: number, finalOpacity = 1) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: isInView ? { pathLength: 1, opacity: finalOpacity } : { pathLength: 0, opacity: 0 },
    transition: {
      pathLength: { duration: reduceMotion ? 0 : dur, delay, ease: E },
      opacity:    { duration: 0.12, delay },
    },
  });

  const dotAnim = (delay: number) => ({
    initial: { scale: 0, opacity: 0 },
    animate: isInView ? { scale: 1, opacity: 0.88 } : { scale: 0, opacity: 0 },
    transition: { duration: reduceMotion ? 0 : 0.28, delay, ease: E },
  });

  // Row layout data (stagger offsets in px)
  const STUDENT_ROWS = [
    { d: STUDENT_DESTS[0],   elRef: sC0, pt: 0,  delay: 1.10 },
    { d: STUDENT_DESTS[1],   elRef: sC1, pt: 40, delay: 1.20 },
    { d: STUDENT_DESTS[2],   elRef: sC2, pt: 16, delay: 1.30 },
  ];
  const CORPORATE_ROWS = [
    { d: CORPORATE_DESTS[0], elRef: cC0, pt: 24, delay: 1.30 },
    { d: CORPORATE_DESTS[1], elRef: cC1, pt: 0,  delay: 1.40 },
    { d: CORPORATE_DESTS[2], elRef: cC2, pt: 20, delay: 1.50 },
  ];

  return (
    <div ref={inViewRef} className="w-full" aria-labelledby="rootnetwork-heading">

      {/* Section heading */}
      <h2
        id="rootnetwork-heading"
        className="text-xs font-semibold uppercase tracking-widest hero-text-subtle mb-10 text-center"
      >
        {ctaLabel}
      </h2>

      {/* Desktop */}
      <div ref={containerRef} className="relative hidden sm:block">

        {/* SVG overlay */}
        {geo && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={geo.svgW}
            height={geo.svgH}
            aria-hidden="true"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <filter id={filterId} x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="7" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <clipPath id={`${filterId}-cs`}>
                <rect x={0} y={geo.sPBY} width={geo.svgW} height={geo.svgH} />
              </clipPath>
              <clipPath id={`${filterId}-cc`}>
                <rect x={0} y={geo.cPBY} width={geo.svgW} height={geo.svgH} />
              </clipPath>
            </defs>

            {/* Main trunk: hub to central junction */}
            <motion.path d={geo.mainTrunk} fill="none" strokeWidth={14} strokeLinecap="round"
              filter={`url(#${filterId})`} style={{ stroke: RED }}
              {...pathAnim(0.15, 0.25, bloomO)} />
            <g className="rn-path-crisp">
              <motion.path d={geo.mainTrunk} fill="none" strokeWidth={4} strokeLinecap="round"
                style={{ stroke: RED }}
                {...pathAnim(0.15, 0.25, lineO)} />
            </g>

            {/* Main left branch: junction to student parent */}
            <motion.path d={geo.mainLeft} fill="none" strokeWidth={9} strokeLinecap="round"
              filter={`url(#${filterId})`} style={{ stroke: GREEN }}
              {...pathAnim(0.35, 0.38, bloomO)} />
            <g className="rn-path-crisp">
              <motion.path d={geo.mainLeft} fill="none" strokeWidth={3} strokeLinecap="round"
                style={{ stroke: GREEN }}
                {...pathAnim(0.35, 0.38, lineO)} />
            </g>

            {/* Main right branch: junction to corporate parent */}
            <motion.path d={geo.mainRight} fill="none" strokeWidth={9} strokeLinecap="round"
              filter={`url(#${filterId})`} style={{ stroke: PURPLE }}
              {...pathAnim(0.35, 0.38, bloomO)} />
            <g className="rn-path-crisp">
              <motion.path d={geo.mainRight} fill="none" strokeWidth={3} strokeLinecap="round"
                style={{ stroke: PURPLE }}
                {...pathAnim(0.35, 0.38, lineO)} />
            </g>

            {/* Central junction dot */}
            <motion.circle cx={geo.mainJunc.x} cy={geo.mainJunc.y} r={5.5}
              filter={`url(#${filterId})`}
              {...dotAnim(0.53)}
              style={{ fill: RED, transformOrigin: `${geo.mainJunc.x}px ${geo.mainJunc.y}px` }}
            />

            {/* Student trunk */}
            <motion.path d={geo.sTrunk} fill="none" strokeWidth={9} strokeLinecap="round"
              filter={`url(#${filterId})`} style={{ stroke: GREEN }}
              clipPath={`url(#${filterId}-cs)`}
              {...pathAnim(0.75, 0.28, bloomO)} />
            <g className="rn-path-crisp">
              <motion.path d={geo.sTrunk} fill="none" strokeWidth={2.5} strokeLinecap="round"
                style={{ stroke: GREEN }}
                {...pathAnim(0.75, 0.28, lineO)} />
            </g>

            {/* Corporate trunk */}
            <motion.path d={geo.cTrunk} fill="none" strokeWidth={9} strokeLinecap="round"
              filter={`url(#${filterId})`} style={{ stroke: PURPLE }}
              clipPath={`url(#${filterId}-cc)`}
              {...pathAnim(0.85, 0.28, bloomO)} />
            <g className="rn-path-crisp">
              <motion.path d={geo.cTrunk} fill="none" strokeWidth={2.5} strokeLinecap="round"
                style={{ stroke: PURPLE }}
                {...pathAnim(0.85, 0.28, lineO)} />
            </g>

            {/* Student sub-junction dot */}
            <motion.circle cx={geo.sJunc.x} cy={geo.sJunc.y} r={4.5}
              filter={`url(#${filterId})`}
              {...dotAnim(0.74)}
              style={{ fill: GREEN, transformOrigin: `${geo.sJunc.x}px ${geo.sJunc.y}px` }}
            />

            {/* Corporate sub-junction dot */}
            <motion.circle cx={geo.cJunc.x} cy={geo.cJunc.y} r={4.5}
              filter={`url(#${filterId})`}
              {...dotAnim(0.84)}
              style={{ fill: PURPLE, transformOrigin: `${geo.cJunc.x}px ${geo.cJunc.y}px` }}
            />

            {/* Student sub-branches */}
            {geo.sBranches.map((d, i) => (
              <g key={`sb${i}`}>
                <motion.path d={d} fill="none" strokeWidth={6} strokeLinecap="round"
                  filter={`url(#${filterId})`} style={{ stroke: GREEN }}
                  {...pathAnim(0.90 + i * 0.08, 0.48, bloomO)} />
                <g className="rn-path-crisp">
                  <motion.path d={d} fill="none" strokeWidth={1.5} strokeLinecap="round"
                    style={{ stroke: GREEN }}
                    {...pathAnim(0.90 + i * 0.08, 0.48, lineO)} />
                </g>
              </g>
            ))}

            {/* Corporate sub-branches */}
            {geo.cBranches.map((d, i) => (
              <g key={`cb${i}`}>
                <motion.path d={d} fill="none" strokeWidth={6} strokeLinecap="round"
                  filter={`url(#${filterId})`} style={{ stroke: PURPLE }}
                  {...pathAnim(1.08 + i * 0.08, 0.48, bloomO)} />
                <g className="rn-path-crisp">
                  <motion.path d={d} fill="none" strokeWidth={1.5} strokeLinecap="round"
                    style={{ stroke: PURPLE }}
                    {...pathAnim(1.08 + i * 0.08, 0.48, lineO)} />
                </g>
              </g>
            ))}

            {/* Decorative stubs — student */}
            {geo.sStubs.map((s, i) => {
              const d = stubD(s.origin, s.angle, s.len);
              return (
                <g key={`ss${i}`}>
                  <motion.path d={d} fill="none" strokeWidth={4} strokeLinecap="round"
                    filter={`url(#${filterId})`} style={{ stroke: GREEN }}
                    {...pathAnim(1.55 + i * 0.07, 0.22, stubO)} />
                  <g className="rn-path-crisp">
                    <motion.path d={d} fill="none" strokeWidth={0.9} strokeLinecap="round"
                      style={{ stroke: GREEN }}
                      {...pathAnim(1.55 + i * 0.07, 0.22, lineO * 0.55)} />
                  </g>
                </g>
              );
            })}

            {/* Decorative stubs — corporate */}
            {geo.cStubs.map((s, i) => {
              const d = stubD(s.origin, s.angle, s.len);
              return (
                <g key={`cs${i}`}>
                  <motion.path d={d} fill="none" strokeWidth={4} strokeLinecap="round"
                    filter={`url(#${filterId})`} style={{ stroke: PURPLE }}
                    {...pathAnim(1.70 + i * 0.07, 0.22, stubO)} />
                  <g className="rn-path-crisp">
                    <motion.path d={d} fill="none" strokeWidth={0.9} strokeLinecap="round"
                      style={{ stroke: PURPLE }}
                      {...pathAnim(1.70 + i * 0.07, 0.22, lineO * 0.55)} />
                  </g>
                </g>
              );
            })}

            {/* Endpoint circles — student leaves */}
            {geo.sChildTops.map((pos, i) => (
              <motion.circle key={`scd${i}`}
                cx={pos.x} cy={pos.y} r={3}
                {...dotAnim(1.08 + i * 0.10)}
                style={{ fill: STUDENT_DESTS[i].hex, transformOrigin: `${pos.x}px ${pos.y}px` }}
              />
            ))}

            {/* Endpoint circles — corporate leaves */}
            {geo.cChildTops.map((pos, i) => (
              <motion.circle key={`ccd${i}`}
                cx={pos.x} cy={pos.y} r={3}
                {...dotAnim(1.28 + i * 0.10)}
                style={{ fill: CORPORATE_DESTS[i].hex, transformOrigin: `${pos.x}px ${pos.y}px` }}
              />
            ))}
          </svg>
        )}

        {/* Row 1: Central NEXUS hub */}
        <div className="flex justify-center">
          <motion.div
            ref={hubRef}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.40, ease: E }}
            className="relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl"
            style={{
              background: 'var(--about-card-bg)',
              border: '1px solid var(--rn-red)',
              boxShadow: '0 0 22px var(--rn-red-glow)',
            }}
          >
            <motion.span
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: '1px solid var(--rn-red)', opacity: 0 }}
              animate={reduceMotion ? { scale: 1, opacity: 0 } : { scale: [1, 1.20], opacity: [0.45, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
            <span aria-hidden="true" style={{ color: 'var(--rn-red)', fontSize: '18px' }}>⬡</span>
            <span
              className="text-sm font-black tracking-widest uppercase"
              style={{ color: 'var(--rn-red)', fontFamily: 'var(--font-heading)' }}
            >
              NEXUS
            </span>
          </motion.div>
        </div>

        {/* Row 2: Parent nodes */}
        <div className="flex justify-between items-start mt-16 gap-8">
          <motion.div
            ref={sParentRef}
            className="flex-1"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.48, delay: 0.55, ease: E }}
          >
            <Link
              href="/students"
              className="group flex items-center gap-4 rounded-3xl px-7 py-6 transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ background: 'var(--glass-green-bg)', border: '1px solid var(--glass-green-border)' }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--glass-green-bg)', border: '1px solid var(--glass-green-border)' }}>
                <GraduationCap className="w-5 h-5" style={{ color: 'var(--rn-green)' }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold hero-text">{ctaStudents}</div>
                <div className="text-xs hero-text-muted mt-0.5">{ctaStudentsSub}</div>
              </div>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-all duration-200 group-hover:translate-x-0.5 shrink-0"
                style={{ color: 'var(--rn-green)' }} aria-hidden="true"
              />
            </Link>
          </motion.div>

          <motion.div
            ref={cParentRef}
            className="flex-1"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.48, delay: 0.65, ease: E }}
          >
            <Link
              href="/corporate"
              className="group flex items-center gap-4 rounded-3xl px-7 py-6 transition-all duration-200
                         hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ background: 'var(--glass-purple-bg)', border: '1px solid var(--glass-purple-border)' }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--glass-purple-bg)', border: '1px solid var(--glass-purple-border)' }}>
                <Building2 className="w-5 h-5" style={{ color: 'var(--rn-purple)' }} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold hero-text">{ctaCorporate}</div>
                <div className="text-xs hero-text-muted mt-0.5">{ctaCorporateSub}</div>
              </div>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-all duration-200 group-hover:translate-x-0.5 shrink-0"
                style={{ color: 'var(--rn-purple)' }} aria-hidden="true"
              />
            </Link>
          </motion.div>
        </div>

        {/* Row 3: Staggered leaf sub-cards */}
        <div className="flex justify-between mt-16 gap-8">
          {/* Student leaves */}
          <div className="flex-1 flex gap-4">
            {STUDENT_ROWS.map(({ d, elRef, pt, delay }) => (
              <div key={d.href} style={{ paddingTop: pt, flex: 1 }}>
                <ChildCard key={d.href} d={d} elRef={elRef} delay={delay} isInView={isInView} reduceMotion={reduceMotion} />
              </div>
            ))}
          </div>
          {/* Corporate leaves */}
          <div className="flex-1 flex gap-4" style={{ paddingTop: '48px' }}>
            {CORPORATE_ROWS.map(({ d, elRef, pt, delay }) => (
              <div key={d.href} style={{ paddingTop: pt, flex: 1 }}>
                <ChildCard key={d.href} d={d} elRef={elRef} delay={delay} isInView={isInView} reduceMotion={reduceMotion} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-3">
        {/* Students */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5"
          style={{ background: 'var(--about-card-bg)', border: '1px solid var(--glass-green-border)' }}
        >
          <Link
            href="/students"
            className="group flex items-center gap-3 pb-2.5 min-h-13"
            style={{ borderBottom: '1px solid var(--glass-border-subtle)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--glass-green-bg)' }}>
              <GraduationCap className="w-4 h-4" style={{ color: 'var(--rn-green)' }} aria-hidden="true" />
            </div>
            <span className="text-sm font-bold hero-text flex-1">{ctaStudents}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
              style={{ color: 'var(--rn-green)' }} aria-hidden="true" />
          </Link>
          {STUDENT_DESTS.map(({ href, label, desc, Icon, hex }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-3 px-2 py-3 rounded-xl min-h-12 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Icon className="w-5 h-5 shrink-0" style={{ color: hex }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold hero-text">{label}</div>
                <div className="text-xs hero-text-muted truncate">{desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: hex }} aria-hidden="true" />
            </Link>
          ))}
        </div>

        {/* Corporate */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-1.5"
          style={{ background: 'var(--about-card-bg)', border: '1px solid var(--glass-purple-border)' }}
        >
          <Link
            href="/corporate"
            className="group flex items-center gap-3 pb-2.5 min-h-13"
            style={{ borderBottom: '1px solid var(--glass-border-subtle)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--glass-purple-bg)' }}>
              <Building2 className="w-4 h-4" style={{ color: 'var(--rn-purple)' }} aria-hidden="true" />
            </div>
            <span className="text-sm font-bold hero-text flex-1">{ctaCorporate}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
              style={{ color: 'var(--rn-purple)' }} aria-hidden="true" />
          </Link>
          {CORPORATE_DESTS.map(({ href, label, desc, Icon, hex }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-3 px-2 py-3 rounded-xl min-h-12 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Icon className="w-5 h-5 shrink-0" style={{ color: hex }} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold hero-text">{label}</div>
                <div className="text-xs hero-text-muted truncate">{desc}</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 ml-auto shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ color: hex }} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
