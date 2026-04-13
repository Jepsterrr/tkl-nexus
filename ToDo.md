# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog.

## Aktuella Prioriteringar & Buggar

- [ ] **Säkerställ att scrolling på firebase mobilapp fungerar korrekt, nu sker scrolling på mobil dåligt på just Firebase hemsidan (tklnexus.se)** - Specifikt när självaste sökbaren åker ner och upp vid scroll så måste sidan animeras om och formas om varje gång. Mobilförbättring krävs utöver detta också.

## Epic 1: Navigation & Dedikerade Landningssidor

_Mål: Sidorna i Navbar ska peka mot riktiga och immersiva landningssidor för varje målgrupp, istället för enkla paneler. Design ska följa 'Epic Design' (premium, parallax, animationer)._

- [x] Skapa/Remodellera **Landningssida för Studenter**  
       Innehåller nu en parallax hero, benefits och smart hub navigation mot /events, /opportunities och /deals.
- [x] Skapa/Remodellera **Landningssida för Företag**  
       Fokus på samarbete, employer branding och hur man annonserar. Analogt premium-upplägg som Students.

## Epic 2: Eventsystem & Kalender

_Mål: En dedikerad plattform för events, separerat från jobb och praktik._

- [x] Skapa en dedikerad Eventsida (`/events`) med premium "Nexus"-känsla.
- [x] **Databasstruktur (Firebase):**  
       Zod-schema på plats och Firebase anropas direkt via klientsidan (API-routes togs bort för att stödja Firebase Spark-plan) filtrerat på published status.
- [x] Implementera list/grid/snygg vy av de interna eventen.
- [x] Se till att beskrivningar är tillgängliga på engelska också som fallback. Events och Deals har nu `endDate` för gallring och stöder `titleEn`/`descriptionEn`. (Jobb/Career kvar att gallras).
- [x] Implementera hover-effekter på filterknappar och kort (JobCard, FilterTab) för ökad interaktivitet och premiumkänsla.
- [ ] **Månadskalender (Nytt krav):** Implementera en faktisk kalender för Events där man ser månad för månad (ej föregående månad) istället för bara listvy, för att bättre differentiera designen från jobbkorten.
- [ ] _(Framtid) Bygg Admin-login och dashboard för redigering och publicering av nya events._

## Epic 3: Karriärportalen (/opportunities)

_Mål: Fullfjädrad portal för att koppla studenter till arbetslivet med skarpt API mot Firebase._

- [x] Skapa Zod Schema för `Opportunity` (`title, type, location, deadline, company, applyUrl, published`).
- [x] Bygg Backend-logik: Sätt upp direkta klient-anrop (utan API/Route Handlers på grund av Spark Tier) för att hämta aktiva annonser från samlingen i Firestore.
- [x] Skapa frontend-portal: `/opportunities` (F.d "Hitta ditt nästa karriärsteg").
- [x] Bygg dynamiskt filtreringssystem:
  - Kategorier: Exjobb, Jobb, Praktik, Trainee.
- [ ] Konfigurera databasuppkoppling för att hämta jobbannonserna från Firebase istället för hårdkodad testdata (uppdatera `JobCard`).
- [ ] Se över och kolla så att allt stämmer i firebase och ser bra ut. Mer färgvariation och premiumkänsla önskas för karriärdelen. (Hover-effekt på kort/knappar är implementerat).

- [ ] **Omdöpning (Nytt krav):** Byt namn på `/opportunities` till `/career` överallt i koden, i paths och i Firebase. "Career låter bra, gemensamt och liknande".

## Epic 4: Nexus Deals (/deals)

_Mål: Exklusiva rabatter och förmåner för kårmedlemmar (Kika över de faktiska sakerna som Teknolågkåren har för kårförmåner och rabatter för tillfället)._

- [x] Skapa Zod Schema för `Deal` (`title, desc, company, discountCode, url, type`).
- [x] Bygg Backend-logik: Sätt upp direkta klient-anrop (utan API/Route Handlers på grund av Spark Tier) för att hämta `published` deals med indexering.
- [x] Skapa Premium `DealCard` komponent med klick-för-kopiera rabattkod-effekter och horisontell layout med avatar. (Stöder automatik + rabattkoder).
- [x] Skapa Sida: `/deals` för att scrolla och bläddra bland förmåner och rabatter (Epic design med Amber/Orange-orb).

## Tekniska & Arkitektoniska Förbättringar

- [x] **Firebase Status Analys:**  
       Genomgången av @orchestrator. Databasarbete lagd och regler konfigurerade.
- [x] **Firestore SCHEMA Implementation (@logic-architect):**  
       Definiera Deal och Opportunity kollektioner samt pushat uppdaterade `firestore.rules`.
- [x] Säkerställ att Zod och TypeScript används för att typsäkra all data som hämtas för events och jobb. (Events och Deals klart, Karriär kvar).
- [x] **Säkerhet & Webbskydd:**  
       Implementerat stränga security headers i `next.config.ts`:
  - 1. Content-Security-Policy (CSP)
  - 2. X-Frame-Options (DENY)
  - 3. X-Content-Type-Options (nosniff)
  - 4. Referrer-Policy (strict-origin-when-cross-origin)
  - 5. Permissions-Policy (kamera, mic, pay av)
  - 6. HSTS (max-age 1 år)
- [ ] Validera rendering genom prestandatester och säkerställ tillgänglighets-score >90. Görs bäst med .agents/skills/design auditor.md och skills/code-reviewer tillsammans.
