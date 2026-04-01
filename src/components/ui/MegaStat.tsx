'use client';
import { motion } from "framer-motion";
interface MegaStatProps {
  value: string;
  label: string;
  index: number;
}
export function MegaStat({ value, label, index }: MegaStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="text-center sm:text-left flex flex-col"
    >
      <dt className="order-2 mt-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="order-1 text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tighter text-foreground/90 leading-none m-0">
        {value}
      </dd>
    </motion.div>
  );
}
