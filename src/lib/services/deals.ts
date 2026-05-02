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
  orderBy,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DealSchema, DealFormSchema, type TKLDeal, type DealFormData } from '@/lib/schemas/deal';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { getDataSource, bumpCacheVersion } from './cacheVersion';

function toIso(ts: unknown): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return undefined;
}

function omitUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export async function getPublishedDeals(): Promise<TKLDeal[]> {
  const ref = collection(db, 'deals');
  const q = query(
    ref,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
  );

  const source = await getDataSource('deals');
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

  const deals: TKLDeal[] = [];
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const parsed = DealSchema.safeParse({
      id: docSnap.id,
      ...data,
      createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    });
    if (parsed.success) {
      deals.push(parsed.data);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[deals] Ogiltigt dokument:', docSnap.id, parsed.error.flatten());
    }
  }

  return deals;
}

export async function getAllDeals(): Promise<TKLDeal[]> {
  const ref = collection(db, 'deals');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await withFetchTimeout(getDocs(q));

  const deals: TKLDeal[] = [];
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const parsed = DealSchema.safeParse({
      id: docSnap.id,
      ...data,
      createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    });
    if (parsed.success) {
      deals.push(parsed.data);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[deals] Ogiltigt dokument:', docSnap.id, parsed.error.flatten());
    }
  }

  return deals;
}

export async function getDealById(id: string): Promise<TKLDeal | null> {
  const docRef = doc(db, 'deals', id);
  const docSnap = await withFetchTimeout(getDoc(docRef));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  const parsed = DealSchema.safeParse({
    id: docSnap.id,
    ...data,
    createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
  });
  if (!parsed.success) {
    console.error(`Valideringsfel för deal ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
}

export async function createDeal(data: DealFormData): Promise<string> {
  const validated = DealFormSchema.parse(data);
  const ref = collection(db, 'deals');
  const docRef = await addDoc(ref, {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateDeal(id: string, data: Partial<DealFormData>): Promise<void> {
  if (!id) throw new Error('updateDeal: id saknas');
  const validated = DealFormSchema.partial().parse(data);
  const docRef = doc(db, 'deals', id);
  await updateDoc(docRef, omitUndefined(validated as Record<string, unknown>));
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteDeal(id: string): Promise<void> {
  if (!id) throw new Error('deleteDeal: id saknas');
  await deleteDoc(doc(db, 'deals', id));
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
}

export async function toggleDealPublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('toggleDealPublished: id saknas');
  await updateDoc(doc(db, 'deals', id), { published: !current });
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
}
