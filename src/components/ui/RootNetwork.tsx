'use client';

import { useRef, useEffect, useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { capture } from '@/lib/analytics';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  GraduationCap, Building2, Briefcase, CalendarDays, Gift,
  PenLine, LayoutGrid, ArrowRight, Phone,
} from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { useTheme } from '@/components/providers/ThemeProvider';
import { DEALS_ENABLED } from '@/lib/features';

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
  sTrunk: string; sJunc: Vec;
  sBranches: string[]; sBranchGlow: boolean[]; sChildTops: Vec[];
  sStubs: Stub[];
  cTrunk: string; cJunc: Vec;
  cBranches: string[]; cBranchGlow: boolean[]; cChildTops: Vec[];
  cStubs: Stub[];
}

interface MobileGeometry {
  svgW: number; svgH: number;
  hubBottom: Vec;
  mainJunc: Vec;
  mainTrunk: string;
  mainLeft: string;
  mainRight: string;
  mSTrunk: string; mSJunc: Vec; mSPBY: number;
  mCTrunk: string; mCJunc: Vec; mCPBY: number;
  mSBranches: string[]; mSChildTops: Vec[];
  mCBranches: string[]; mCChildTops: Vec[];
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

// Stub angle configs - [outermost-left, outermost-right] range, spread evenly over 1–3 children
const S_STUB_RANGE = [-118, -62] as const;
const C_STUB_RANGE = [-108, -72] as const;
function stubAngle(range: readonly [number, number], i: number, n: number): number {
  if (n <= 1) return (range[0] + range[1]) / 2;
  return range[0] + (range[1] - range[0]) * (i / (n - 1));
}

// Desktop row stagger (index-based; arrays sized for max 3 children per branch)
const S_PT    = [0, 40, 16] as const;
const S_DELAY = [1.10, 1.20, 1.30] as const;
const C_PT    = [24, 0, 20] as const;
const C_DELAY = [1.30, 1.40, 1.50] as const;
const E = EASE_OUT_EXPO;

// Rendera bara trädet som syns (Tailwind `sm` = 40rem) — tidigare monterades och
// animerades både desktop- och mobilträdet, det dolda i display:none.
const SM_QUERY = '(min-width: 40rem)';
function subscribeSm(cb: () => void) {
  const mq = window.matchMedia(SM_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const getSm = () => window.matchMedia(SM_QUERY).matches;
const getSmServer = () => true;

// Sista uppritningen klar (s): desktop-stubbar 1.70 + 2·0.07 + 0.22, mobil-prick 0.53 + 0.28
const DRAW_END_DESKTOP = 2.2;
const DRAW_END_MOBILE = 0.9;

// Glow tidigare: SVG-filter (feGaussianBlur + feMerge med SourceGraphic) per element.
// Element med noll-bredd-bbox (lodräta stammar, gren rakt under sin junction) renderades
// inte alls av objectBoundingBox-filterregionen — `glow: false` bevarar exakt det utseendet.
const MIN_GLOW_EXTENT = 1;

// SVG layers — uppritning via CSS (pathLength=1, stroke-dashoffset + opacity),
// glow som ETT blur-lager istället för ett filter per animerad stig

interface StrokeSpec {
  d: string; color: string;
  bloomW: number; crispW: number;
  bloomO: number; crispO: number;
  delay: number; dur: number;
  glow: boolean;
}

interface DotSpec { x: number; y: number; r: number; color: string; delay: number; glow: boolean }

type AnimVars = React.CSSProperties & Record<'--rn-o' | '--rn-delay' | '--rn-dur', string | number>;

function drawStyle(o: number, delay: number, dur: number): AnimVars {
  return { '--rn-o': o, '--rn-delay': `${delay}s`, '--rn-dur': `${dur}s` };
}

interface TreeLayersProps {
  w: number; h: number;
  strokes: StrokeSpec[]; dots: DotSpec[];
  blur: number;
  live: boolean;      // i viewport — starta CSS-animationerna
  drawing: boolean;   // uppritning pågår — filterlagren komponeras på GPU (will-change)
  isLight: boolean;
}

function TreeLayers({ w, h, strokes, dots, blur, live, drawing, isLight }: TreeLayersProps) {
  const base = `absolute inset-0 pointer-events-none${live ? ' rn-live' : ''}`;
  const layer = { width: w, height: h, 'aria-hidden': true } as const;
  const glowStrokes = strokes.filter(s => s.glow);
  return (
    <>
      {/* Glow (blurrad kopia): ett lager, en blur-pass. Komponerat endast under uppritningen —
          efteråt rastras det en gång och cachas som tidigare. */}
      <svg {...layer} className={`${base}${drawing ? ' rn-drawing' : ''}`}
        style={{ overflow: 'visible', filter: `blur(${blur}px)` }}>
        {glowStrokes.map((s, i) => (
          <path key={i} d={s.d} pathLength={1} className="rn-draw" fill="none"
            stroke={s.color} strokeWidth={s.bloomW} strokeLinecap="round"
            style={drawStyle(s.bloomO, s.delay, s.dur)} />
        ))}
        {dots.filter(d => d.glow).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} className="rn-pop" fill={d.color}
            style={drawStyle(0.88, d.delay, 0.28)} />
        ))}
      </svg>

      {/* Glow (skarp SourceGraphic-del) */}
      <svg {...layer} className={base} style={{ overflow: 'visible' }}>
        {glowStrokes.map((s, i) => (
          <path key={i} d={s.d} pathLength={1} className="rn-draw" fill="none"
            stroke={s.color} strokeWidth={s.bloomW} strokeLinecap="round"
            style={drawStyle(s.bloomO, s.delay, s.dur)} />
        ))}
      </svg>

      {/* Skarpa linjer — ljust tema: drop-shadow (.rn-path-crisp) på hela lagret i stället för per stig */}
      <svg {...layer} className={`${base} rn-path-crisp${drawing && isLight ? ' rn-drawing' : ''}`}
        style={{ overflow: 'visible' }}>
        {strokes.map((s, i) => (
          <path key={i} d={s.d} pathLength={1} className="rn-draw" fill="none"
            stroke={s.color} strokeWidth={s.crispW} strokeLinecap="round"
            style={drawStyle(s.crispO, s.delay, s.dur)} />
        ))}
      </svg>

      {/* Junction- och ändpunktsprickar */}
      <svg {...layer} className={base} style={{ overflow: 'visible' }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} className="rn-pop" fill={d.color}
            style={drawStyle(0.88, d.delay, 0.28)} />
        ))}
      </svg>
    </>
  );
}

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
        onClick={() => capture('home_network_clicked', { destination: d.href, label: d.label })}
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

function MobileChildCard({ d, elRef, delay, isInView, reduceMotion }: ChildCardProps) {
  return (
    <motion.div
      ref={elRef}
      initial={{ opacity: 0, y: 8 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: reduceMotion ? 0 : 0.30, delay, ease: E }}
    >
      <Link
        href={d.href}
        className="flex items-center gap-2.5 px-3 rounded-xl transition-all duration-200
                   hover:scale-[1.02] active:scale-[0.97] focus-visible:outline-none
                   focus-visible:ring-2 focus-visible:ring-offset-2 min-h-11"
        style={{
          background: 'var(--rn-child-bg)',
          border: `1px solid ${d.hex}38`,
        }}
        onClick={() => capture('home_network_clicked', { destination: d.href, label: d.label })}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${d.hex}18`, border: `1px solid ${d.hex}35` }}
        >
          <d.Icon className="w-3.5 h-3.5" style={{ color: d.hex }} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold hero-text leading-tight">{d.label}</div>
          <div className="text-xs leading-snug hero-text-muted line-clamp-2">{d.desc}</div>
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

  // Mobile refs
  const mContainerRef = useRef<HTMLDivElement>(null);
  const mHubRef       = useRef<HTMLDivElement>(null);
  const mSParentRef   = useRef<HTMLDivElement>(null);
  const mCParentRef   = useRef<HTMLDivElement>(null);
  const mSC0 = useRef<HTMLDivElement>(null);
  const mSC1 = useRef<HTMLDivElement>(null);
  const mSC2 = useRef<HTMLDivElement>(null);
  const mCC0 = useRef<HTMLDivElement>(null);
  const mCC1 = useRef<HTMLDivElement>(null);
  const mCC2 = useRef<HTMLDivElement>(null);

  // Ref slots per branch (only the first N are mounted, N = number of destinations)
  const sRefs  = [sC0, sC1, sC2];
  const cRefs  = [cC0, cC1, cC2];
  const mSRefs = [mSC0, mSC1, mSC2];
  const mCRefs = [mCC0, mCC1, mCC2];

  // State
  const [geo, setGeo]      = useState<Geometry | null>(null);
  const [mobileGeo, setMobileGeo] = useState<MobileGeometry | null>(null);
  const isInView           = useInView(inViewRef, { once: true, margin: '-50px' });
  const reduceMotion       = useReducedMotion();
  const isDesktop          = useSyncExternalStore(subscribeSm, getSm, getSmServer);
  const [drawn, setDrawn]  = useState(false);

  // Hoppa över setState när geometrin är oförändrad (ResizeObserver + timeout + tema
  // gav annars flera identiska omrenderingar av hela trädet)
  const geoKey  = useRef('');
  const mGeoKey = useRef('');

  // Measurement
  const measure = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;

    const hub = hubRef.current;
    const sp  = sParentRef.current;
    const cp  = cParentRef.current;
    // Only mounted children (branch may have 1–3 destinations)
    const scs = [sC0.current, sC1.current, sC2.current].filter((r): r is HTMLDivElement => r !== null);
    const ccs = [cC0.current, cC1.current, cC2.current].filter((r): r is HTMLDivElement => r !== null);
    if (!hub || !sp || !cp || scs.length === 0 || ccs.length === 0) return;

    const hubB  = getBottomCenter(hub, c);
    const sPT   = getTopCenter(sp, c);
    const cPT   = getTopCenter(cp, c);
    const sPB   = getBottomCenter(sp, c);
    const cPB   = getBottomCenter(cp, c);
    const sTops = scs.map(r => getTopCenter(r, c));
    const cTops = ccs.map(r => getTopCenter(r, c));

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
    const sAvgY = sTops_in.reduce((s, v) => s + v.y, 0) / sTops_in.length;
    const cAvgY = cTops_in.reduce((s, v) => s + v.y, 0) / cTops_in.length;
    const sJunc: Vec = { x: sPB.x, y: sPB.y + (sAvgY - sPB.y) * 0.40 };
    const cJunc: Vec = { x: cPB.x, y: cPB.y + (cAvgY - cPB.y) * 0.40 };

    // Decorative stubs along sub-branches
    const sStubs: Stub[] = sTops_in.map((top, i) => ({
      origin: lerp(sJunc, top, 0.58),
      angle: stubAngle(S_STUB_RANGE, i, sTops_in.length),
      len: 20 + i * 6,
    }));
    const cStubs: Stub[] = cTops_in.map((top, i) => ({
      origin: lerp(cJunc, top, 0.58),
      angle: stubAngle(C_STUB_RANGE, i, cTops_in.length),
      len: 18 + i * 5,
    }));

    const cr = c.getBoundingClientRect();
    const next: Geometry = {
      svgW: cr.width, svgH: cr.height,
      hubBottom: hubB,
      mainJunc,
      mainTrunk: trunkD(hubB, mainJunc),
      mainLeft:  mainBranchD(mainJunc, sPT_in),
      mainRight: mainBranchD(mainJunc, cPT_in),
      sTrunk: trunkD(sPB, sJunc), sJunc,
      sBranches: sTops_in.map(t => branchD(sJunc, t)),
      sBranchGlow: sTops_in.map(t => Math.abs(t.x - sJunc.x) >= MIN_GLOW_EXTENT),
      sChildTops: sTops_in, sStubs,
      cTrunk: trunkD(cPB, cJunc), cJunc,
      cBranches: cTops_in.map(t => branchD(cJunc, t)),
      cBranchGlow: cTops_in.map(t => Math.abs(t.x - cJunc.x) >= MIN_GLOW_EXTENT),
      cChildTops: cTops_in, cStubs,
    };
    const key = JSON.stringify(next);
    if (key === geoKey.current) return;
    geoKey.current = key;
    setGeo(next);
  }, []);

  // Mobile measurement
  const measureMobile = useCallback(() => {
    const c = mContainerRef.current;
    if (!c) return;

    const hub = mHubRef.current;
    const sp  = mSParentRef.current;
    const cp  = mCParentRef.current;
    const scs = [mSC0.current, mSC1.current, mSC2.current].filter((r): r is HTMLDivElement => r !== null);
    const ccs = [mCC0.current, mCC1.current, mCC2.current].filter((r): r is HTMLDivElement => r !== null);
    if (!hub || !sp || !cp || scs.length === 0 || ccs.length === 0) return;

    const hubB  = getBottomCenter(hub, c);
    const sPT   = getTopCenter(sp, c);
    const cPT   = getTopCenter(cp, c);
    const sPB   = getBottomCenter(sp, c);
    const cPB   = getBottomCenter(cp, c);
    const sTops = scs.map(r => getTopCenter(r, c));
    const cTops = ccs.map(r => getTopCenter(r, c));

    const ENTER_PARENT = 9;
    const ENTER_SUB    = 5;
    const sPT_in = { x: sPT.x, y: sPT.y + ENTER_PARENT };
    const cPT_in = { x: cPT.x, y: cPT.y + ENTER_PARENT };
    const sTops_in = sTops.map(t => ({ x: t.x, y: t.y + ENTER_SUB }));
    const cTops_in = cTops.map(t => ({ x: t.x, y: t.y + ENTER_SUB }));

    const midParentY = (sPT.y + cPT.y) / 2;
    const mainJunc: Vec = { x: hubB.x, y: hubB.y + (midParentY - hubB.y) * 0.55 };

    const sAvgY = sTops_in.reduce((s, v) => s + v.y, 0) / sTops_in.length;
    const cAvgY = cTops_in.reduce((s, v) => s + v.y, 0) / cTops_in.length;
    const mSJunc: Vec = { x: sPB.x, y: sPB.y + (sAvgY - sPB.y) * 0.40 };
    const mCJunc: Vec = { x: cPB.x, y: cPB.y + (cAvgY - cPB.y) * 0.40 };

    const cr = c.getBoundingClientRect();
    if (cr.width === 0) return; // container is CSS-hidden on desktop (sm:hidden)
    const next: MobileGeometry = {
      svgW: cr.width, svgH: cr.height,
      hubBottom: hubB,
      mainJunc,
      mainTrunk: trunkD(hubB, mainJunc),
      mainLeft:  mainBranchD(mainJunc, sPT_in),
      mainRight: mainBranchD(mainJunc, cPT_in),
      mSTrunk: trunkD(sPB, mSJunc), mSJunc, mSPBY: sPB.y,
      mCTrunk: trunkD(cPB, mCJunc), mCJunc, mCPBY: cPB.y,
      mSBranches: sTops_in.map(t => branchD(mSJunc, t)), mSChildTops: sTops_in,
      mCBranches: cTops_in.map(t => branchD(mCJunc, t)), mCChildTops: cTops_in,
    };
    const key = JSON.stringify(next);
    if (key === mGeoKey.current) return;
    mGeoKey.current = key;
    setMobileGeo(next);
  }, []);

  // Mät det aktiva trädet: vid mount, efter 80 ms, vid storleksändring och vid temabyte.
  // Samlas till max en mätning per frame (rAF).
  useEffect(() => {
    const c = (isDesktop ? containerRef : mContainerRef).current;
    if (!c) return;
    const run = isDesktop ? measure : measureMobile;
    let raf = 0;
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(run); };
    schedule();
    const t = setTimeout(schedule, 80);
    const ro = new ResizeObserver(schedule);
    ro.observe(c);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); ro.disconnect(); };
  }, [isDesktop, isLight, measure, measureMobile]);

  // Uppritningen klar → släpp GPU-lagren (will-change) så att glow rastras en gång och cachas
  useEffect(() => {
    if (!isInView) return;
    const t = setTimeout(() => setDrawn(true), (isDesktop ? DRAW_END_DESKTOP : DRAW_END_MOBILE) * 1000);
    return () => clearTimeout(t);
  }, [isInView, isDesktop]);

  // Destination data
  const STUDENT_DESTS = useMemo<Dest[]>(() => [
    { href: '/career',         label: subCareerLabel, desc: subCareerDesc, Icon: Briefcase,    hex: '#3B82F6' },
    { href: '/events',         label: subEventsLabel, desc: subEventsDesc, Icon: CalendarDays, hex: '#8B5CF6' },
    ...(DEALS_ENABLED
      ? [{ href: '/students/deals', label: subDealsLabel, desc: subDealsDesc, Icon: Gift, hex: '#F59E0B' }]
      : []),
  ], [subCareerLabel, subCareerDesc, subEventsLabel, subEventsDesc, subDealsLabel, subDealsDesc]);

  const CORPORATE_DESTS = useMemo<Dest[]>(() => [
    { href: '/corporate/post',     label: subPostLabel,      desc: subPostDesc,      Icon: PenLine,    hex: '#3B82F6' },
    { href: '/corporate/services', label: subServicesLabel,  desc: subServicesDesc,  Icon: LayoutGrid, hex: '#8B5CF6' },
    { href: '/about#kontakt',      label: subCorporateLabel, desc: subCorporateDesc, Icon: Phone,      hex: '#E30613' },
  ], [subPostLabel, subPostDesc, subServicesLabel, subServicesDesc, subCorporateLabel, subCorporateDesc]);

  // SVG layer specs — samma bredder, färger, opaciteter, delays och durationer som tidigare
  // motion.path-/motion.circle-versionen (ordning: stam → huvudgrenar → stammar → grenar → stubbar)
  const desktopLayers = useMemo(() => {
    if (!geo) return null;
    const strokes: StrokeSpec[] = [
      { d: geo.mainTrunk, color: RED,    bloomW: 14, crispW: 4,   bloomO, crispO: lineO, delay: 0.15, dur: 0.25, glow: false },
      { d: geo.mainLeft,  color: GREEN,  bloomW: 9,  crispW: 3,   bloomO, crispO: lineO, delay: 0.35, dur: 0.38, glow: true },
      { d: geo.mainRight, color: PURPLE, bloomW: 9,  crispW: 3,   bloomO, crispO: lineO, delay: 0.35, dur: 0.38, glow: true },
      { d: geo.sTrunk,    color: GREEN,  bloomW: 9,  crispW: 2.5, bloomO, crispO: lineO, delay: 0.75, dur: 0.28, glow: false },
      { d: geo.cTrunk,    color: PURPLE, bloomW: 9,  crispW: 2.5, bloomO, crispO: lineO, delay: 0.85, dur: 0.28, glow: false },
      ...geo.sBranches.map((d, i): StrokeSpec => (
        { d, color: GREEN, bloomW: 6, crispW: 1.5, bloomO, crispO: lineO, delay: 0.90 + i * 0.08, dur: 0.48, glow: geo.sBranchGlow[i] })),
      ...geo.cBranches.map((d, i): StrokeSpec => (
        { d, color: PURPLE, bloomW: 6, crispW: 1.5, bloomO, crispO: lineO, delay: 1.08 + i * 0.08, dur: 0.48, glow: geo.cBranchGlow[i] })),
      ...geo.sStubs.map((s, i): StrokeSpec => (
        { d: stubD(s.origin, s.angle, s.len), color: GREEN, bloomW: 4, crispW: 0.9, bloomO: stubO, crispO: lineO * 0.55, delay: 1.55 + i * 0.07, dur: 0.22, glow: true })),
      ...geo.cStubs.map((s, i): StrokeSpec => (
        { d: stubD(s.origin, s.angle, s.len), color: PURPLE, bloomW: 4, crispW: 0.9, bloomO: stubO, crispO: lineO * 0.55, delay: 1.70 + i * 0.07, dur: 0.22, glow: true })),
    ];
    const dots: DotSpec[] = [
      { x: geo.mainJunc.x, y: geo.mainJunc.y, r: 5.5, color: RED,    delay: 0.53, glow: true },
      { x: geo.sJunc.x,    y: geo.sJunc.y,    r: 4.5, color: GREEN,  delay: 0.74, glow: true },
      { x: geo.cJunc.x,    y: geo.cJunc.y,    r: 4.5, color: PURPLE, delay: 0.84, glow: true },
      ...geo.sChildTops.map((p, i): DotSpec => (
        { x: p.x, y: p.y, r: 3, color: STUDENT_DESTS[i]?.hex ?? GREEN, delay: 1.08 + i * 0.10, glow: false })),
      ...geo.cChildTops.map((p, i): DotSpec => (
        { x: p.x, y: p.y, r: 3, color: CORPORATE_DESTS[i]?.hex ?? PURPLE, delay: 1.28 + i * 0.10, glow: false })),
    ];
    return { strokes, dots };
  }, [geo, RED, GREEN, PURPLE, bloomO, lineO, stubO, STUDENT_DESTS, CORPORATE_DESTS]);

  const mobileLayers = useMemo(() => {
    if (!mobileGeo) return null;
    const strokes: StrokeSpec[] = [
      { d: mobileGeo.mainTrunk, color: RED,    bloomW: 10, crispW: 3,   bloomO, crispO: lineO, delay: 0.15, dur: 0.25, glow: false },
      { d: mobileGeo.mainLeft,  color: GREEN,  bloomW: 7,  crispW: 2.5, bloomO, crispO: lineO, delay: 0.35, dur: 0.38, glow: true },
      { d: mobileGeo.mainRight, color: PURPLE, bloomW: 7,  crispW: 2.5, bloomO, crispO: lineO, delay: 0.35, dur: 0.38, glow: true },
    ];
    const dots: DotSpec[] = [
      { x: mobileGeo.mainJunc.x, y: mobileGeo.mainJunc.y, r: 4.5, color: RED, delay: 0.53, glow: true },
    ];
    return { strokes, dots };
  }, [mobileGeo, RED, GREEN, PURPLE, bloomO, lineO]);

  const drawing = isInView && !drawn;

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
      {isDesktop && (
      <div ref={containerRef} className="relative hidden sm:block">

        {/* SVG overlay */}
        {geo && desktopLayers && (
          <TreeLayers w={geo.svgW} h={geo.svgH} strokes={desktopLayers.strokes} dots={desktopLayers.dots}
            blur={7} live={isInView} drawing={drawing} isLight={isLight} />
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
            {/* Puls som CSS-animation (transform/opacity på kompositorn) i stället för JS per frame */}
            <span
              className="rn-pulse absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: '1px solid var(--rn-red)' }}
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
            {STUDENT_DESTS.map((d, i) => (
              <div key={d.href} style={{ paddingTop: S_PT[i], flex: 1 }}>
                <ChildCard d={d} elRef={sRefs[i]} delay={S_DELAY[i]} isInView={isInView} reduceMotion={reduceMotion} />
              </div>
            ))}
          </div>
          {/* Corporate leaves */}
          <div className="flex-1 flex gap-4" style={{ paddingTop: '48px' }}>
            {CORPORATE_DESTS.map((d, i) => (
              <div key={d.href} style={{ paddingTop: C_PT[i], flex: 1 }}>
                <ChildCard d={d} elRef={cRefs[i]} delay={C_DELAY[i]} isInView={isInView} reduceMotion={reduceMotion} />
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Mobile */}
      {!isDesktop && (
      <div ref={mContainerRef} className="relative sm:hidden overflow-hidden">

        {/* SVG overlay — mobile */}
        {mobileGeo && mobileLayers && (
          <TreeLayers w={mobileGeo.svgW} h={mobileGeo.svgH} strokes={mobileLayers.strokes} dots={mobileLayers.dots}
            blur={6} live={isInView} drawing={drawing} isLight={isLight} />
        )}

        {/* NEXUS hub — mobile */}
        <div className="flex justify-center mb-6">
          <motion.div
            ref={mHubRef}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.40, ease: E }}
            className="relative inline-flex items-center gap-2 px-5 py-3 rounded-2xl"
            style={{
              background: 'var(--about-card-bg)',
              border: '1px solid var(--rn-red)',
              boxShadow: '0 0 18px var(--rn-red-glow)',
            }}
          >
            {/* Puls som CSS-animation (transform/opacity på kompositorn) i stället för JS per frame */}
            <span
              className="rn-pulse absolute inset-0 rounded-2xl pointer-events-none"
              style={{ border: '1px solid var(--rn-red)' }}
              aria-hidden="true"
            />
            <span aria-hidden="true" style={{ color: 'var(--rn-red)', fontSize: '16px' }}>⬡</span>
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: 'var(--rn-red)', fontFamily: 'var(--font-heading)' }}
            >
              NEXUS
            </span>
          </motion.div>
        </div>

        {/* Two-column layout: Students (left) + Corporate (right) */}
        <div className="flex gap-3 items-start">

          {/* Students column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <motion.div
              ref={mSParentRef}
              initial={{ opacity: 0, y: -8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.30, ease: E }}
            >
              <Link
                href="/students"
                className="flex flex-col gap-1.5 rounded-2xl px-3 py-3 transition-all duration-200
                           hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-offset-2 min-h-11"
                style={{ background: 'var(--glass-green-bg)', border: '1px solid var(--glass-green-border)' }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${GREEN}18`, border: `1px solid ${GREEN}35` }}>
                  <GraduationCap className="w-4 h-4" style={{ color: 'var(--rn-green)' }} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold hero-text leading-tight">{ctaStudents}</div>
                  <div className="text-xs hero-text-muted leading-snug line-clamp-2">{ctaStudentsSub}</div>
                </div>
              </Link>
            </motion.div>
            <div className="relative pl-3 mt-1">
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-px rounded-full"
                style={{ background: `linear-gradient(to bottom, ${GREEN}70, ${GREEN}10)` }}
                initial={{ scaleY: 0, originY: '0%' }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ duration: reduceMotion ? 0 : 0.40, delay: 0.72, ease: 'easeOut' }}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-2">
                {STUDENT_DESTS.map((d, i) => (
                  <MobileChildCard key={d.href} d={d} elRef={mSRefs[i]} delay={0.80 + i * 0.10} isInView={isInView} reduceMotion={reduceMotion} />
                ))}
              </div>
            </div>
          </div>

          {/* Corporate column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <motion.div
              ref={mCParentRef}
              initial={{ opacity: 0, y: -8 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.40, ease: E }}
            >
              <Link
                href="/corporate"
                className="flex flex-col gap-1.5 rounded-2xl px-3 py-3 transition-all duration-200
                           hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-offset-2 min-h-11"
                style={{ background: 'var(--glass-purple-bg)', border: '1px solid var(--glass-purple-border)' }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${PURPLE}18`, border: `1px solid ${PURPLE}35` }}>
                  <Building2 className="w-4 h-4" style={{ color: 'var(--rn-purple)' }} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold hero-text leading-tight">{ctaCorporate}</div>
                  <div className="text-xs hero-text-muted leading-snug line-clamp-2">{ctaCorporateSub}</div>
                </div>
              </Link>
            </motion.div>
            <div className="relative pl-3 mt-1">
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-px rounded-full"
                style={{ background: `linear-gradient(to bottom, ${PURPLE}70, ${PURPLE}10)` }}
                initial={{ scaleY: 0, originY: '0%' }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ duration: reduceMotion ? 0 : 0.40, delay: 0.82, ease: 'easeOut' }}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-2">
                {CORPORATE_DESTS.map((d, i) => (
                  <MobileChildCard key={d.href} d={d} elRef={mCRefs[i]} delay={1.00 + i * 0.10} isInView={isInView} reduceMotion={reduceMotion} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}
