import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nextConfig from '../../next.config';

/**
 * Paritet mellan next.config.ts och firebase.json.
 *
 * Produktionen serveras statiskt av Firebase Hosting och använder ENBART
 * headers i firebase.json — next.config.ts gäller bara `next dev`/`next start`
 * (det som övriga E2E-tester körs mot). Utan detta test kan filerna glida isär
 * utan att något blir rött, och produktionen tappar då skydd som testerna
 * tror finns.
 */

type Header = { key: string; value: string };
type HeaderRule = { source: string; headers: Header[] };

function toMap(headers: Header[]): Record<string, string> {
  return Object.fromEntries(headers.map((h) => [h.key.toLowerCase(), h.value]));
}

test.describe('Security headers — paritet next.config.ts ↔ firebase.json', () => {
  test('globala headers är identiska i båda filerna', async () => {
    // isDev i next.config.ts lägger till 'unsafe-eval' — jämförelsen gäller prod-varianten
    expect(process.env.NODE_ENV).not.toBe('development');

    const nextRules = (await nextConfig.headers?.()) ?? [];
    const nextGlobal = nextRules.find((r) => r.source === '/(.*)');
    expect(nextGlobal, 'next.config.ts saknar global headers-regel').toBeTruthy();

    const firebase = JSON.parse(readFileSync(join(process.cwd(), 'firebase.json'), 'utf8')) as {
      hosting: { headers: HeaderRule[] };
    };
    const firebaseGlobal = firebase.hosting.headers.find((r) => r.source === '/**');
    expect(firebaseGlobal, 'firebase.json saknar global headers-regel').toBeTruthy();

    expect(toMap(firebaseGlobal!.headers)).toEqual(toMap(nextGlobal!.headers));
  });
});
