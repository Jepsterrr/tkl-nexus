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

## Uppföljning från kodgranskning

- [ ] GCP-åtkomst saknas för WIF-setup (byte från service account-JSON till Workload Identity Federation i deploy-pipelinen)

  Underlag att skicka till projektets ägare eller Teknologkårens Google Workspace-admin (den som skapade Firebase-projektet, eller den som skapade service-kontot bakom GitHub-secreten `FIREBASE_SERVICE_ACCOUNT`):

  GitHub Actions deployar idag sajten till Firebase Hosting med en långlivad service account-nyckel (JSON) som ligger som secret i GitHub. Den ska ersättas med Workload Identity Federation (WIF), där GitHub istället får kortlivade tokens direkt från Google — ingen nyckel som kan läcka eller behöver roteras. Problemet: webmaster-kontot web@tklnexus.se har Firebase-behörigheter men saknar IAM-åtkomst på GCP-nivå (`resourcemanager.projects.get` och `iam.*` nekas), så setupen går inte att göra utan er hjälp. Projektet heter tkl-nexus (projektnummer 194298580940) och ligger i er Google-organisation (ID 764598542395). Åtgärden tar cirka 10 minuter.

  Alternativ A (enklast): Logga in på console.cloud.google.com, gå till IAM för projektet tkl-nexus och ge web@tklnexus.se rollen Owner. Då gör webmastern resten själv, och framtida GCP-ärenden kräver ingen ny kontakt.

  Alternativ B (minimala roller): Ge web@tklnexus.se rollerna Viewer, Workload Identity Pool Admin, Service Account Admin och Project IAM Admin på projektet tkl-nexus.

  Alternativ C (ni gör setupen själva): 1) IAM & Admin → Workload Identity Federation → skapa pool `github-pool` med OIDC-provider `github-provider`, issuer `https://token.actions.githubusercontent.com`, attribute mapping `google.subject = assertion.sub` och `attribute.repository = assertion.repository`, attribute condition `assertion.repository == "Jepsterrr/tkl-nexus"`. 2) Skapa service account `github-deploy` med rollerna Firebase Hosting Admin + Service Usage Consumer — skapa INGEN nyckel. 3) På kontot github-deploy@tkl-nexus.iam.gserviceaccount.com: Permissions → Grant access → principal `principalSet://iam.googleapis.com/projects/194298580940/locations/global/workloadIdentityPools/github-pool/attribute.repository/Jepsterrr/tkl-nexus` med rollen Workload Identity User. Meddela webmastern när det är klart — workflow-ändringen i repot görs därefter.

  Efter första gröna deployen med WIF: radera JSON-nyckeln på det gamla service-kontot och ta bort GitHub-secreten `FIREBASE_SERVICE_ACCOUNT`.

  OBS: flyttas GitHub-repot till en kår-ägd organisation (se README) måste attribute condition och principal-bindningen uppdateras med det nya repo-namnet.

## Uppföljning från vibelegit-skanning 2026-07-09 (score 83/100)

- [ ] Användarvillkor-sida (`/terms`) — låg prioritet, ej juridiskt krav:
  Samma tvåfilsmönster som `/privacy` (`page.tsx` + `TermsContent.tsx`), i18n sv/en, länk i footern bredvid integritetspolicyn. Innehåll: tillåten användning, ansvarsfriskrivning, immaterialrätt, tillämplig lag (svensk), kontakt. Villkorstexten ska godkännas av kåren innan deploy.

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
- [ ] CookieConsent accept/decline-flöde + CookieSettings-toggeln på `/privacy` (inkl. event-synk banner↔toggle) — blockerad tills `ANALYTICS_ENABLED=true` (ingen av dem renderas nu)
- [ ] Admin login + AuthGuard-redirect — kräver testanvändare i Firebase Auth eller emulator-setup
- [ ] Admin CRUD (events/career/deals/products) — kräver emulator (skriv aldrig mot live i test)
- [ ] Visuell regression (Playwright `toHaveScreenshot`) på hero-sektionerna, bägge teman
- [ ] Full i18n-svep — alla publika sidor renderar utan svenska strängar i EN-läge
