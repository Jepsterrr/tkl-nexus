import type { CareerType } from './schemas/career';

/** Visningsordning (Chalmers-listan: exjobb först). */
export const CAREER_TYPES: readonly CareerType[] = ['exjobb', 'jobb', 'sommarjobb', 'praktik', 'trainee'];

export const TYPE_COLORS: Record<CareerType, string> = {
  exjobb: '#8B5CF6',
  jobb: '#3B82F6',
  sommarjobb: '#F43F5E',
  praktik: '#10B981',
  trainee: '#F59E0B',
};

/** WCAG-säkra textvarianter (ljust tema mappar till mörkare nyans). */
export const TYPE_TEXT: Record<CareerType, string> = {
  exjobb: 'var(--text-purple)',
  jobb: 'var(--text-blue-strong)', // text-blue når bara ~3,8:1 på glasskort i mörkt tema
  sommarjobb: 'var(--text-rose)', // text-red (#fb2c36) underkänns på glasskort i mörkt tema
  praktik: 'var(--text-green)',
  trainee: 'var(--text-orange)',
};
