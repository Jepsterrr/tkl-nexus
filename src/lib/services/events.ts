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
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EventSchema, EventFormSchema, type TKLEvent, type EventFormData } from '../schemas/event';
import { withFetchTimeout } from '../fetch-timeout';

export async function getPublishedEvents(): Promise<TKLEvent[]> {
  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef,
    where('published', '==', true),
    orderBy('date', 'asc')
  );

  const snapshot = await withFetchTimeout(getDocs(q));

  const events: TKLEvent[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const eventData = {
      id: doc.id,
      ...data,
      date: data.date?.toDate?.().toISOString() || data.date,
      endDate: data.endDate?.toDate?.().toISOString() || data.endDate,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
    };

    const parsed = EventSchema.safeParse(eventData);
    if (parsed.success) {
      events.push(parsed.data);
    } else {
      console.error(`Valideringsfel för event ${doc.id}:`, parsed.error);
    }
  });

  const now = new Date();
  return events.filter(e => {
    if (!e.endDate) return true;
    const endTime = new Date(e.endDate);
    endTime.setHours(endTime.getHours() + 24);
    return endTime > now;
  });
}

export async function getAllEvents(): Promise<TKLEvent[]> {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, orderBy('date', 'asc'));
  const snapshot = await getDocs(q);

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
  const docSnap = await getDoc(docRef);
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
  return parsed.success ? parsed.data : null;
}

export async function createEvent(data: EventFormData): Promise<string> {
  const eventsRef = collection(db, 'events');
  const docRef = await addDoc(eventsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<void> {
  const docRef = doc(db, 'events', id);
  await updateDoc(docRef, data as Record<string, unknown>);
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}

export async function togglePublished(id: string, current: boolean): Promise<void> {
  await updateDoc(doc(db, 'events', id), { published: !current });
}
