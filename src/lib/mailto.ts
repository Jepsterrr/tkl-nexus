// Ren logik utan `@/`-importer så att Playwright kan köra den som enhetstest.

/**
 * Max längd på hela den kodade mailto-URL:en. Windows (ShellExecute/Outlook)
 * öppnar inte mailprogrammet alls över ≈2083 tecken, och många klienter kapar
 * redan runt 2000 — 1800 ger marginal.
 */
export const MAILTO_MAX_LENGTH = 1800;

/**
 * Ämnets andel av gränsen (kodad längd). Fritext i ämnet (titel, företag) får aldrig
 * tränga undan själva bodyn — ett långt ämne kapas med "…" så att prefixet alltid
 * lämnar plats åt kontaktblocket.
 */
const SUBJECT_SHARE = 0.25;
const ELLIPSIS = '…';

/** Sista raden i en kapad body. Mailet läses av kåren/avsändaren — svenska. */
export const MAILTO_TRUNCATED_MARKER =
  '\n\n[TEXTEN KAPAD FÖR LÄNGD — klistra in hela texten från urklipp om avsändaren kopierade den, annars be avsändaren skicka resten]';

export interface MailtoResult {
  /** URL att navigera till — ≤ maxLength för kapade mail, så länge själva prefixet (mottagare + ämne) ryms. */
  url: string;
  /** Hela, okapade bodyn (för urklipp). */
  body: string;
  /** true om bodyn i URL:en är kapad. */
  truncated: boolean;
}

export function buildMailto(
  email: string,
  subject: string,
  body: string,
  opts: { maxLength?: number; marker?: string } = {},
): MailtoResult {
  const maxLength = opts.maxLength ?? MAILTO_MAX_LENGTH;
  const marker = opts.marker ?? MAILTO_TRUNCATED_MARKER;

  // Klipp på rå sträng (per kodpunkt → aldrig mitt i ett surrogatpar) före
  // kodning, så att ingen %-sekvens kan klippas av. Kodad längd växer
  // monotont med antalet kodpunkter → binärsök efter största som ryms.
  const fit = (text: string, budget: number): string => {
    const points = Array.from(text);
    let lo = 0;
    let hi = points.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (encodeURIComponent(points.slice(0, mid).join('')).length <= budget) lo = mid;
      else hi = mid - 1;
    }
    return points.slice(0, lo).join('');
  };

  const subjectBudget = Math.floor(maxLength * SUBJECT_SHARE);
  const ellipsisLen = encodeURIComponent(ELLIPSIS).length;
  const safeSubject =
    encodeURIComponent(subject).length <= subjectBudget
      ? subject
      : subjectBudget < ellipsisLen
        ? fit(subject, subjectBudget)
        : fit(subject, subjectBudget - ellipsisLen).trimEnd() + ELLIPSIS;

  const prefix = `mailto:${email}?subject=${encodeURIComponent(safeSubject)}&body=`;
  const fullUrl = prefix + encodeURIComponent(body);

  if (fullUrl.length <= maxLength) return { url: fullUrl, body, truncated: false };

  const markerLen = encodeURIComponent(marker).length;
  const budget = maxLength - prefix.length - markerLen;
  if (budget < 0) {
    // Prefix + markör ryms inte ens utan body: tom body, markören kapas till det som ryms.
    // Om prefixet självt överstiger gränsen går det inte att hålla URL:en under den — då skickas prefixet.
    return { url: prefix + encodeURIComponent(fit(marker, maxLength - prefix.length)), body, truncated: true };
  }
  return { url: prefix + encodeURIComponent(fit(body, budget) + marker), body, truncated: true };
}
