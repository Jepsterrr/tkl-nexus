import { test, expect } from '@playwright/test';
import { buildMailto, MAILTO_MAX_LENGTH, MAILTO_TRUNCATED_MARKER } from '../../src/lib/mailto';

const EMAIL = 'ao@teknologkaren.se';
const SUBJECT = '[NEXUS Portal] exjobb – Ångström AB – Systemutvecklare åäö';

function bodyOf(url: string): string {
  const raw = url.slice(url.indexOf('&body=') + '&body='.length);
  return decodeURIComponent(raw); // kastar om ett %-fragment är avklippt
}

test.describe('buildMailto', () => {
  test('kort body ger exakt samma URL som tidigare och truncated=false', () => {
    const body = 'Rad 1\nRad 2 åäö 😀';
    const r = buildMailto(EMAIL, SUBJECT, body);
    expect(r.url).toBe(
      `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`,
    );
    expect(r.body).toBe(body);
    expect(r.truncated).toBe(false);
  });

  const cases: Record<string, string> = {
    'ascii 2000+': 'x'.repeat(2500),
    'åäö 2000+': 'åäöÅÄÖ'.repeat(500),
    'emoji 2000+': '😀🚀'.repeat(800),
    'radbrytningar': 'rad med text\r\n\n'.repeat(400),
    'blandat': 'Ångström – Luleå 😀\n%25 100% & = ? # '.repeat(150),
  };

  for (const [name, input] of Object.entries(cases)) {
    test(`kapad URL ryms alltid under gränsen (${name})`, () => {
      const r = buildMailto(EMAIL, SUBJECT, input);
      expect(r.truncated).toBe(true);
      expect(r.url.length).toBeLessThanOrEqual(MAILTO_MAX_LENGTH);
      // Hela, okapade texten returneras oförändrad (för urklipp)
      expect(r.body).toBe(input);
      // Inget avklippt %-fragment / surrogatpar: decode kastar inte
      const sent = bodyOf(r.url);
      expect(sent.endsWith(MAILTO_TRUNCATED_MARKER)).toBe(true);
      // Subject och prefix är intakta
      expect(r.url.startsWith(`mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=`)).toBe(true);
      // Början av texten bevaras (rubrik/kontaktblock)
      const kept = sent.slice(0, sent.length - MAILTO_TRUNCATED_MARKER.length);
      expect(input.startsWith(kept)).toBe(true);
      expect(kept.length).toBeGreaterThan(100);
    });
  }

  test('fyller gränsen: ett tecken till hade inte ryms', () => {
    const input = 'a'.repeat(5000);
    const r = buildMailto(EMAIL, SUBJECT, input);
    // 'a' kodas till 1 tecken — kapningen ska utnyttja budgeten helt
    expect(r.url.length).toBe(MAILTO_MAX_LENGTH);
  });

  test('respekterar egen maxLength', () => {
    const r = buildMailto(EMAIL, SUBJECT, 'x'.repeat(3000), { maxLength: 600 });
    expect(r.url.length).toBeLessThanOrEqual(600);
    expect(r.truncated).toBe(true);
  });

  test('body precis på gränsen kapas inte', () => {
    const prefixLen = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=`.length;
    const exact = 'y'.repeat(MAILTO_MAX_LENGTH - prefixLen);
    const r = buildMailto(EMAIL, SUBJECT, exact);
    expect(r.truncated).toBe(false);
    expect(r.url.length).toBe(MAILTO_MAX_LENGTH);
    const over = buildMailto(EMAIL, SUBJECT, exact + 'y');
    expect(over.truncated).toBe(true);
    expect(over.url.length).toBeLessThanOrEqual(MAILTO_MAX_LENGTH);
  });

  test('prefix + markör större än gränsen: kastar inte, tom body och markören kapad så att URL:en ryms', () => {
    const prefixLen = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=`.length;
    const maxLength = prefixLen + 40; // markören (kodad) är betydligt längre än 40
    const r = buildMailto(EMAIL, SUBJECT, 'x'.repeat(3000), { maxLength });
    expect(r.truncated).toBe(true);
    expect(r.url.length).toBeLessThanOrEqual(maxLength);
    expect(r.body).toBe('x'.repeat(3000));
    const sent = bodyOf(r.url); // kastar om ett %-fragment är avklippt
    // Bodyn är enbart (en början av) markören — inget av själva texten följer med.
    // (Markören innehåller själv ett "x" i "texten", så not.toContain('x') räcker inte
    // sedan ämnet kapas och mer av markören ryms.)
    expect(MAILTO_TRUNCATED_MARKER.startsWith(sent)).toBe(true);
    expect(sent.startsWith('x')).toBe(false);
  });

  test('prefixet ensamt större än gränsen: kastar inte, body blir tom', () => {
    const r = buildMailto(EMAIL, SUBJECT, 'x'.repeat(3000), { maxLength: 20 });
    expect(r.truncated).toBe(true);
    expect(bodyOf(r.url)).toBe('');
  });
});

test.describe('buildMailto — långt ämne', () => {
  test('titel på 2000 tecken: URL:en ryms, ämnet kapas med "…" och bodyn får plats', () => {
    const longTitle = 'Å'.repeat(2000);
    const subject = `[NEXUS Portal] exjobb – Ångström AB – ${longTitle}`;
    const body = 'Kontaktperson: Anna\nKontakt-e-post: anna@example.com\n' + 'x'.repeat(3000);
    const r = buildMailto(EMAIL, subject, body);
    expect(r.url.length).toBeLessThanOrEqual(MAILTO_MAX_LENGTH);
    expect(r.truncated).toBe(true);

    const rawSubject = r.url.slice(r.url.indexOf('?subject=') + '?subject='.length, r.url.indexOf('&body='));
    // Ämnet tar högst en fjärdedel av gränsen och lämnar plats åt bodyn
    expect(rawSubject.length).toBeLessThanOrEqual(Math.floor(MAILTO_MAX_LENGTH / 4));
    const sentSubject = decodeURIComponent(rawSubject); // kastar vid avklippt %-sekvens
    expect(sentSubject.startsWith('[NEXUS Portal] exjobb – Ångström AB – Å')).toBe(true);
    expect(sentSubject.endsWith('…')).toBe(true);

    // Kontaktblocket i bodyns början överlever kapningen
    const sent = bodyOf(r.url);
    expect(sent.startsWith('Kontaktperson: Anna\nKontakt-e-post: anna@example.com')).toBe(true);
    expect(sent.endsWith(MAILTO_TRUNCATED_MARKER)).toBe(true);
  });

  test('kort ämne lämnas orört', () => {
    const r = buildMailto(EMAIL, SUBJECT, 'kort');
    expect(r.url).toContain(`?subject=${encodeURIComponent(SUBJECT)}&body=`);
  });
});
