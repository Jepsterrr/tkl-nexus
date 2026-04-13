# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

---

## Aktuella Buggar & Prioriterade Fixes

- [ ] **Mobilscrollning — adressfältets reflow på alla mobila webbläsare**
  Specifikt när adressfältet på mobil döljs/visas vid scroll orsakas layout-reflow. Delvis åtgärdat (`svh`-enhet används), men `55vh` i `DealsContent.tsx` och `min-h-screen` i `career/page.tsx` är ännu inte fixade. Åtgärda alla `vh`-förekomster.

- [ ] **OG-image saknas** — Exportera `TKL NEXUS.svg` till `1200×630px` PNG och spara som `/public/og-image.png` för social sharing (LinkedIn, Discord, iMessage).

---

## Epic 1: Navigation & Landningssidor

- [ ] **`/corporate/post` saknas** — Länken "Annonsera hos oss" i `CorporateContent.tsx` (services-sektion) pekar på en sida som inte finns. Bygg sidan eller byt länk.

---

## Epic 2: Eventsystem

- [ ] _(Framtid)_ Bygg Admin-login och dashboard för redigering och publicering av nya events.

---

## Epic 3: Karriärportalen

Alla kärnfunktioner klara. Inga öppna punkter.

---

## Epic 4: Nexus Deals

Alla kärnfunktioner klara. Inga öppna punkter.

---

## Tekniska & Arkitektoniska Förbättringar

- [ ] **SEO: `robots.txt` och `sitemap.xml`** — Statiska filer saknas i `/public/`. Crawlers har ingen guide och indexering tar längre tid.

- [ ] **CSP: Ta bort `unsafe-eval`** — `script-src` i `next.config.ts` innehåller `'unsafe-eval'` som inte behövs i produktionsbygge. Bör tas bort för skärpt säkerhetspolicy.

- [ ] **Tillgänglighet: `role="status"` på tomma states** — `EventsContent`, `CareerContent` och `DealsContent` saknar `role="status"` på sina "inga resultat"-meddelanden. Skärmläsare informeras inte om tillståndsändringar.

- [ ] **Tillgänglighet: `aria-label` på mobil språkväxlare** — Knapparna "SV"/"EN" i mobilmenyn (Navbar) saknar `aria-label`. Desktop-versionen är korrekt implementerad.

- [ ] _(Framtid)_ Validera rendering genom prestandatester och säkerställ tillgänglighets-score >90 med `.agents/skills/design-auditor.md`.
