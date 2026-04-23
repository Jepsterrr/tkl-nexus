import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DealSchema, type TKLDeal } from '@/lib/schemas/deal';
import { withFetchTimeout } from '@/lib/fetch-timeout';

export async function getPublishedDeals(): Promise<TKLDeal[]> {
  const ref = collection(db, 'deals');
  const q = query(
    ref,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
  );

  const snap = await withFetchTimeout(getDocs(q));

  const deals: TKLDeal[] = [];
  for (const doc of snap.docs) {
    const parsed = DealSchema.safeParse({ id: doc.id, ...doc.data() });
    if (parsed.success) {
      deals.push(parsed.data);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[deals] Ogiltigt dokument:', doc.id, parsed.error.flatten());
      }
    }
  }

  return deals;
}
