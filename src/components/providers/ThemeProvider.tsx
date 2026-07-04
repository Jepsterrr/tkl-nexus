'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Theme } from '@/lib/types';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolved, setResolved] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  // Read localStorage once on mount — batched with setMounted so class-effect
  // never fires with the wrong default value.
  useEffect(() => {
    const stored = localStorage.getItem('tkl-theme') as Theme | null;
    if (stored && ['dark', 'light', 'system'].includes(stored)) {
      setThemeState(stored);
    }
    setMounted(true);
  }, []);

  // Apply class only after localStorage has been read (mounted = true).
  // The blocking inline script in <head> already set the correct class before
  // first paint, so skipping this effect on the initial render causes no flash.
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    const apply = () => {
      const actual: 'dark' | 'light' =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          : theme;
      setResolved(actual);
      root.classList.toggle('dark', actual === 'dark');
      root.classList.toggle('light', actual === 'light');
    };

    apply();
    localStorage.setItem('tkl-theme', theme);

    // I system-läge: följ med när OS byter tema mitt i sessionen
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  // Memoiserat värde — annars omrenderas alla konsumenter vid varje render
  const value = useMemo(() => ({ theme, setTheme, resolved }), [theme, setTheme, resolved]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
