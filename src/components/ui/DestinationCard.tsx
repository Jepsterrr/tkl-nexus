'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface DestinationCardProps {
  href: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  accentColor: string; // hex
  cta: string;
  index?: number;
}

export function DestinationCard({
  href,
  label,
  description,
  Icon,
  accentColor,
  cta,
  index = 0,
}: DestinationCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        href={href}
        className="block relative rounded-2xl overflow-hidden p-6 transition-transform duration-300 group-hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2"
        style={{
          background: `${accentColor}0a`,
          border: `1px solid ${accentColor}22`,
          boxShadow: `0 0 0 0 ${accentColor}00`,
          // Focus ring uses accent
          outlineColor: accentColor,
        }}
        aria-label={label}
      >
        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${accentColor}18, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Border glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${accentColor}55, 0 8px 40px ${accentColor}22` }}
          aria-hidden="true"
        />

        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h3
          className="font-semibold text-base mb-1.5 hero-text transition-colors group-hover:text-white"
        >
          {label}
        </h3>
        <p className="text-sm hero-text-muted leading-relaxed">{description}</p>

        {/* Arrow */}
        <div
          className="flex items-center gap-1.5 mt-4 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
          style={{ color: accentColor }}
        >
          <span>{cta}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </div>
      </Link>
    </motion.div>
  );
}
