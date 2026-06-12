import {
  collection,
  getDocsFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  EventTypeSchema,
  EventTypeFormSchema,
  type TKLEventType,
  type EventTypeFormData,
} from '@/lib/schemas/eventType';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot } from './firestore-helpers';

const ITEMS_REF = () => collection(db, 'settings', 'eventTypes', 'items');

const bump = () =>
  void bumpCacheVersion('settings').catch(e => console.warn('[cache] bump failed:', e));

export async function getPublishedEventTypes(): Promise<TKLEventType[]> {
  const q = query(ITEMS_REF(), where('published', '==', true), orderBy('order', 'asc'));
  const snapshot = await getDocsWithCacheStrategy(q, 'settings');
  return parseSnapshot(snapshot, EventTypeSchema, 'eventTypes');
}

export async function getAllEventTypes(): Promise<TKLEventType[]> {
  const q = query(ITEMS_REF(), orderBy('order', 'asc'));
  const snapshot = await withFetchTimeout(getDocsFromServer(q));
  return parseSnapshot(snapshot, EventTypeSchema, 'eventTypes');
}

export async function createEventType(data: EventTypeFormData): Promise<string> {
  const validated = EventTypeFormSchema.parse(data);
  const docRef = await addDoc(ITEMS_REF(), validated);
  bump();
  return docRef.id;
}

export async function updateEventType(id: string, data: Partial<EventTypeFormData>): Promise<void> {
  if (!id) throw new Error('updateEventType: id saknas');
  const validated = EventTypeFormSchema.partial().parse(data);
  await updateDoc(doc(db, 'settings', 'eventTypes', 'items', id), validated as Record<string, unknown>);
  bump();
}

export async function deleteEventType(id: string): Promise<void> {
  if (!id) throw new Error('deleteEventType: id saknas');
  await deleteDoc(doc(db, 'settings', 'eventTypes', 'items', id));
  bump();
}

export async function toggleEventTypePublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('toggleEventTypePublished: id saknas');
  await updateDoc(doc(db, 'settings', 'eventTypes', 'items', id), { published: !current });
  bump();
}

export async function reorderEventTypes(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'settings', 'eventTypes', 'items', id), {
      order: (index + 1) * 10,
    });
  });
  await batch.commit();
  bump();
}
