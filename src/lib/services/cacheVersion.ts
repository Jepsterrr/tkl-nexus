import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';

export type CacheKey = 'events' | 'career' | 'deals';

/**
 * Hämtar settings/cacheVersion från server, jämför mot localStorage.
 * Returnerar 'cache' om data är färsk, 'server' annars.
 * Faller alltid tillbaka till 'server' vid nätverks- eller localStorage-fel.
 */
export async function getDataSource(key: CacheKey): Promise<'cache' | 'server'> {
  try {
    const snap = await withFetchTimeout(
      getDocFromServer(doc(db, 'settings', 'cacheVersion'))
    );

    if (!snap.exists()) return 'server';

    const data = snap.data();
    const ts = data[key];
    if (!ts || typeof ts.toMillis !== 'function') return 'server';
    const serverVersion = ts.toMillis();

    let localVersion: number;
    try {
      const raw = localStorage.getItem(`cacheVersion_${key}`);
      if (!raw) return 'server';
      localVersion = Number(raw);
    } catch {
      return 'server';
    }

    if (serverVersion > localVersion) {
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
 * Anropas fire-and-forget i admin write-funktioner:
 *   void bumpCacheVersion('events').catch(e => console.warn('[cache] bump failed:', e));
 *
 * setDoc med merge: true skapar dokumentet om det saknas.
 */
export async function bumpCacheVersion(key: CacheKey): Promise<void> {
  await setDoc(
    doc(db, 'settings', 'cacheVersion'),
    { [key]: serverTimestamp() },
    { merge: true }
  );
}
