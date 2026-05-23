import {
  collection,
  getDocs,
  getDocsFromServer,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  EventTypeSchema,
  EventTypeFormSchema,
  type TKLEventType,
  type EventTypeFormData,
} from '@/lib/schemas/eventType';
import { withFetchTimeout } from '@/lib/fetch-timeout';

const ITEMS_REF = () => collection(db, 'settings', 'eventTypes', 'items');

export async function getPublishedEventTypes(): Promise<TKLEventType[]> {
  const q = query(ITEMS_REF(), where('published', '==', true), orderBy('order', 'asc'));
  const snapshot = await withFetchTimeout(getDocs(q));

  const items: TKLEventType[] = [];
  snapshot.forEach((docSnap) => {
    const parsed = EventTypeSchema.safeParse({ id: docSnap.id, ...docSnap.data() });
    if (parsed.success) items.push(parsed.data);
  });
  return items;
}

export async function getAllEventTypes(): Promise<TKLEventType[]> {
  const q = query(ITEMS_REF(), orderBy('order', 'asc'));
  const snapshot = await withFetchTimeout(getDocsFromServer(q));

  const items: TKLEventType[] = [];
  snapshot.forEach((docSnap) => {
    const parsed = EventTypeSchema.safeParse({ id: docSnap.id, ...docSnap.data() });
    if (parsed.success) items.push(parsed.data);
  });
  return items;
}

export async function createEventType(data: EventTypeFormData): Promise<string> {
  const validated = EventTypeFormSchema.parse(data);
  const ref = ITEMS_REF();
  const docRef = await addDoc(ref, validated);
  return docRef.id;
}

export async function updateEventType(id: string, data: Partial<EventTypeFormData>): Promise<void> {
  if (!id) throw new Error('updateEventType: id saknas');
  const validated = EventTypeFormSchema.partial().parse(data);
  await updateDoc(doc(db, 'settings', 'eventTypes', 'items', id), validated as Record<string, unknown>);
}

export async function deleteEventType(id: string): Promise<void> {
  if (!id) throw new Error('deleteEventType: id saknas');
  await deleteDoc(doc(db, 'settings', 'eventTypes', 'items', id));
}

export async function toggleEventTypePublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('toggleEventTypePublished: id saknas');
  await updateDoc(doc(db, 'settings', 'eventTypes', 'items', id), { published: !current });
}
