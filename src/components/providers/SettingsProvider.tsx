'use client';

import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react';
import {
  type StatsSettings,
  type ContactSettings,
  type AboutSettings,
  type ServicesSettings,
  type LinksSettings,
  type BannerSettings,
  type HeroImagesSettings,
} from '@/lib/schemas/settings';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary-url';

interface SettingsContextValue {
  stats:       StatsSettings       | null;
  contact:     ContactSettings     | null;
  about:       AboutSettings       | null;
  services:    ServicesSettings    | null;
  links:       LinksSettings       | null;
  banner:      BannerSettings      | null;
  heroImages:  HeroImagesSettings  | null;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// Hero-fotona är LCP-element — leverera dem via Cloudinarys f_auto/q_auto/w_
// istället för originalfilen. Transformationen sker vid läsning; Firestore
// behåller alltid originala URL:er (admin-formulären läser servicen direkt).
function optimizeHeroImages(h: HeroImagesSettings | null): HeroImagesSettings | null {
  if (!h) return null;
  return {
    ...h,
    homeUrl:      h.homeUrl      ? optimizeCloudinaryUrl(h.homeUrl)      : h.homeUrl,
    studentsUrl:  h.studentsUrl  ? optimizeCloudinaryUrl(h.studentsUrl)  : h.studentsUrl,
    corporateUrl: h.corporateUrl ? optimizeCloudinaryUrl(h.corporateUrl) : h.corporateUrl,
    eventsUrl:    h.eventsUrl    ? optimizeCloudinaryUrl(h.eventsUrl)    : h.eventsUrl,
    careerUrl:    h.careerUrl    ? optimizeCloudinaryUrl(h.careerUrl)    : h.careerUrl,
    aboutUrl:     h.aboutUrl     ? optimizeCloudinaryUrl(h.aboutUrl)     : h.aboutUrl,
  };
}

function optimizeAbout(a: AboutSettings | null): AboutSettings | null {
  if (!a?.campusPhotoUrl) return a;
  return { ...a, campusPhotoUrl: optimizeCloudinaryUrl(a.campusPhotoUrl, 1600) };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('settings timeout')), ms)
    ),
  ]);
}

async function fetchAll(): Promise<SettingsContextValue> {
  // Dynamisk import — service-lagret drar in hela Firestore-SDK:t (~145 kB gzip).
  // Statisk import här lägger SDK:t i den delade bundlen och blockerar
  // hydration/LCP på VARJE sida. Håll firebase utanför kritiska JS-vägen.
  const {
    getStatsSettings,
    getContactSettings,
    getAboutSettings,
    getServicesSettings,
    getLinksSettings,
    getBannerSettings,
    getHeroImagesSettings,
  } = await import('@/lib/services/settings');

  const [stats, contact, about, services, links, banner, heroImages] = await Promise.allSettled([
    getStatsSettings(),
    getContactSettings(),
    getAboutSettings(),
    getServicesSettings(),
    getLinksSettings(),
    getBannerSettings(),
    getHeroImagesSettings(),
  ]);
  return {
    stats:      stats.status      === 'fulfilled' ? stats.value      : null,
    contact:    contact.status    === 'fulfilled' ? contact.value    : null,
    about:      about.status      === 'fulfilled' ? optimizeAbout(about.value) : null,
    services:   services.status   === 'fulfilled' ? services.value   : null,
    links:      links.status      === 'fulfilled' ? links.value      : null,
    banner:     banner.status     === 'fulfilled' ? banner.value     : null,
    heroImages: heroImages.status === 'fulfilled' ? optimizeHeroImages(heroImages.value) : null,
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<SettingsContextValue>({
    stats: null, contact: null, about: null,
    services: null, links: null, banner: null,
    heroImages: null,
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
