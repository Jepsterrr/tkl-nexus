# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

## Uppföljning från designgranskning 2026-06-12

- [ ] Ladda upp logotyper för deals
- [ ] DNS-post för www.tklnexus.se saknas (lägg till custom domain i Firebase Hosting + CNAME hos registrar)

  Underlag att skicka till webbmästare med åtkomst till Simply.com och Firebase Console:

  www.tklnexus.se går inte att nå eftersom underdomänen saknar DNS-post. Besökare som skriver www. framför adressen får ett serverfel. Huvuddomänen tklnexus.se fungerar och pekar på Firebase Hosting (199.36.158.100). Domänens DNS hanteras hos Simply.com (ns1, ns2 och ns3.simply.com). Åtgärden tar cirka 10 minuter och kräver inloggning på båda tjänsterna.

  Steg 1, Firebase Console: Gå till projektet tkl-nexus, välj Hosting och sedan Add custom domain. Ange www.tklnexus.se och välj "Redirect to an existing website" med tklnexus.se som mål. www ska alltså omdirigera till huvuddomänen, inte vara en egen sajt. Firebase visar därefter vilka DNS-poster som ska skapas, vanligtvis en CNAME och ibland en TXT-post för ägarverifiering. Notera exakt vad som visas.

  Steg 2, Simply.com: Logga in och öppna DNS-administrationen för tklnexus.se. Skapa posterna från steg 1. Typiskt blir det subdomän www, typ CNAME, mål tklnexus.se, men följ exakt det Firebase angav.

  Steg 3, verifiering: Propageringen tar från några minuter upp till någon timme. Firebase utfärdar SSL-certifikat automatiskt när posten syns. Kontrollera att https://www.tklnexus.se omdirigerar till https://tklnexus.se utan certifikatvarning. Ingen kod eller deploy berörs, detta är enbart konfiguration.

## E2E-tester att lägga till

Befintlig svit (`e2e/`) täcker: rutter/404/skip-länk, språk/tema-toggle, career-drawer, axe WCAG AA (7 sidor × 2 viewports × 2 teman), security headers. Följande saknas, i prioritetsordning:

### P1 — kärninteraktivitet
- [x] Filter-tabs på `/career` (`filters-search.spec.ts`)
- [x] Sökfältet på `/career` — no-results med query, rensa-knapp
- [x] Filter-tabs + sök på `/events`
- [x] Deals vytoggle ikon/detalj + localStorage-persistens (`deals.spec.ts`)
- [x] DealCard klick-för-kopiera — clipboard + "Kopierat!"-feedback
- [x] DealDrawer — livscykel (URL-synk, Escape, fokus)
- [x] EventDrawer — livscykel (`drawer.spec.ts`, datadrivet skip tills events publiceras)

### P2 — integrationer och riskabla områden
- [x] LUDD-fliken — mockat API via `page.route()` med relativa fixture-datum (`ludd.spec.ts`), inkl. API-fel/retry
- [x] LuddCalendar — månadsnavigering, datumval, tomt datum
- [x] Hash-ankarlänkar — `/about#kontakt` via klick + direktnavigering (`anchors.spec.ts`)
- [x] Corporate/post — ARIA-tabbar + piltangenter, validerings-gate, success-state (`post-form.spec.ts`). OBS: mailto-`href`-innehållet asserteras inte (submit sätter `window.location.href`, inte ett `<a>` — mailto blockeras tyst i headless)

### P3 — kräver förutsättningar som saknas idag
- [ ] CookieConsent accept/decline-flöde — blockerad tills `ANALYTICS_ENABLED=true` (bannern renderas inte alls nu)
- [ ] Admin login + AuthGuard-redirect — kräver testanvändare i Firebase Auth eller emulator-setup
- [ ] Admin CRUD (events/career/deals/products) — kräver emulator (skriv aldrig mot live i test)
- [ ] Visuell regression (Playwright `toHaveScreenshot`) på hero-sektionerna, bägge teman
- [ ] Full i18n-svep — alla publika sidor renderar utan svenska strängar i EN-läge
