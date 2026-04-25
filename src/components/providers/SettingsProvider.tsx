'use client';

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react';
import {
  getStatsSettings,
  getContactSettings,
  getAboutSettings,
  getServicesSettings,
  getLinksSettings,
  getBannerSettings,
} from '@/lib/services/settings';
import {
  type StatsSettings,
  type ContactSettings,
  type AboutSettings,
  type ServicesSettings,
  type LinksSettings,
  type BannerSettings,
} from '@/lib/schemas/settings';

interface SettingsContextValue {
  stats:    StatsSettings    | null;
  contact:  ContactSettings  | null;
  about:    AboutSettings    | null;
  services: ServicesSettings | null;
  links:    LinksSettings    | null;
  banner:   BannerSettings   | null;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('settings timeout')), ms)
    ),
  ]);
}

async function fetchAll(): Promise<SettingsContextValue> {
  const [stats, contact, about, services, links, banner] = await Promise.all([
    getStatsSettings(),
    getContactSettings(),
    getAboutSettings(),
    getServicesSettings(),
    getLinksSettings(),
    getBannerSettings(),
  ]);
  return { stats, contact, about, services, links, banner };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<SettingsContextValue>({
    stats: null, contact: null, about: null,
    services: null, links: null, banner: null,
  });

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function run() {
      try {
        const data = await withTimeout(fetchAll(), 5000);
        if (!cancelled) setValue(data);
      } catch {
        await new Promise<void>(r => { retryTimer = setTimeout(r, 1000); });
        if (cancelled) return;
        try {
          const data = await withTimeout(fetchAll(), 8000);
          if (!cancelled) setValue(data);
        } catch {
          // keep null values — consumers use i18n fallbacks
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, []);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (ctx === undefined) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
