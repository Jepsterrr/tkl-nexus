import {
  doc, getDoc, setDoc,
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  orderBy, query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import {
  StatsSettingsSchema,    type StatsSettings,
  ContactSettingsSchema,  type ContactSettings,
  AboutSettingsSchema,    type AboutSettings,
  ServicesSettingsSchema, type ServicesSettings,
  LinksSettingsSchema,    type LinksSettings,
  BannerSettingsSchema,   type BannerSettings,
  TimelineItemSchema,     type TimelineItem,
  TimelineItemDataSchema, type TimelineItemData,
} from '@/lib/schemas/settings';

function omitUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// Generic

async function getSettings(docId: string): Promise<Record<string, unknown> | null> {
  const ref = doc(db, 'settings', docId);
  const snap = await withFetchTimeout(getDoc(ref));
  if (!snap.exists()) return null;
  return snap.data() as Record<string, unknown>;
}

async function saveSettings(docId: string, data: Record<string, unknown>): Promise<void> {
  const ref = doc(db, 'settings', docId);
  await setDoc(ref, omitUndefined(data), { merge: true });
}

// Stats

export async function getStatsSettings(): Promise<StatsSettings | null> {
  const data = await getSettings('stats');
  if (!data) return null;
  const r = StatsSettingsSchema.safeParse(data);
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:stats] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function saveStatsSettings(data: StatsSettings): Promise<void> {
  const validated = StatsSettingsSchema.parse(data);
  await saveSettings('stats', validated as Record<string, unknown>);
}

// Contact

export async function getContactSettings(): Promise<ContactSettings | null> {
  const data = await getSettings('contact');
  if (!data) return null;
  const r = ContactSettingsSchema.safeParse(data);
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:contact] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function saveContactSettings(data: ContactSettings): Promise<void> {
  const validated = ContactSettingsSchema.parse(data);
  await saveSettings('contact', validated as Record<string, unknown>);
}

// About

export async function getAboutSettings(): Promise<AboutSettings | null> {
  const data = await getSettings('about');
  if (!data) return null;
  const r = AboutSettingsSchema.safeParse(data);
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:about] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function saveAboutSettings(data: AboutSettings): Promise<void> {
  const validated = AboutSettingsSchema.parse(data);
  await saveSettings('about', validated as Record<string, unknown>);
}

// Services

export async function getServicesSettings(): Promise<ServicesSettings | null> {
  const data = await getSettings('services');
  if (!data) return null;
  const r = ServicesSettingsSchema.safeParse(data);
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:services] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function saveServicesSettings(data: ServicesSettings): Promise<void> {
  const validated = ServicesSettingsSchema.parse(data);
  await saveSettings('services', validated as Record<string, unknown>);
}

// Links

export async function getLinksSettings(): Promise<LinksSettings | null> {
  const data = await getSettings('links');
  if (!data) return null;
  const r = LinksSettingsSchema.safeParse(data);
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:links] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function saveLinksSettings(data: LinksSettings): Promise<void> {
  const validated = LinksSettingsSchema.parse(data);
  await saveSettings('links', validated as Record<string, unknown>);
}

// Banner

export async function getBannerSettings(): Promise<BannerSettings | null> {
  const data = await getSettings('banner');
  if (!data) return null;
  const r = BannerSettingsSchema.safeParse(data);
  if (!r.success) {
    if (process.env.NODE_ENV === 'development')
      console.warn('[settings:banner] Parse-fel:', r.error.flatten());
    return null;
  }
  return r.data;
}

export async function saveBannerSettings(data: BannerSettings): Promise<void> {
  const validated = BannerSettingsSchema.parse(data);
  await saveSettings('banner', validated as Record<string, unknown>);
}

// Timeline

const TIMELINE_COL = () => collection(db, 'settings', 'timeline', 'items');

export async function getTimelineItems(): Promise<TimelineItem[]> {
  const q = query(TIMELINE_COL(), orderBy('order', 'asc'));
  const snap = await withFetchTimeout(getDocs(q));
  const items: TimelineItem[] = [];
  snap.forEach(s => {
    const r = TimelineItemSchema.safeParse({ id: s.id, ...s.data() });
    if (r.success) items.push(r.data);
    else if (process.env.NODE_ENV === 'development')
      console.warn('[settings:timeline] Ogiltigt dokument:', s.id, r.error.flatten());
  });
  return items;
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
  return ref.id;
}

export async function saveTimelineItem(id: string, data: TimelineItemData): Promise<void> {
  if (!id) throw new Error('saveTimelineItem: id saknas');
  const validated = TimelineItemDataSchema.parse(data);
  await updateDoc(doc(db, 'settings', 'timeline', 'items', id), omitUndefined(validated as Record<string, unknown>));
}

export async function deleteTimelineItem(id: string): Promise<void> {
  if (!id) throw new Error('deleteTimelineItem: id saknas');
  await deleteDoc(doc(db, 'settings', 'timeline', 'items', id));
}
