import {
  doc, getDoc, getDocFromCache, getDocFromServer, setDoc,
  collection, addDoc, updateDoc, deleteDoc,
  orderBy, query,
  type DocumentSnapshot,
} from 'firebase/firestore';
import type { z } from 'zod';
import { db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { getDataSource, bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot, omitUndefined } from './firestore-helpers';
import {
  StatsSettingsSchema,        type StatsSettings,
  ContactSettingsSchema,      type ContactSettings,
  AboutSettingsSchema,        type AboutSettings,
  ServicesSettingsSchema,     type ServicesSettings,
  LinksSettingsSchema,        type LinksSettings,
  BannerSettingsSchema,       type BannerSettings,
  HeroImagesSettingsSchema,   type HeroImagesSettings,
  TimelineItemSchema,         type TimelineItem,
  TimelineItemDataSchema,     type TimelineItemData,
} from '@/lib/schemas/settings';

const bump = () =>
  void bumpCacheVersion('settings').catch(e => console.warn('[cache] bump failed:', e));

/** Dokumentläsning enligt cacheVersion-strategin (cache om färsk, annars server). */
async function getSettingsDoc(docId: string): Promise<DocumentSnapshot> {
  const ref = doc(db, 'settings', docId);
  const source = await getDataSource('settings');
  if (source === 'cache') {
    try {
      return await withFetchTimeout(getDocFromCache(ref));
    } catch {
      return withFetchTimeout(getDocFromServer(ref));
    }
  }
  return withFetchTimeout(getDoc(ref));
}

/**
 * Fabrik för settings-dokument: varje dokument får ett identiskt
 * get/save-par med Zod-validering, cache-strategi och versionsbump.
 */
function makeSettingsIO<S extends z.ZodTypeAny>(docId: string, schema: S) {
  return {
    async get(): Promise<z.output<S> | null> {
      const snap = await getSettingsDoc(docId);
      if (!snap.exists()) return null;
      const r = schema.safeParse(snap.data());
      if (!r.success) {
        if (process.env.NODE_ENV === 'development')
          console.warn(`[settings:${docId}] Parse-fel:`, r.error.flatten());
        return null;
      }
      return r.data;
    },
    async save(data: z.input<S>): Promise<void> {
      const validated = schema.parse(data);
      await setDoc(
        doc(db, 'settings', docId),
        omitUndefined(validated as Record<string, unknown>),
        { merge: true },
      );
      bump();
    },
  };
}

const statsIO      = makeSettingsIO('stats', StatsSettingsSchema);
const contactIO    = makeSettingsIO('contact', ContactSettingsSchema);
const aboutIO      = makeSettingsIO('about', AboutSettingsSchema);
const servicesIO   = makeSettingsIO('services', ServicesSettingsSchema);
const linksIO      = makeSettingsIO('links', LinksSettingsSchema);
const bannerIO     = makeSettingsIO('banner', BannerSettingsSchema);
const heroImagesIO = makeSettingsIO('hero-images', HeroImagesSettingsSchema);

export const getStatsSettings = (): Promise<StatsSettings | null> => statsIO.get();
export const saveStatsSettings = (d: StatsSettings): Promise<void> => statsIO.save(d);

export const getContactSettings = (): Promise<ContactSettings | null> => contactIO.get();
export const saveContactSettings = (d: ContactSettings): Promise<void> => contactIO.save(d);

export const getAboutSettings = (): Promise<AboutSettings | null> => aboutIO.get();
export const saveAboutSettings = (d: AboutSettings): Promise<void> => aboutIO.save(d);

export const getServicesSettings = (): Promise<ServicesSettings | null> => servicesIO.get();
export const saveServicesSettings = (d: ServicesSettings): Promise<void> => servicesIO.save(d);

export const getLinksSettings = (): Promise<LinksSettings | null> => linksIO.get();
export const saveLinksSettings = (d: LinksSettings): Promise<void> => linksIO.save(d);

export const getBannerSettings = (): Promise<BannerSettings | null> => bannerIO.get();
export const saveBannerSettings = (d: BannerSettings): Promise<void> => bannerIO.save(d);

export const getHeroImagesSettings = (): Promise<HeroImagesSettings | null> => heroImagesIO.get();
export const saveHeroImagesSettings = (d: HeroImagesSettings): Promise<void> => heroImagesIO.save(d);

// Timeline (subkollektion settings/timeline/items)

const TIMELINE_COL = () => collection(db, 'settings', 'timeline', 'items');

export async function getTimelineItems(): Promise<TimelineItem[]> {
  const q = query(TIMELINE_COL(), orderBy('order', 'asc'));
  const snap = await getDocsWithCacheStrategy(q, 'settings');
  return parseSnapshot(snap, TimelineItemSchema, 'settings:timeline');
}

export async function getTimelineItem(id: string): Promise<TimelineItem | null> {
  const ref = doc(db, 'settings', 'timeline', 'items', id);
  const snap = await withFetchTimeout(getDoc(ref));
  if (!snap.exists()) return null;
  const r = TimelineItemSchema.safeParse({ id: snap.id, ...snap.data() });
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:timeline] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function createTimelineItem(data: TimelineItemData): Promise<string> {
  const validated = TimelineItemDataSchema.parse(data);
  const ref = await addDoc(TIMELINE_COL(), omitUndefined(validated as Record<string, unknown>));
  bump();
  return ref.id;
}

export async function saveTimelineItem(id: string, data: TimelineItemData): Promise<void> {
  if (!id) throw new Error('saveTimelineItem: id saknas');
  const validated = TimelineItemDataSchema.parse(data);
  await updateDoc(doc(db, 'settings', 'timeline', 'items', id), omitUndefined(validated as Record<string, unknown>));
  bump();
}

export async function deleteTimelineItem(id: string): Promise<void> {
  if (!id) throw new Error('deleteTimelineItem: id saknas');
  await deleteDoc(doc(db, 'settings', 'timeline', 'items', id));
  bump();
}
