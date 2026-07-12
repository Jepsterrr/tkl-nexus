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
  limit,
  serverTimestamp,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  TKLProductSchema,
  TKLProductFormSchema,
  type TKLProduct,
  type TKLProductFormData,
} from '@/lib/schemas/product';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { bumpCacheVersion } from './cacheVersion';
import { getDocsWithCacheStrategy, parseSnapshot, toIso, omitUndefined, undefinedToDeleteField, togglePublishedField } from './firestore-helpers';

function productDates(data: DocumentData): Record<string, unknown> {
  return { createdAt: toIso(data.createdAt) ?? new Date().toISOString() };
}

export async function getProducts(): Promise<TKLProduct[]> {
  const q = query(
    collection(db, 'products'),
    where('published', '==', true),
    orderBy('order', 'asc'),
  );
  const snapshot = await getDocsWithCacheStrategy(q, 'products');
  return parseSnapshot(snapshot, TKLProductSchema, 'products', productDates);
}

export async function getAllProducts(): Promise<TKLProduct[]> {
  const q = query(collection(db, 'products'), orderBy('order', 'asc'));
  const snapshot = await withFetchTimeout(getDocs(q));
  return parseSnapshot(snapshot, TKLProductSchema, 'products', productDates);
}

export async function createProduct(data: TKLProductFormData): Promise<string> {
  const validated = TKLProductFormSchema.parse(data);
  const docRef = await addDoc(collection(db, 'products'), {
    ...omitUndefined(validated as Record<string, unknown>),
    createdAt: serverTimestamp(),
  });
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<TKLProductFormData>): Promise<void> {
  if (!id) throw new Error('updateProduct: id saknas');
  const validated = TKLProductFormSchema.partial().parse(data);
  // Tömda valfria fält (undefined) ska raderas ur dokumentet — inte lämnas kvar.
  await updateDoc(doc(db, 'products', id), undefinedToDeleteField({ ...data, ...validated } as Record<string, unknown>));
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
}

export async function deleteProduct(id: string): Promise<void> {
  if (!id) throw new Error('deleteProduct: id saknas');
  await deleteDoc(doc(db, 'products', id));
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
}

export async function toggleProductPublished(id: string): Promise<void> {
  await togglePublishedField(['products'], id);
  void bumpCacheVersion('products').catch(e => console.warn('[cache] bump failed:', e));
}

export async function getMaxOrderForCategory(category: TKLProduct['category']): Promise<number> {
  const q = query(
    collection(db, 'products'),
    where('category', '==', category),
    orderBy('order', 'desc'),
    limit(1),
  );
  const snapshot = await withFetchTimeout(getDocs(q));
  if (snapshot.empty) return 0;
  const data = snapshot.docs[0].data();
  return typeof data.order === 'number' ? data.order + 10 : 10;
}

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, 'products', id), { order: (index + 1) * 10 });
  });
  await batch.commit();
  void bumpCacheVersion('products').catch((e) =>
    console.warn('[cache] bump failed:', e)
  );
}

export async function getProductById(id: string): Promise<TKLProduct | null> {
  const docSnap = await withFetchTimeout(getDoc(doc(db, 'products', id)));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  const parsed = TKLProductSchema.safeParse({ id: docSnap.id, ...data, ...productDates(data) });
  return parsed.success ? parsed.data : null;
}
