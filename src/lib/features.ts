/**
 * Feature-flaggor. Koden för en avstängd funktion ligger kvar — flaggan
 * styr bara om den länkas/exponeras.
 *
 * OBS: `public/sitemap.xml` och `public/llms.txt` är statiska filer och måste
 * återställas manuellt (Deals-URL:er/-text) när en funktion aktiveras igen.
 */

/** NEXUS Deals är dolt tillsvidare. */
export const DEALS_ENABLED: boolean = false;
