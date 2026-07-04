# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

## Uppföljning från designgranskning 2026-06-12

- [ ] Ladda upp logotyper för deals
- [ ] DNS-post för www.tklnexus.se saknas (lägg till custom domain i Firebase Hosting + CNAME hos registrar)

## E2E-tester att lägga till

Befintlig svit (`e2e/`) täcker: rutter/404/skip-länk, språk/tema-toggle, career-drawer, axe WCAG AA (7 sidor × 2 viewports × 2 teman), security headers. Följande saknas, i prioritetsordning:

### P1 — kärninteraktivitet (deterministiska, bygg nu)
- [ ] Filter-tabs på `/career` — klick per typ, `aria-pressed`, grid uppdateras
- [ ] Sökfältet på `/career` — filtrering, tomt sökresultat-state med query i texten, rensa-knappen (X)
- [ ] Filter-tabs + sök på `/events` (samma mönster, sektionsfilter)
- [ ] Deals vytoggle ikon/detalj — växling + `tkl-deals-view`-persistens i localStorage efter reload
- [ ] DealCard klick-för-kopiera — clipboard-innehåll + "kopierad"-feedback (kräver `clipboard-read`-permission i Playwright-context)
- [ ] DealDrawer — samma livscykel som career-drawern (URL-synk, Escape, fokus); datadrivet skip som career
- [ ] EventDrawer — samma livscykel; datadrivet skip

### P2 — integrationer och riskabla områden
- [ ] LUDD-fliken på `/events` — mocka `events.ludd.ltu.se` via `page.route()` med fixture-JSON (aldrig live-API i test), verifiera lista + kalendervy
- [ ] LuddCalendar — månadsnavigering (prev disabled på innevarande), datumval filtrerar events, event-prickar
- [ ] Hash-ankarlänkar — `/about#kontakt` från Navbar/CTA scrollar rätt i custom scroll-container (historiskt buggigt område, se ScrollContainer/ScrollResetter)
- [ ] Corporate/post — tab-växling (Opportunity/Event/Deal), obligatoriska fält blockerar submit, mailto-`href` innehåller formulärdata

### P3 — kräver förutsättningar som saknas idag
- [ ] CookieConsent accept/decline-flöde — blockerad tills `ANALYTICS_ENABLED=true` (bannern renderas inte alls nu)
- [ ] Admin login + AuthGuard-redirect — kräver testanvändare i Firebase Auth eller emulator-setup
- [ ] Admin CRUD (events/career/deals/products) — kräver emulator (skriv aldrig mot live i test)
- [ ] Visuell regression (Playwright `toHaveScreenshot`) på hero-sektionerna, bägge teman
- [ ] Full i18n-svep — alla publika sidor renderar utan svenska strängar i EN-läge
