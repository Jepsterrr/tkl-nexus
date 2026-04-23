import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EventSchema, type TKLEvent } from '../schemas/event';
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
