/**
 * Genererar SEO/GEO-data vid byggtid från publik Firestore-data.
 *
 * Läser ENBART `published == true`-dokument med ENBART NEXT_PUBLIC_*-nycklar —
 * exakt vad en besökare redan kan läsa via klient-SDK:n. discountCode utelämnas
 * medvetet ur all output.
 *
 * Utflöden:
 *   - src/lib/generated/{career,events,deals}-jsonld.json  (ItemList-objekt)
 *   - public/llms.txt  (innehåll mellan LISTINGS-markörerna)
 *   - public/seo-hash.txt  (hash av den publika datan)
 *
 * Degraderar tyst: vid Firestore-fel skrivs INGA filer om (committade fallbacks
 * behålls) och processen exitar 0 — SEO-data får aldrig fälla en deploy.
 *
 * Lokalt: `node --env-file=.env.local scripts/generate-seo-data.mjs`
 * CI (cron): `node scripts/generate-seo-data.mjs --check-live`
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GEN_DIR = join(ROOT, 'src', 'lib', 'generated');
const LLMS_PATH = join(ROOT, 'public', 'llms.txt');
const HASH_PATH = join(ROOT, 'public', 'seo-hash.txt');
const SITE = 'https://tklnexus.se';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** UTC-instansen för midnatt i Europe/Stockholm — speglar servicelagret. */
function startOfTodayStockholmIso() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm', hourCycle: 'h23',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(now);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const elapsedMs = (get('hour') * 3600 + get('minute') * 60 + get('second')) * 1000 + now.getMilliseconds();
  return new Date(now.getTime() - elapsedMs).toISOString();
}

/** Firestore Timestamp | ISO-sträng → ISO-sträng. */
function toIso(ts) {
  if (!ts) return undefined;
  if (typeof ts === 'object' && ts !== null && typeof ts.toDate === 'function') return ts.toDate().toISOString();
  if (typeof ts === 'string') return ts;
  return undefined;
}

async function fetchPublished(db, name) {
  const snap = await getDocs(query(collection(db, name), where('published', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

const CAREER_EMPLOYMENT = { exjobb: 'INTERN', praktik: 'INTERN', trainee: 'FULL_TIME', jobb: 'FULL_TIME' };

function itemList(name, elements) {
  return { '@context': 'https://schema.org', '@type': 'ItemList', name, itemListElement: elements };
}
function listItem(position, item) {
  return { '@type': 'ListItem', position, item };
}

function buildCareer(docs) {
  const cutoff = startOfTodayStockholmIso();
  const active = docs
    .map((d) => ({ ...d, deadline: toIso(d.deadline), createdAt: toIso(d.createdAt) }))
    .filter((d) => d.title && d.company && d.deadline && d.deadline >= cutoff)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const elements = active.map((d, i) => listItem(i + 1, {
    '@type': 'JobPosting',
    title: d.title,
    datePosted: d.createdAt,
    validThrough: d.deadline,
    employmentType: CAREER_EMPLOYMENT[d.type] ?? 'FULL_TIME',
    hiringOrganization: { '@type': 'Organization', name: d.company },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: d.location || 'Luleå', addressCountry: 'SE' } },
    ...(d.description ? { description: d.description } : {}),
    ...(d.applyUrl ? { url: d.applyUrl } : {}),
  }));
  return { list: itemList('Exjobb & jobb', elements), active };
}

function buildEvents(docs) {
  const cutoff = startOfTodayStockholmIso();
  const active = docs
    .map((d) => ({ ...d, date: toIso(d.date), endDate: toIso(d.endDate) }))
    .filter((d) => d.title && d.endDate && d.endDate >= cutoff)
    .sort((a, b) => (a.endDate || '').localeCompare(b.endDate || ''));
  const elements = active.map((d, i) => listItem(i + 1, {
    '@type': 'Event',
    name: d.title,
    startDate: d.date,
    endDate: d.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: d.location || 'Luleå tekniska universitet' },
    ...(d.description ? { description: d.description } : {}),
  }));
  return { list: itemList('Kommande events', elements), active };
}

function buildDeals(docs) {
  const active = docs
    .map((d) => ({ ...d, createdAt: toIso(d.createdAt) }))
    .filter((d) => d.title && d.company)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const elements = active.map((d, i) => listItem(i + 1, {
    '@type': 'Offer',
    name: d.title,
    category: 'Studentrabatt',
    description: [d.discount, d.description].filter(Boolean).join(' – '),
    seller: { '@type': 'Organization', name: d.company },
    ...(d.link ? { url: d.link } : {}),
  })); // discountCode utelämnas medvetet
  return { list: itemList('Aktuella förmåner', elements), active };
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', dateStyle: 'medium' }).format(new Date(iso));
}

function buildLlmsSection(career, events, deals) {
  const lines = [];
  lines.push('## Aktuella exjobb & jobb', '');
  if (career.length) {
    for (const d of career) lines.push(`- ${d.title} — ${d.company}${d.location ? `, ${d.location}` : ''} (sista ansökan ${fmtDate(d.deadline)})`);
  } else lines.push('_Inga öppna annonser just nu._');
  lines.push('', '## Kommande events', '');
  if (events.length) {
    for (const d of events) lines.push(`- ${d.title}${d.location ? ` — ${d.location}` : ''} (${fmtDate(d.date)})`);
  } else lines.push('_Inga kommande events just nu._');
  lines.push('', '## Aktuella förmåner', '');
  if (deals.length) {
    for (const d of deals) lines.push(`- ${d.title} — ${d.company}${d.discount ? ` (${d.discount})` : ''}`);
  } else lines.push('_Inga aktiva förmåner just nu._');
  return lines.join('\n');
}

function writeLlms(section) {
  const current = readFileSync(LLMS_PATH, 'utf8');
  const re = /<!-- BEGIN LISTINGS -->[\s\S]*?<!-- END LISTINGS -->/;
  if (!re.test(current)) throw new Error('llms.txt: LISTINGS-markörer saknas');
  const next = current.replace(re, `<!-- BEGIN LISTINGS -->\n${section}\n<!-- END LISTINGS -->`);
  writeFileSync(LLMS_PATH, next);
}

/** Stabil hash: bara publicerade fält, sorterat på id. */
function computeHash(career, events, deals) {
  const pickCareer = (d) => ({ id: d.id, title: d.title, company: d.company, type: d.type, location: d.location, deadline: d.deadline, applyUrl: d.applyUrl ?? '', description: d.description ?? '' });
  const pickEvent = (d) => ({ id: d.id, title: d.title, date: d.date, endDate: d.endDate, location: d.location, description: d.description ?? '' });
  const pickDeal = (d) => ({ id: d.id, title: d.title, company: d.company, discount: d.discount ?? '', description: d.description ?? '', link: d.link ?? '' });
  const byId = (a, b) => a.id.localeCompare(b.id);
  const normalized = JSON.stringify({
    career: career.map(pickCareer).sort(byId),
    events: events.map(pickEvent).sort(byId),
    deals: deals.map(pickDeal).sort(byId),
  });
  return createHash('sha256').update(normalized).digest('hex');
}

function setGithubOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`, { flag: 'a' });
}

async function main() {
  const checkLive = process.argv.includes('--check-live');

  if (!firebaseConfig.projectId) {
    console.warn('[seo] NEXT_PUBLIC_FIREBASE_*-env saknas — hoppar över (behåller fallbacks).');
    setGithubOutput('changed', 'false');
    return;
  }

  let career, events, deals;
  try {
    const db = getFirestore(initializeApp(firebaseConfig));
    const [c, e, dl] = await Promise.all([
      fetchPublished(db, 'career'),
      fetchPublished(db, 'events'),
      fetchPublished(db, 'deals'),
    ]);
    career = buildCareer(c);
    events = buildEvents(e);
    deals = buildDeals(dl);
  } catch (err) {
    // Degradera tyst — skriv inga filer, fäll aldrig deployen.
    console.warn('[seo] Firestore-hämtning misslyckades, behåller befintlig data:', err?.message ?? err);
    setGithubOutput('changed', 'false');
    return;
  }

  const hash = computeHash(career.active, events.active, deals.active);

  if (checkLive) {
    let liveHash = '';
    try {
      const r = await fetch(`${SITE}/seo-hash.txt`);
      if (r.ok) liveHash = (await r.text()).trim();
    } catch (err) {
      console.warn('[seo] Kunde inte hämta live-hash:', err?.message ?? err);
    }
    const changed = liveHash !== hash;
    setGithubOutput('changed', String(changed));
    console.log(`[seo] live=${liveHash.slice(0, 12)} ny=${hash.slice(0, 12)} changed=${changed}`);
  }

  writeFileSync(join(GEN_DIR, 'career-jsonld.json'), JSON.stringify(career.list, null, 2) + '\n');
  writeFileSync(join(GEN_DIR, 'events-jsonld.json'), JSON.stringify(events.list, null, 2) + '\n');
  writeFileSync(join(GEN_DIR, 'deals-jsonld.json'), JSON.stringify(deals.list, null, 2) + '\n');
  writeLlms(buildLlmsSection(career.active, events.active, deals.active));
  writeFileSync(HASH_PATH, hash + '\n');

  console.log(`[seo] career=${career.active.length} events=${events.active.length} deals=${deals.active.length} hash=${hash.slice(0, 12)}`);
}

main().catch((err) => {
  // Sista skyddsnät — logga men fäll aldrig deployen.
  console.warn('[seo] Oväntat fel:', err?.message ?? err);
  setGithubOutput('changed', 'false');
});
