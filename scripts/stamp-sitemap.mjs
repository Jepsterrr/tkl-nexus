/**
 * Stämplar om alla <lastmod> i public/sitemap.xml till dagens datum (UTC).
 * Körs i deploy-workflowen före `firebase deploy` — sajten är helstatisk och
 * innehållet uppdateras per deploy, så deploy-datumet är rätt färskhetssignal.
 * Kör aldrig detta lokalt i vanliga fall (skapar bara diff-brus).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const sitemapPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

const xml = readFileSync(sitemapPath, 'utf8');
const stamped = xml.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

if (stamped === xml && !xml.includes('<lastmod>')) {
  console.error('stamp-sitemap: inga <lastmod>-taggar hittades — kontrollera sitemap.xml');
  process.exit(1);
}

writeFileSync(sitemapPath, stamped);
console.log(`stamp-sitemap: lastmod → ${today}`);
