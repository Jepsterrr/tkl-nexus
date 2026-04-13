import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OpportunitySchema, type TKLOpportunity } from '../schemas/opportunity';

export async function getPublishedOpportunities(): Promise<TKLOpportunity[]> {
  try {
    const oppsRef = collection(db, 'opportunities');
    // Vi hämtar enbart publicerade annonser och sorterar på skapandedatum (nyast först)
    const q = query(
      oppsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const opportunities: TKLOpportunity[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const oppData = {
        id: doc.id,
        ...data,
        deadline: data.deadline?.toDate?.().toISOString() || data.deadline,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      };

      const parsed = OpportunitySchema.safeParse(oppData);
      if (parsed.success) {
        opportunities.push(parsed.data);
      } else {
        console.error(`Valideringsfel för opportunity ${doc.id}:`, parsed.error);
      }
    });

    const now = new Date();
    const activeOpps = opportunities.filter(o => {
      // Om ingen deadline finns, låt den alltid synas
      if (!o.deadline) return true;

      const deadlineTime = new Date(o.deadline);
      // Lägg till 24 h marginal så annonsen syns hela sista dagen
      deadlineTime.setHours(deadlineTime.getHours() + 24);
      return deadlineTime > now;
    });

    return activeOpps;
  } catch (error) {
    console.error('Kunde inte hämta opportunities:', error);
    return [];
  }
}