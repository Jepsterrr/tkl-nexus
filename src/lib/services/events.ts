import {
  collection,
  getDocs,
  getDoc,
  getDocsFromCache,
  getDocsFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EventSchema, EventFormSchema, type TKLEvent, type EventFormData } from '../schemas/event';
import { withFetchTimeout } from '../fetch-timeout';
import { getDataSource, bumpCacheVersion } from './cacheVersion';

export async function getPublishedEvents(): Promise<TKLEvent[]> {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const startOfTodayIso = d.toISOString();

  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef,
    where('published', '==', true),
    where('endDate', '>=', startOfTodayIso),
    orderBy('endDate', 'asc'),
    orderBy('date', 'asc')
  );

  const source = await getDataSource('events');
  let snapshot;
  if (source === 'cache') {
    try {
      snapshot = await withFetchTimeout(getDocsFromCache(q));
      if (snapshot.empty) throw new Error('cache empty');
    } catch {
      snapshot = await withFetchTimeout(getDocsFromServer(q));
    }
  } else {
    snapshot = await withFetchTimeout(getDocsFromServer(q));
  }

  const events: TKLEvent[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const eventData = {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate?.().toISOString() ?? data.date,
      endDate: data.endDate?.toDate?.().toISOString() ?? data.endDate,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt,
    };

    const parsed = EventSchema.safeParse(eventData);
    if (parsed.success) {
      events.push(parsed.data);
    } else {
      console.error(`Valideringsfel för event ${docSnap.id}:`, parsed.error);
    }
  });

  return events;
}

export async function getAllEvents(): Promise<TKLEvent[]> {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, orderBy('date', 'asc'));
  const snapshot = await withFetchTimeout(getDocs(q));

  const events: TKLEvent[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const eventData = {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate?.().toISOString() ?? data.date,
      endDate: data.endDate?.toDate?.().toISOString() ?? data.endDate,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt,
    };
    const parsed = EventSchema.safeParse(eventData);
    if (parsed.success) {
      events.push(parsed.data);
    } else {
      console.error(`Valideringsfel för event ${docSnap.id}:`, parsed.error);
    }
  });

  return events;
}

export async function getEventById(id: string): Promise<TKLEvent | null> {
  const docRef = doc(db, 'events', id);
  const docSnap = await withFetchTimeout(getDoc(docRef));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  const eventData = {
    id: docSnap.id,
    ...data,
    date: data.date?.toDate?.().toISOString() ?? data.date,
    endDate: data.endDate?.toDate?.().toISOString() ?? data.endDate,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt,
  };

  const parsed = EventSchema.safeParse(eventData);
  if (!parsed.success) {
    console.error(`Valideringsfel för event ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
}

function omitUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export async function createEvent(data: EventFormData): Promise<string> {
  const validated = EventFormSchema.parse(data);
  const eventsRef = collection(db, 'events');
  const docRef = await addDoc(eventsRef, {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('events').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<void> {
  if (!id) throw new Error('updateEvent: id saknas');
  const validated = EventFormSchema.partial().parse(data);
  const docRef = doc(db, 'events', id);
  await updateDoc(docRef, omitUndefined(validated as Record<string, unknown>));
  void bumpCacheVersion('events').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteEvent(id: string): Promise<void> {
  if (!id) throw new Error('deleteEvent: id saknas');
  await deleteDoc(doc(db, 'events', id));
  void bumpCacheVersion('events').catch(e => console.warn('[cache] bump failed:', e));
}

export async function togglePublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('togglePublished: id saknas');
  await updateDoc(doc(db, 'events', id), { published: !current });
  void bumpCacheVersion('events').catch(e => console.warn('[cache] bump failed:', e));
}
