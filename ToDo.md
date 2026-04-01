# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog.

## Aktuella Prioriteringar & Buggar

- [ ] **Buggfix: Språkstöd (i18n) på datakort**  
       När användaren byter till engelska översätts inte innehållet inuti JobCards och EventCards. _Lösning: Implementera översättningsstöd/keys även för den dynamiska/komponentbaserade datan och säkerställ att språk-kontexten uppdaterar renderingen._

## Epic 1: Navigation & Dedikerade Landningssidor

_Mål: Sidorna i Navbar ska peka mot riktiga och immersiva landningssidor för varje målgrupp, istället för enkla paneler. Design ska följa 'Epic Design' (premium, parallax, animationer)._

- [ ] Skapa/Remodellera **Landningssida för Studenter**  
       Ska innehålla snygg visualisering och agera hubb för att klicka sig vidare till "Event", "Jobb/Exjobb" och "Nexus Deals".
- [ ] Skapa/Remodellera **Landningssida för Företag**  
       Fokus på samarbete, employer branding och hur man annonserar.

## Epic 2: Eventsystem & Kalender

_Mål: En dedikerad plattform för events, separerat från jobb och praktik._

- [ ] Skapa en dedikerad Eventsida (t.ex. `/events`) med premium "Nexus"-känsla.
- [ ] Implementera **Dual Calendar View**:
  - **LUDD Events Calender:** Använd befintlig integrering (`<script src="https://events.ludd.ltu.se/gancio-events.es.js"></script>` / `<gancio-events>`).
    -
  - **Egna TKL Events:** En vy för events som publiceras internt via projektet.
- [ ] **Databasstruktur (Firebase):**  
       Utvärdera och applicera Firestore-schema för egna events (Title, Date, Description, Image/Logo). Detta lägger grunden för det framtida admin-gränssnittet.
- [ ] Implementera list/grid/snygg vy av de interna eventen.
- [ ] _(Framtid) Bygg Admin-login och dashboard för redigering och publicering av nya events._

## Epic 3: Karriärportalen (Jobb & Exjobb)

_Mål: Fullfjädrad portal för att koppla studenter till arbetslivet._

- [ ] Skapa karriärportalen: "Hitta ditt nästa karriärsteg".
- [ ] Bygg dynamiskt filtreringssystem:
  - Kategorier: Exjobb, Jobb, Praktik.
  - Sektionstillhörighet (Filtrera på program/sektion (Datasektionen, Geosektionen, I-sektionen, Maskinsektionen)).
  - "Visa Alla"-knapp.
- [ ] Konfigurera databasuppkoppling för att hämta jobbannonserna från Firebase istället för hårdkodad testdata.

## Tekniska & Arkitektoniska Förbättringar

- [ ] Säkerställ att Zod och TypeScript används för att typsäkra all data som hämtas för events och jobb.
- [ ] Validera rendering genom prestandatester och säkerställ tillgänglighets-score >90.
- [ ] Utvärdera routingstrukturen i Next.js 16 (App Router) för de nya underkatalogerna (`/events`, `/career`, `/students`, `/corporations`).
