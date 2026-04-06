# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog.

## Aktuella Prioriteringar & Buggar

- [x] **Buggfix: Språkstöd (i18n) på datakort**  
       _Löst! Implementerat via översättningsfilerna (sv/en) för hårdkodad data._
- [x] **Säkerställ att webbsidan har samma animationer vid firebase implementation vid hosting**
      _Löst! Hydration bugs kring `useReducedMotion` fixade så server och klient renderar samma animationsträd._

## Epic 1: Navigation & Dedikerade Landningssidor

_Mål: Sidorna i Navbar ska peka mot riktiga och immersiva landningssidor för varje målgrupp, istället för enkla paneler. Design ska följa 'Epic Design' (premium, parallax, animationer)._

- [x] Skapa/Remodellera **Landningssida för Studenter**  
       Innehåller nu en parallax hero, benefits och smart hub navigation mot /events, /opportunities och /deals.
- [ ] Skapa/Remodellera **Landningssida för Företag**  
       Fokus på samarbete, employer branding och hur man annonserar. Analogt premium-upplägg som Students.

## Epic 2: Eventsystem & Kalender

_Mål: En dedikerad plattform för events, separerat från jobb och praktik._

- [x] Skapa en dedikerad Eventsida (`/events`) med premium "Nexus"-känsla.
- [x] **Databasstruktur (Firebase):**  
       Zod-schema och api-route (`/api/events`) på plats, och Firebase anropas via published status och cacheas via Next.js.
- [x] Implementera list/grid/snygg vy av de interna eventen.
- [ ] Se till att beskrivningar är tillgängliga på engelska också men det är inget krav på att en beskrivning finns så när man gör dem liksom. Fallback är alltid svenska. Det kan också vara akutellt att ha ett system så de försvinner efter samma dag eller blir arkiverade på något sätt. Samma sak med jobberbjudanden nedan samt deals kanske? Finns vissa som är i all evighet så ett system för det också?
- [ ] _(Framtid) Bygg Admin-login och dashboard för redigering och publicering av nya events._

## Epic 3: Karriärportalen (/opportunities)

_Mål: Fullfjädrad portal för att koppla studenter till arbetslivet med skarpt API mot Firebase._

- [ ] Skapa Zod Schema för `Opportunity` (`title, type, location, deadline, company, applyUrl, published`).
- [ ] Bygg Backend: API Route `/api/opportunities` för att hämta aktiva annonser från samlingen i Firestore.
- [ ] Skapa frontend-portal: `/opportunities` (F.d "Hitta ditt nästa karriärsteg").
- [ ] Bygg dynamiskt filtreringssystem:
  - Kategorier: Exjobb, Jobb, Praktik, Trainee.
- [ ] Konfigurera databasuppkoppling för att hämta jobbannonserna från Firebase istället för hårdkodad testdata (uppdatera `JobCard`).

## Epic 4: Nexus Deals (/deals)

_Mål: Exklusiva rabatter och förmåner för kårmedlemmar (Apple/Studentkort-känsla)._

- [ ] Skapa Zod Schema för `Deal` (`title, desc, company, discountCode, url, type`).
- [ ] Bygg Backend: API Route `/api/deals` för att hämta `published` deals.
- [ ] Skapa Premium `DealCard` komponent med klick-för-kopiera rabattkod-effekter och "glows".
- [ ] Skapa Sida: `/deals` för att scrolla och bläddra bland förmåner och rabatter.

## Tekniska & Arkitektoniska Förbättringar

- [x] **Firebase Status Analys:**  
       Genomgången av @orchestrator. Databasarbete lagd och regler konfigurerade.
- [ ] **Firestore SCHEMA Implementation (@logic-architect):**  
       Definiera Deal och Opportunity kollektioner samt pushat uppdaterade `firestore.rules`.
- [x] Säkerställ att Zod och TypeScript används för att typsäkra all data som hämtas för events och jobb. (Events klart, Karriär kvar).
- [ ] Validera rendering genom prestandatester och säkerställ tillgänglighets-score >90.
