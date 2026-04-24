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
import { CareerSchema, CareerFormSchema, type TKLCareer, type CareerFormData } from '@/lib/schemas/career';
import { withFetchTimeout } from '@/lib/fetch-timeout';

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

export async function getPublishedCareer(): Promise<TKLCareer[]> {
  const ref = collection(db, 'career');
  const q = query(ref, where('published', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await withFetchTimeout(getDocs(q));

  const items: TKLCareer[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const parsed = CareerSchema.safeParse({
      id: docSnap.id,
      ...data,
      deadline: toIso(data.deadline) ?? data.deadline,
      createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    });
    if (parsed.success) items.push(parsed.data);
    else console.error(`Valideringsfel för career ${docSnap.id}:`, parsed.error);
  });

  const now = new Date();
  return items.filter(o => {
    if (!o.deadline) return true;
    const d = new Date(o.deadline);
    d.setHours(d.getHours() + 24);
    return d > now;
  });
}

export async function getAllCareer(): Promise<TKLCareer[]> {
  const ref = collection(db, 'career');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snapshot = await withFetchTimeout(getDocs(q));

  const items: TKLCareer[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const parsed = CareerSchema.safeParse({
      id: docSnap.id,
      ...data,
      deadline: toIso(data.deadline) ?? data.deadline,
      createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    });
    if (parsed.success) items.push(parsed.data);
    else if (process.env.NODE_ENV === 'development')
      console.warn('[career] Ogiltigt dokument:', docSnap.id, parsed.error.flatten());
  });

  return items;
}

export async function getCareerById(id: string): Promise<TKLCareer | null> {
  const docRef = doc(db, 'career', id);
  const docSnap = await withFetchTimeout(getDoc(docRef));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  const parsed = CareerSchema.safeParse({
    id: docSnap.id,
    ...data,
    deadline: toIso(data.deadline) ?? data.deadline,
    createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
  });
  if (!parsed.success) {
    console.error(`Valideringsfel för career ${docSnap.id}:`, parsed.error);
    return null;
  }
  return parsed.data;
}

export async function createCareer(data: CareerFormData): Promise<string> {
  const validated = CareerFormSchema.parse(data);
  const ref = collection(db, 'career');
  const docRef = await addDoc(ref, {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCareer(id: string, data: Partial<CareerFormData>): Promise<void> {
  if (!id) throw new Error('updateCareer: id saknas');
  const validated = CareerFormSchema.partial().parse(data);
  await updateDoc(doc(db, 'career', id), omitUndefined(validated as Record<string, unknown>));
}

export async function deleteCareer(id: string): Promise<void> {
  if (!id) throw new Error('deleteCareer: id saknas');
  await deleteDoc(doc(db, 'career', id));
}

export async function toggleCareerPublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('toggleCareerPublished: id saknas');
  await updateDoc(doc(db, 'career', id), { published: !current });
}
