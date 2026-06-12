import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/lib/firebase';
import { EventSchema, EventFormSchema, type TKLEvent, type EventFormData } from '../schemas/event';
import { withFetchTimeout } from '../fetch-timeout';
import { bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot, toIso, omitUndefined } from './firestore-helpers';

/** Timestamp/sträng → ISO för alla datumfält. */
function eventDates(data: DocumentData): Record<string, unknown> {
  return {
    date: toIso(data.date) ?? data.date,
    endDate: toIso(data.endDate) ?? data.endDate,
    createdAt: toIso(data.createdAt) ?? data.createdAt,
  };
}

export async function getPublishedEvents(): Promise<TKLEvent[]> {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const startOfTodayIso = d.toISOString();

  const q = query(
    collection(db, 'events'),
    where('published', '==', true),
    where('endDate', '>=', startOfTodayIso),
    orderBy('endDate', 'asc'),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocsWithCacheStrategy(q, 'events');
  return parseSnapshot(snapshot, EventSchema, 'events', eventDates);
}

export async function getAllEvents(): Promise<TKLEvent[]> {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  const snapshot = await withFetchTimeout(getDocs(q));
  return parseSnapshot(snapshot, EventSchema, 'events', eventDates);
}

export async function getEventById(id: string): Promise<TKLEvent | null> {
  let docSnap;
  try {
    docSnap = await withFetchTimeout(getDoc(doc(db, 'events', id)));
  } catch (err) {
    // Security rules nekar läsning av opublicerade dokument — behandla som "finns inte"
    if (err instanceof FirebaseError && err.code === 'permission-denied') return null;
    throw err;
  }
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (data.published !== true) return null;

  const parsed = EventSchema.safeParse({ id: docSnap.id, ...data, ...eventDates(data) });
  if (!parsed.success) {
    console.error(`Valideringsfel för event ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
}

export async function createEvent(data: EventFormData): Promise<string> {
  const validated = EventFormSchema.parse(data);
  const docRef = await addDoc(collection(db, 'events'), {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('events').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<void> {
  if (!id) throw new Error('updateEvent: id saknas');
  const validated = EventFormSchema.partial().parse(data);
  await updateDoc(doc(db, 'events', id), omitUndefined(validated as Record<string, unknown>));
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
