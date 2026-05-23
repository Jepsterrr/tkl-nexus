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
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  TKLProductSchema,
  TKLProductFormSchema,
  type TKLProduct,
  type TKLProductFormData,
} from '@/lib/schemas/product';
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

export async function getProducts(): Promise<TKLProduct[]> {
  const ref = collection(db, 'products');
  const q = query(ref, where('published', '==', true), orderBy('order', 'asc'));

  const source = await getDataSource('products');
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

  const items: TKLProduct[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const parsed = TKLProductSchema.safeParse({
      id: docSnap.id,
      ...data,
      createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    });
    if (parsed.success) items.push(parsed.data);
    else if (process.env.NODE_ENV === 'development')
      console.warn('[products] Ogiltigt dokument:', docSnap.id, parsed.error.flatten());
  });

  return items;
}

export async function getAllProducts(): Promise<TKLProduct[]> {
  const ref = collection(db, 'products');
  const q = query(ref, orderBy('order', 'asc'));
  const snapshot = await withFetchTimeout(getDocs(q));

  const items: TKLProduct[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const parsed = TKLProductSchema.safeParse({
      id: docSnap.id,
      ...data,
      createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
    });
    if (parsed.success) items.push(parsed.data);
  });

  return items;
}

export async function createProduct(data: TKLProductFormData): Promise<string> {
  const validated = TKLProductFormSchema.parse(data);
  const ref = collection(db, 'products');
  const docRef = await addDoc(ref, {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<TKLProductFormData>): Promise<void> {
  if (!id) throw new Error('updateProduct: id saknas');
  const validated = TKLProductFormSchema.partial().parse(data);
  await updateDoc(doc(db, 'products', id), omitUndefined(validated as Record<string, unknown>));
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteProduct(id: string): Promise<void> {
  if (!id) throw new Error('deleteProduct: id saknas');
  await deleteDoc(doc(db, 'products', id));
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
}

export async function toggleProductPublished(id: string, current: boolean): Promise<void> {
  if (!id) throw new Error('toggleProductPublished: id saknas');
  await updateDoc(doc(db, 'products', id), { published: !current });
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
}

export async function getMaxOrderForCategory(category: TKLProduct['category']): Promise<number> {
  const ref = collection(db, 'products');
  const q = query(ref, where('category', '==', category), orderBy('order', 'desc'), limit(1));
  const snapshot = await withFetchTimeout(getDocs(q));
  if (snapshot.empty) return 0;
  const data = snapshot.docs[0].data();
  return typeof data.order === 'number' ? data.order + 10 : 10;
}

export async function getProductById(id: string): Promise<TKLProduct | null> {
  const docRef = doc(db, 'products', id);
  const docSnap = await withFetchTimeout(getDoc(docRef));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  const parsed = TKLProductSchema.safeParse({
    id: docSnap.id,
    ...data,
    createdAt: toIso(data.createdAt) ?? new Date().toISOString(),
  });
  return parsed.success ? parsed.data : null;
}
