'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  twinkleOffset: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const { resolved } = useTheme();
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    // Canvasen är dold i light mode (light:hidden) — kör ingen rAF-loop i onödan
    if (resolved === 'light') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COUNT = 160;

    const regenerate = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-generate stars proportionally on resize
      starsRef.current = Array.from({ length: COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.4 + 0.05,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      starsRef.current.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fill();
      });
    };

    // Debouncad resize — annars regenereras 160 stjärnor per resize-event
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        regenerate();
        if (prefersReducedMotion) drawStatic();
      }, 150);
    };

    regenerate();
    window.addEventListener('resize', onResize);

    if (prefersReducedMotion) {
      // Render once, no animation
      drawStatic();
      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
      };
    }

    let t = 0;
    let visible = true;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;
      starsRef.current.forEach((s) => {
        const alpha = s.opacity * (0.6 + 0.4 * Math.sin(t * s.speed + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });
      if (visible) rafRef.current = requestAnimationFrame(draw);
    };

    // Pausa loopen när canvasen scrollats ur bild — sparar CPU/batteri
    const io = new IntersectionObserver(([entry]) => {
      const nowVisible = entry.isIntersecting;
      if (nowVisible && !visible) {
        visible = true;
        rafRef.current = requestAnimationFrame(draw);
      } else if (!nowVisible) {
        visible = false;
        cancelAnimationFrame(rafRef.current);
      }
    });
    io.observe(canvas);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      io.disconnect();
    };
  }, [prefersReducedMotion, resolved]);

  return (
    <div className="light:hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}
