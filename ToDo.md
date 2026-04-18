# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

---

## Epic 1: Navigation & Landningssidor

- [ ] **`/corporate/post` saknas** — Länken "Annonsera hos oss" i `CorporateContent.tsx` (services-sektion) pekar på en sida som inte finns. Bygg sidan eller byt länk.

---

## Epic 2: Eventsystem

- [ ] _(Framtid)_ Bygg Admin-login och dashboard för redigering och publicering av nya events.

---

## Epic 3: Karriärportalen

- [ ] _(Framtid)_ Admin-dashboard för att lägga till, redigera och avpublicera jobbannonser utan att gå via Firestore-konsolen.

---

## Tekniska & Arkitektoniska Förbättringar

- [ ] **SEO: `robots.txt` och `sitemap.xml`** — Statiska filer saknas i `/public/`. Crawlers har ingen guide och indexering tar längre tid.

- [ ] **CSP: Ta bort `unsafe-eval`** — `script-src` i `next.config.ts` innehåller `'unsafe-eval'` som inte behövs i produktionsbygge. Bör tas bort för skärpt säkerhetspolicy.

- [ ] _(Framtid)_ Validera rendering genom prestandatester och säkerställ tillgänglighets-score >90 med `.agents/skills/design-auditor.md`.
