import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OpportunitySchema, type TKLOpportunity } from '../schemas/opportunity';
import { withFetchTimeout } from '../fetch-timeout';

export async function getPublishedOpportunities(): Promise<TKLOpportunity[]> {
  const oppsRef = collection(db, 'career');
  const q = query(
    oppsRef,
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await withFetchTimeout(getDocs(q));

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
  return opportunities.filter(o => {
    if (!o.deadline) return true;
    const deadlineTime = new Date(o.deadline);
    deadlineTime.setHours(deadlineTime.getHours() + 24);
    return deadlineTime > now;
  });
}
