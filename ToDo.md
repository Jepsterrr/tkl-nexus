# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

Cloudinary DPA: https://cloudinary-marketing-res.cloudinary.com/image/upload/v1780332751/Cloudinary_Data_Processing_Agreenent_DPA_June_2026.pdf

## Uppföljning från designgranskning 2026-06-12

- [ ] Ladda upp logotyper för deals
- [ ] DNS-post för www.tklnexus.se saknas (lägg till custom domain i Firebase Hosting + CNAME hos registrar)

  Underlag att skicka till webbmästare med åtkomst till Simply.com och Firebase Console:

  www.tklnexus.se går inte att nå eftersom underdomänen saknar DNS-post. Besökare som skriver www. framför adressen får ett serverfel. Huvuddomänen tklnexus.se fungerar och pekar på Firebase Hosting (199.36.158.100). Domänens DNS hanteras hos Simply.com (ns1, ns2 och ns3.simply.com). Åtgärden tar cirka 10 minuter och kräver inloggning på båda tjänsterna.

  Steg 1, Firebase Console: Gå till projektet tkl-nexus, välj Hosting och sedan Add custom domain. Ange www.tklnexus.se och välj "Redirect to an existing website" med tklnexus.se som mål. www ska alltså omdirigera till huvuddomänen, inte vara en egen sajt. Firebase visar därefter vilka DNS-poster som ska skapas, vanligtvis en CNAME och ibland en TXT-post för ägarverifiering. Notera exakt vad som visas.

  Steg 2, Simply.com: Logga in och öppna DNS-administrationen för tklnexus.se. Skapa posterna från steg 1. Typiskt blir det subdomän www, typ CNAME, mål tklnexus.se, men följ exakt det Firebase angav.

  Steg 3, verifiering: Propageringen tar från några minuter upp till någon timme. Firebase utfärdar SSL-certifikat automatiskt när posten syns. Kontrollera att https://www.tklnexus.se omdirigerar till https://tklnexus.se utan certifikatvarning. Ingen kod eller deploy berörs, detta är enbart konfiguration.

## Uppföljning från Nexus Hemsida-feedback

- [ ] Återinför NEXUS Deals: sätt `DEALS_ENABLED = true` i `src/lib/features.ts` och justera/ta bort testet 'Deals är dolt' i `e2e/navigation.spec.ts` (lägg även tillbaka `/students/deals` i `public/sitemap.xml` och `public/llms.txt` och ta bort `noindex` i `src/app/students/deals/page.tsx`)
- [ ] Övriga texter nämner fortfarande förmåner/deals trots att Deals är dolt — besluta om de ska ändras eller vara kvar: `home.ctaStudentsSub` ("Exjobb, events & förmåner"), `subPostDesc` ("Publicera jobb, event och deals.")
- [ ] Städa dödkod: `src/components/ui/JobCard.tsx` (ersatt av `JobRow`, importeras ingenstans), `JobCardSkeleton` variant `'card'` och i18n-nycklarna `opportunities.pills`/`resultsCount`/`startLabel` (verifiera med grep att de är oanvända innan borttagning)

## E2E-tester att lägga till

Befintlig svit (`e2e/`) täcker: rutter/404/skip-länk, språk/tema-toggle, career-drawer, axe WCAG AA (7 sidor × 2 viewports × 2 teman), security headers. Följande saknas, i prioritetsordning:

### P3 — kräver förutsättningar som saknas idag
- [ ] CookieConsent accept/decline-flöde + CookieSettings-toggeln på `/privacy` (inkl. event-synk banner↔toggle) — blockerad tills `ANALYTICS_ENABLED=true` (ingen av dem renderas nu)
- [ ] Admin login + AuthGuard-redirect — kräver testanvändare i Firebase Auth eller emulator-setup
- [ ] Admin CRUD (events/career/deals/products) — kräver emulator (skriv aldrig mot live i test)
- [ ] Visuell regression (Playwright `toHaveScreenshot`) på hero-sektionerna, bägge teman
- [ ] Full i18n-svep — alla publika sidor renderar utan svenska strängar i EN-läge
