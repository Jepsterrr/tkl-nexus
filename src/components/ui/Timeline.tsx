'use client';

import { motion } from "framer-motion";

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical center line */}
      <div
        className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px"
        style={{ background: "rgba(255 255 255 / 0.1)" }}
        aria-hidden="true"
      />

      <div className="space-y-12 sm:space-y-16">
        {items.map((item, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex items-start gap-6 sm:gap-0 ${
                isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              {/* Dot */}
              <div
                className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-1.5 z-10 border-2 border-background"
                style={{ background: "var(--tkl-red)" }}
                aria-hidden="true"
              />

              {/* Content */}
              <div
                className={`ml-10 sm:ml-0 sm:w-[calc(50%-2rem)] ${
                  isLeft ? "sm:pr-8 sm:text-right" : "sm:pl-8 sm:text-left"
                }`}
              >
                <span className="font-mono text-xs text-tkl-red tracking-wider">{item.year}</span>
                <h3 className="text-foreground font-display font-semibold text-base mt-1">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Spacer */}
              <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
