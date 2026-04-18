import { z } from 'zod';

// Navigation

export const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string(),
  icon: z.string().optional(),
  isExternal: z.boolean().optional(),
});

export type NavItem = z.infer<typeof NavItemSchema>;

// Hero Section

export const AccentColorSchema = z.enum(['red', 'purple', 'green', 'blue', 'orange']);
export type AccentColor = z.infer<typeof AccentColorSchema>;

export const CtaSchema = z.object({
  label: z.string().min(1).max(50),
  href: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost']),
});

export type Cta = z.infer<typeof CtaSchema>;

export const HeroPropsSchema = z.object({
  badge: z.string().max(60).optional(),
  heading: z.string().min(1).max(80),
  headingAccent: z.string().min(1).max(50),
  description: z.string().max(320),
  ctas: z.array(CtaSchema).max(3),
  accentColor: AccentColorSchema,
  backHref: z.string().optional(),
  backLabel: z.string().optional(),
});

export type HeroProps = z.infer<typeof HeroPropsSchema>;

// Job / Opportunity Card

export const JobCategorySchema = z.enum(['corporate', 'student']);
export type JobCategory = z.infer<typeof JobCategorySchema>;

export const JobCardSchema = z.object({
  title: z.string().min(1).max(120),
  company: z.string().min(1).max(80),
  location: z.string().min(1).max(80),
  type: z.string().min(1).max(40),
  deadline: z.string().min(1).max(30),
  category: JobCategorySchema,
});

export type JobCardProps = z.infer<typeof JobCardSchema>;

// Stat Item

export const StatItemSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1).max(60),
});

export type StatItem = z.infer<typeof StatItemSchema>;

// Benefit / Feature Card

export const BenefitCardSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().max(200),
  iconName: z.string(),
  accentColor: AccentColorSchema,
  linkLabel: z.string().optional(),
  linkHref: z.string().optional(),
  featured: z.boolean().optional(),
});

export type BenefitCard = z.infer<typeof BenefitCardSchema>;

// Page Metadata

export const PageMetadataSchema = z.object({
  title: z.string().min(1).max(70),
  description: z.string().max(160),
  locale: z.enum(['sv', 'en']),
});

export type PageMetadata = z.infer<typeof PageMetadataSchema>;

// Theme 

export type Theme = 'dark' | 'light' | 'system';

// Contact Info

export const CONTACT_ITEMS = [
  {
    label: 'ao@teknologkaren.se',
    href: 'mailto:ao@teknologkaren.se',
    external: false,
  },
  {
    label: 'LinkedIn: TKL Nexus',
    href: 'https://linkedin.com/in/tkl-nexus/',
    external: true,
  },
  {
    label: 'Instagram: @tkl_nexus',
    href: 'https://instagram.com/tkl_nexus',
    external: true,
  },
];

// Color Maps

export const ACCENT_COLOR_MAP = {
  red: {
    hex: '#E30613',
    glow: 'rgba(227, 6, 19, 0.4)',
    border: 'rgba(227, 6, 19, 0.3)',
    bg: 'rgba(227, 6, 19, 0.1)',
    bgStrong: 'rgba(227, 6, 19, 0.2)',
    gradient: 'linear-gradient(135deg, #E30613, #ff4d5a)',
    textClass: 'text-accent-red',
    glowClass: 'glow-red',
  },
  purple: {
    hex: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.4)',
    border: 'rgba(139, 92, 246, 0.3)',
    bg: 'rgba(139, 92, 246, 0.1)',
    bgStrong: 'rgba(139, 92, 246, 0.2)',
    gradient: 'linear-gradient(135deg, #8B5CF6, #a78bfa)',
    textClass: 'text-accent-purple',
    glowClass: 'glow-purple',
  },
  green: {
    hex: '#10B981',
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(16, 185, 129, 0.3)',
    bg: 'rgba(16, 185, 129, 0.1)',
    bgStrong: 'rgba(16, 185, 129, 0.2)',
    gradient: 'linear-gradient(135deg, #10B981, #34d399)',
    textClass: 'text-accent-green',
    glowClass: 'glow-green',
  },
  blue: {
    hex: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
    border: 'rgba(59, 130, 246, 0.3)',
    bg: 'rgba(59, 130, 246, 0.1)',
    bgStrong: 'rgba(59, 130, 246, 0.2)',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    textClass: 'text-accent-blue',
    glowClass: 'glow-blue',
  },
  orange: {
    hex: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'rgba(245, 158, 11, 0.3)',
    bg: 'rgba(245, 158, 11, 0.1)',
    bgStrong: 'rgba(245, 158, 11, 0.2)',
    gradient: 'linear-gradient(135deg, #F59E0B, #fbbf24)',
    textClass: 'text-accent-orange',
    glowClass: 'glow-orange',
  },
} as const satisfies Record<AccentColor, {
  hex: string;
  glow: string;
  border: string;
  bg: string;
  bgStrong: string;
  gradient: string;
  textClass: string;
  glowClass: string;
}>;
