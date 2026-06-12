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
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '@/lib/firebase';
import { CareerSchema, CareerFormSchema, type TKLCareer, type CareerFormData } from '@/lib/schemas/career';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot, toIso, omitUndefined } from './firestore-helpers';

function careerDates(data: DocumentData): Record<string, unknown> {
  return {
    deadline: toIso(data.deadline) ?? data.deadline,
    createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
  };
}

export async function getPublishedCareer(): Promise<TKLCareer[]> {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const startOfToday = Timestamp.fromDate(d);

  const q = query(
    collection(db, 'career'),
    where('published', '==', true),
    where('deadline', '>=', startOfToday),
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

export async function getCareerById(id: string): Promise<TKLCareer | null> {
  let docSnap;
  try {
    docSnap = await withFetchTimeout(getDoc(doc(db, 'career', id)));
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'permission-denied') return null;
    throw err;
  }
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  if (data.published !== true) return null;

  const parsed = CareerSchema.safeParse({ id: docSnap.id, ...data, ...careerDates(data) });
  if (!parsed.success) {
    console.error(`Valideringsfel för career ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
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
  await updateDoc(doc(db, 'career', id), omitUndefined(validated as Record<string, unknown>));
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteCareer(id: string): Promise<void> {
  if (!id) throw new Error('deleteCareer: id saknas');
  await deleteDoc(doc(db, 'career', id));
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
}

export async function toggleCareerPublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('toggleCareerPublished: id saknas');
  await updateDoc(doc(db, 'career', id), { published: !current });
  void bumpCacheVersion('career').catch(e => console.warn('[cache] bump failed:', e));
}
