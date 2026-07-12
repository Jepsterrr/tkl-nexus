import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  where,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/lib/firebase';
import { DealSchema, DealFormSchema, type TKLDeal, type DealFormData } from '@/lib/schemas/deal';
import { deleteFromCloudinary } from './cloudinary';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot, toIso, omitUndefined, undefinedToDeleteField, togglePublishedField } from './firestore-helpers';

function dealDates(data: DocumentData): Record<string, unknown> {
  return { createdAt: toIso(data.createdAt) ?? new Date().toISOString() };
}

export async function getPublishedDeals(): Promise<TKLDeal[]> {
  const q = query(
    collection(db, 'deals'),
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocsWithCacheStrategy(q, 'deals');
  return parseSnapshot(snapshot, DealSchema, 'deals', dealDates);
}

export async function getAllDeals(): Promise<TKLDeal[]> {
  const q = query(collection(db, 'deals'), orderBy('createdAt', 'desc'));
  const snapshot = await withFetchTimeout(getDocs(q));
  return parseSnapshot(snapshot, DealSchema, 'deals', dealDates);
}

async function fetchDealById(id: string, requirePublished: boolean): Promise<TKLDeal | null> {
  let docSnap;
  try {
    docSnap = await withFetchTimeout(getDoc(doc(db, 'deals', id)));
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'permission-denied') return null;
    throw err;
  }
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (requirePublished && data.published !== true) return null;

  const parsed = DealSchema.safeParse({ id: docSnap.id, ...data, ...dealDates(data) });
  if (!parsed.success) {
    console.error(`Valideringsfel för deal ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
}

/** Publik hämtning — endast publicerade deals (drawer-deeplinks). */
export async function getDealById(id: string): Promise<TKLDeal | null> {
  return fetchDealById(id, true);
}

/** Admin-hämtning — inkluderar opublicerade utkast (edit-sidan). */
export async function getDealByIdAdmin(id: string): Promise<TKLDeal | null> {
  return fetchDealById(id, false);
}

export async function createDeal(data: DealFormData): Promise<string> {
  const validated = DealFormSchema.parse(data);
  const docRef = await addDoc(collection(db, 'deals'), {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateDeal(id: string, data: Partial<DealFormData>): Promise<void> {
  if (!id) throw new Error('updateDeal: id saknas');
  const validated = DealFormSchema.partial().parse(data);
  // Tömda valfria fält (undefined) ska raderas ur dokumentet — inte lämnas kvar.
  await updateDoc(doc(db, 'deals', id), undefinedToDeleteField({ ...data, ...validated } as Record<string, unknown>));
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteDeal(id: string, cloudinaryPublicId?: string): Promise<void> {
  if (!id) throw new Error('deleteDeal: id saknas');

  if (cloudinaryPublicId) {
    try {
      await deleteFromCloudinary(cloudinaryPublicId);
    } catch (e) {
      console.warn('[cloudinary] Kunde inte radera bild vid borttagning av deal:', e);
    }
  }

  await deleteDoc(doc(db, 'deals', id));
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
}

export async function toggleDealPublished(id: string): Promise<void> {
  await togglePublishedField(['deals'], id);
  void bumpCacheVersion('deals').catch(e => console.warn('[cache] bump failed:', e));
}
