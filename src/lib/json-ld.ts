/**
 * Serialiserar JSON-LD för inbäddning i <script>-taggar.
 * JSON.stringify escapar INTE "<" — en admin-skriven titel som innehåller
 * "</script><script>…" bryter sig annars ur taggen och exekverar (CSP:n
 * stoppar det inte eftersom script-src kräver 'unsafe-inline' för Next.js).
 * Använd alltid denna istället för JSON.stringify i dangerouslySetInnerHTML.
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
