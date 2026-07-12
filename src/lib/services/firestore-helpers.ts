import {
  deleteField,
  doc,
  getDocsFromCache,
  getDocsFromServer,
  runTransaction,
  type DocumentData,
  type Query,
  type QuerySnapshot,
} from 'firebase/firestore';
import type { z } from 'zod';
import { db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';
import { getDataSource, markCacheFresh, type CacheKey } from './cacheVersion';

/** Firestore Timestamp | ISO-sträng → ISO-sträng. */
export function toIso(ts: unknown): string | undefined {
  if (!ts) return undefined;
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  if (typeof ts === 'string') return ts;
  return undefined;
}

/**
 * Växlar `published` atomiskt utifrån serverns aktuella värde — inte det
 * (potentiellt inaktuella) värde UI:t senast såg. Utan transaktion kan två
 * admins som togglar samtidigt skriva över varandra med gammalt state.
 * `pathSegments` är dokumentets kollektionsväg, t.ex. ['events'] eller
 * ['settings', 'eventTypes', 'items'].
 */
export async function togglePublishedField(pathSegments: [string, ...string[]], id: string): Promise<void> {
  if (!id) throw new Error('togglePublishedField: id saknas');
  const [first, ...rest] = pathSegments;
  const ref = doc(db, first, ...rest, id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error(`togglePublishedField: dokumentet ${id} finns inte`);
    tx.update(ref, { published: snap.data().published !== true });
  });
}

/** Firestore accepterar inte undefined-värden — filtrera bort dem före skrivning. */
export function omitUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * För update-skrivningar: formulären sätter tömda valfria fält till undefined.
 * omitUndefined skulle tyst lämna det gamla värdet kvar i dokumentet — här
 * konverteras undefined i stället till deleteField() så fältet raderas.
 */
export function undefinedToDeleteField(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? deleteField() : v]),
  );
}

/**
 * UTC-instansen för midnatt i Europe/Stockholm som ISO-sträng.
 * Cutoffen för "pågående" dokument ska följa Stockholmsdygnet oavsett
 * besökarens tidszon — inte klientens lokala midnatt.
 *
 * INVARIANT: datumfält (events.date/endDate, career.deadline) lagras alltid
 * som ISO-strängar. Firestore matchar aldrig olika typer i range-queries —
 * ett dokument där fältet skrivits som Timestamp (t.ex. via konsolen)
 * försvinner TYST ur listorna. Skriv aldrig datumfält som Timestamp.
 */
export function startOfTodayStockholmIso(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const elapsedMs =
    (get('hour') * 3600 + get('minute') * 60 + get('second')) * 1000 + now.getMilliseconds();
  return new Date(now.getTime() - elapsedMs).toISOString();
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
      const snap = await withFetchTimeout(getDocsFromServer(q));
      void markCacheFresh(key);
      return snap;
    }
  }
  const snap = await withFetchTimeout(getDocsFromServer(q));
  void markCacheFresh(key);
  return snap;
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
