'use client';

import type { AccentColor } from '@/lib/types';

interface GradientOrbProps {
  color: AccentColor;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  animClass?: string;
}

const ORB_CONFIG: Record<AccentColor, { color1: string; color2: string }> = {
  red: { color1: '#E30613', color2: '#a00410' },
  purple: { color1: '#8B5CF6', color2: '#5b21b6' },
  green: { color1: '#10B981', color2: '#047857' },
};

export function GradientOrb({
  color,
  size = 500,
  top,
  left,
  right,
  bottom,
  opacity = 0.15,
  animClass = 'animate-orb-float',
}: GradientOrbProps) {
  const { color1, color2 } = ORB_CONFIG[color];

  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none rounded-full ${animClass}`}
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        background: `radial-gradient(circle, ${color1} 0%, ${color2} 40%, transparent 70%)`,
        opacity,
        filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}
