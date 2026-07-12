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
  type DocumentData,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/lib/firebase';
import { CareerSchema, CareerFormSchema, type TKLCareer, type CareerFormData } from '@/lib/schemas/career';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot, toIso, omitUndefined, undefinedToDeleteField, togglePublishedField, startOfTodayStockholmIso } from './firestore-helpers';

function careerDates(data: DocumentData): Record<string, unknown> {
  return {
    deadline: toIso(data.deadline) ?? data.deadline,
    createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
  };
}

export async function getPublishedCareer(): Promise<TKLCareer[]> {
  const startOfTodayIso = startOfTodayStockholmIso();

  // INVARIANT: deadline lagras alltid som ISO-sträng (CareerFormSchema kräver
  // .datetime()). Firestore matchar aldrig olika typer i range-queries — ett
  // dokument där deadline skrivits som Timestamp försvinner TYST ur listan.
  const q = query(
    collection(db, 'career'),
    where('published', '==', true),
    where('deadline', '>=', startOfTodayIso),
    orderBy('deadline', 'asc'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocsWithCacheStrategy(q, 'career');
  return parseSnapshot(snapshot, CareerSchema, 'career', careerDates);
}

export async function getAllCareer(): Promise<TKLCareer[]> {
  const q = query(collection(db, 'career'), orderBy('createdAt', 'desc'));
  const snapshot = await withFetchTimeout(getDocs(q));
  return parseSnapshot(snapshot, CareerSchema, 'career', careerDates);
}

async function fetchCareerById(id: string, requirePublished: boolean): Promise<TKLCareer | null> {
  let docSnap;
  try {
    docSnap = await withFetchTimeout(getDoc(doc(db, 'career', id)));
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'permission-denied') return null;
    throw err;
  }
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (requirePublished && data.published !== true) return null;

  const parsed = CareerSchema.safeParse({ id: docSnap.id, ...data, ...careerDates(data) });
  if (!parsed.success) {
    console.error(`Valideringsfel för career ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
}

/** Publik hämtning — endast publicerade annonser (drawer-deeplinks). */
export async function getCareerById(id: string): Promise<TKLCareer | null> {
  return fetchCareerById(id, true);
}

/** Admin-hämtning — inkluderar opublicerade utkast (edit-sidan). */
export async function getCareerByIdAdmin(id: string): Promise<TKLCareer | null> {
  return fetchCareerById(id, false);
}

export async function createCareer(data: CareerFormData): Promise<string> {
  const validated = CareerFormSchema.parse(data);
  const docRef = await addDoc(collection(db, 'career'), {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateCareer(id: string, data: Partial<CareerFormData>): Promise<void> {
  if (!id) throw new Error('updateCareer: id saknas');
  const validated = CareerFormSchema.partial().parse(data);
  // Tömda valfria fält (undefined) ska raderas ur dokumentet — inte lämnas kvar.
  await updateDoc(doc(db, 'career', id), undefinedToDeleteField({ ...data, ...validated } as Record<string, unknown>));
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteCareer(id: string): Promise<void> {
  if (!id) throw new Error('deleteCareer: id saknas');
  await deleteDoc(doc(db, 'career', id));
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
}

export async function toggleCareerPublished(id: string): Promise<void> {
  await togglePublishedField(['career'], id);
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
}
