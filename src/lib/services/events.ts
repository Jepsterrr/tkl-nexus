import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EventSchema, type TKLEvent } from '../schemas/event';

export async function getPublishedEvents(): Promise<TKLEvent[]> {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('published', '==', true),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    
    const events: TKLEvent[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Konvertera Firestore Timestamps till ISO-strängar för klienten
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

    // Här kan vi också lägga in filtrering så vi döljer events där `endDate` (eller `date` om endDate saknas) har passerat.
    const now = new Date();
    const futureEvents = events.filter(e => {
      const endTime = e.endDate ? new Date(e.endDate) : new Date(e.date);
       // Lägg till 24 h marginal om man vill att eventet ska synas hela sista dagen
      endTime.setHours(endTime.getHours() + 24);
      return endTime > now;
    });

    return futureEvents;
  } catch (error) {
    console.error('Kunde inte hämta events:', error);
    return [];
  }
}
