import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';

export type CacheKey = 'events' | 'career' | 'deals' | 'products' | 'settings';

const TTL_MS = 60_000;

let versionsPromise: Promise<Record<string, number> | null> | null = null;
let fetchedAt = 0;

/**
 * Läser settings/cacheVersion från servern, memoiserat i 60 s.
 * Alla nycklar bor i samma dokument — en sidvisning som hämtar events,
 * deals och settings kostar därmed EN versions-read istället för tre.
 */
function getServerVersions(): Promise<Record<string, number> | null> {
  const now = Date.now();
  if (versionsPromise && now - fetchedAt <= TTL_MS) return versionsPromise;

  fetchedAt = now;
  versionsPromise = withFetchTimeout(
    getDocFromServer(doc(db, 'settings', 'cacheVersion'))
  )
    .then((snap) => {
      if (!snap.exists()) return null;
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(snap.data())) {
        if (v && typeof (v as { toMillis?: unknown }).toMillis === 'function') {
          out[k] = (v as { toMillis(): number }).toMillis();
        }
      }
      return out;
    })
    .catch((e) => {
      // Misslyckad hämtning ska inte memoiseras i 60 s
      versionsPromise = null;
      throw e;
    });

  return versionsPromise;
}

/**
 * Jämför serverversionen mot localStorage.
 * Returnerar 'cache' om lokal data är färsk, 'server' annars.
 * Faller alltid tillbaka till 'server' vid nätverks- eller localStorage-fel.
 */
export async function getDataSource(key: CacheKey): Promise<'cache' | 'server'> {
  try {
    const versions = await getServerVersions();
    const serverVersion = versions?.[key];
    if (!serverVersion) return 'server';

    let localVersion: number | null = null;
    try {
      const raw = localStorage.getItem(`cacheVersion_${key}`);
      localVersion = raw ? Number(raw) : null;
    } catch {
      return 'server';
    }

    // Första besöket (ingen lokal version) eller äldre lokal version:
    // hämta från server och spara versionen så nästa besök kan gå mot cache.
    if (localVersion === null || serverVersion > localVersion) {
      try {
        localStorage.setItem(`cacheVersion_${key}`, String(serverVersion));
      } catch {
        // localStorage write misslyckades — fortsätt ändå
      }
      return 'server';
    }

    return 'cache';
  } catch {
    return 'server';
  }
}

/**
 * Bumpar rätt fält i settings/cacheVersion med serverTimestamp().
 * Anropas fire-and-forget i admin write-funktioner.
 * setDoc med merge: true skapar dokumentet om det saknas.
 */
export async function bumpCacheVersion(key: CacheKey): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'cacheVersion'),
    { [key]: serverTimestamp() },
    { merge: true }
  );
  // Nästa läsning i samma session ska se den nya versionen direkt
  versionsPromise = null;
}
