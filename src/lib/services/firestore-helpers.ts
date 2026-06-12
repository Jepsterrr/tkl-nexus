import {
  getDocsFromCache,
  getDocsFromServer,
  type DocumentData,
  type Query,
  type QuerySnapshot,
} from 'firebase/firestore';
import type { z } from 'zod';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { getDataSource, type CacheKey } from './cacheVersion';

/** Firestore Timestamp | ISO-sträng → ISO-sträng. */
export function toIso(ts: unknown): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return undefined;
}

/** Firestore accepterar inte undefined-värden — filtrera bort dem före skrivning. */
export function omitUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * Hämtar ett query-snapshot enligt cacheVersion-strategin:
 * lokal IndexedDB-cache om datan är färsk, annars server (med cache-fallback
 * åt andra hållet vid tom/misslyckad cache-läsning).
 */
export async function getDocsWithCacheStrategy(
  q: Query,
  key: CacheKey,
): Promise<QuerySnapshot> {
  const source = await getDataSource(key);
  if (source === 'cache') {
    try {
      const snap = await withFetchTimeout(getDocsFromCache(q));
      if (snap.empty) throw new Error('cache empty');
      return snap;
    } catch {
      return withFetchTimeout(getDocsFromServer(q));
    }
  }
  return withFetchTimeout(getDocsFromServer(q));
}

/**
 * Parsar varje dokument i ett snapshot mot ett Zod-schema.
 * Ogiltiga dokument hoppas över och loggas i dev — ett trasigt dokument
 * får aldrig fälla hela listan.
 *
 * `transform` kan skriva över råfält (t.ex. Timestamp → ISO) före parsning.
 */
export function parseSnapshot<T>(
  snapshot: QuerySnapshot,
  schema: z.ZodType<T>,
  label: string,
  transform?: (data: DocumentData) => Record<string, unknown>,
): T[] {
  const items: T[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const parsed = schema.safeParse({
      id: docSnap.id,
      ...data,
      ...(transform ? transform(data) : {}),
    });
    if (parsed.success) {
      items.push(parsed.data);
    } else if (process.env.NODE_ENV === 'development') {
      console.warn(`[${label}] Ogiltigt dokument:`, docSnap.id, parsed.error.flatten());
    }
  });
  return items;
}
