# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

## Epic 1: Admin-panel

Ta bort Category på deals? De används inte alls i något?

Tillbaka till sajt knapp returnerar error för Navbar och Footer

### Auth & Åtkomstkontroll

- [x] Implementera inloggningssida på `/admin` med Firebase Auth (email + lösenord).
- [x] Skydda alla `/admin/**`-rutter — omdirigera till `/admin` om ej inloggad, till `/admin/dashboard` om inloggad.
- [x] Verifiera behörighet mot `admins`-kollektionen i Firestore (e-post som nyckel) — nekas åtkomst om dokument saknas, även om Firebase Auth godkänner.
- [x] Implementera utloggning med `signOut()` från Firebase Auth.

### Dashboard (`/admin/dashboard`)

- [x] Översiktspanel med räknare: antal publicerade events, deals, jobbannonser och partners.
- [x] Snabblänkar till respektive panel.
- [x] Visa senast skapade/ändrade poster per typ (events, deals, jobb).
- [x] Designförbättring av admin-shell: sidebar-layout med oklch-palett, distinkt admin-estetik, mobil bottom nav.

### Events-panel (`/admin/events`)

- [x] Lista alla events (publicerade + opublicerade) sorterade efter datum.
- [x] Skapa nytt event — formulär med alla fält: `title`, `titleEn`, `description`, `descriptionEn`, `date`, `endDate`, `location`, `imageUrl`, `tags`, `section`, `published`.
- [x] Redigera befintligt event — samma formulär förifyllt.
- [x] Publicera / avpublicera event (toggle `published`-fältet).
- [x] Ta bort event med bekräftelsedialog.

### Deals-panel (`/admin/deals`)

- [x] Lista alla deals (publicerade + opublicerade) sorterade efter `createdAt`.
- [x] Skapa ny deal — formulär: `company`, `logoUrl`, `title`, `titleEn`, `description`, `descriptionEn`, `category`, `link`, `discountCode`, `discount`, `published`.
- [x] Redigera befintlig deal.
- [x] Publicera / avpublicera deal.
- [x] Ta bort deal med bekräftelsedialog.

### Jobb & Exjobb-panel (`/admin/opportunities`)

- [ ] Lista alla jobbannonser (publicerade + opublicerade) sorterade efter `createdAt`.
- [ ] Skapa ny annons — formulär: `title`, `titleEn`, `company`, `type` (exjobb / jobb / praktik / trainee), `location`, `description`, `descriptionEn`, `startDate`, `startDateEn`, `deadline`, `applyUrl`, `published`.
- [ ] Redigera befintlig annons.
- [ ] Publicera / avpublicera annons.
- [ ] Ta bort annons med bekräftelsedialog.

### Partnerföretag-panel (`/admin/partners`)

Ny Firestore-kollektion `partners`. Partnerföretag visas på `/corporate`-sidan som ett förtroendebyggande element.

- [ ] Lista alla partnerföretag sorterade efter `order` (fallback: `createdAt`).
- [ ] Skapa nytt partnerföretag — formulär: `name`, `logoUrl`, `website`, `description`, `descriptionEn`, `order`, `published`.
- [ ] Redigera befintligt partnerföretag.
- [ ] Publicera / avpublicera partner.
- [ ] Ta bort partner med bekräftelsedialog.
- [ ] Definiera Zod-schema `TKLPartner` i `src/lib/schemas/partner.ts`.
- [ ] Skapa service-funktion i `src/lib/services/partners.ts` för att hämta publicerade partners.
- [ ] Lägg till partnerlogotyper/sektion på `/corporate`-sidan (hämtar från `partners`-kollektionen).

### Sajt-inställningar (`/admin/settings`)

Inställningar sparas som Firestore-dokument under `settings/<id>`. Fält som idag är hårdkodade i källkoden och bör bli redigerbara utan koddeploy:

#### Statistik (`settings/stats`)

Värdena visas på flera ställen: `CorporateContent.tsx:37–39` (siffror), `i18n.ts:78` (home pills), `i18n.ts:219–220` (corporate pills), `i18n.ts:49` (home hero-text).

- [ ] `members` — antal aktiva kårmedlemmar (t.ex. `"1 600+"`). Visas i stats-raden på `/corporate`, hero-pills på startsidan och `/corporate`, och i home-beskrivningstexten.
- [ ] `programs` — antal civilingenjörsprogram (t.ex. `"30"`). Visas i stats-raden och corporate-pills.
- [ ] `sections` — antal sektioner (t.ex. `"4"`). Visas i stats-raden, corporate-pills och about-pills.
- [ ] `CorporateContent.tsx` hämtar värden från `settings/stats` istället för hårdkodade strängar.

#### Kontaktuppgifter (`settings/contact`)

- [ ] `email` — kontaktmailadressen (`ao@teknologkaren.se`). Hårdkodad i `src/lib/types.ts:97–99` och `PostContent.tsx` (×3 mailto-länkar). Ska hämtas dynamiskt i `PostContent.tsx`, `AboutContent.tsx` och `Footer`.
- [ ] `linkedIn` — LinkedIn-URL (`https://linkedin.com/in/tkl-nexus/`). Hårdkodad i `src/lib/types.ts:103`.
- [ ] `instagram` — Instagram-URL (`https://instagram.com/tkl_nexus`). Hårdkodad i `src/lib/types.ts:108`.
- [ ] `address` — besöksadress (`Tekniktorget 3, 977 54 Luleå`). Hårdkodad i `i18n.ts:408` (`about.contactAddress`) och Google Maps-länken i `AboutContent.tsx:29`. Ska generera Maps-länk dynamiskt av adressvärdet.

#### Om-oss-texter (`settings/about`)

Brödtexterna visas i glaskortet "Vad är TKL Nexus?" på `/about`-sidan. Footer-beskrivningen visas under logotypen på alla sidor.

- [ ] `whatIs.p1` / `whatIs.p2` / `whatIs.p3` — de tre brödtextstyckena (`i18n.ts:411–413`), sv + en.
- [ ] `footerDescription` — kort org-beskrivning under logotypen i footer (`i18n.ts:27–28`), sv + en. Syns på varje sida.
- [ ] `AboutContent.tsx` och `Footer.tsx` hämtar texter från `settings/about` med fallback till befintliga i18n-strängar.

#### Tjänstekort på /corporate (`settings/services`)

De 3 tjänstekorten i `CorporateContent.tsx` (Events & Relations, Nexus Portal, Samarbete) har titlar och beskrivningar hårdkodade i `i18n.ts:199–215`. Om ett erbjudande byter namn, beskrivning eller tas bort krävs idag en koddeploy.

- [ ] Redigerbara tjänstekort: `title` (sv + en), `description` (sv + en) för varje kort — sparas som `settings/services` med tre poster.
- [ ] `CorporateContent.tsx` hämtar korten från Firestore med befintliga i18n-strängar som fallback.

#### Historik-tidslinje (`settings/timeline`)

Tidslinjen på `/about`-sidan har 5 poster. Årtalen är hårdkodade i `AboutContent.tsx:57–61`; titlar och beskrivningar i `i18n.ts:416–421`.

- [ ] Lista och redigera timelineposter — varje post: `year` (t.ex. `"2019"`), `title` (sv + en), `description` (sv + en).
- [ ] Lägg till ny timelinepost.
- [ ] Ta bort timelinepost med bekräftelsedialog.
- [ ] Sortera poster efter `year` (stigande).
- [ ] Sparas som array i `settings/timeline` (eller som subkollektion `settings/timeline/items/<id>`).
- [ ] `AboutContent.tsx` hämtar poster från Firestore och faller tillbaka på hårdkodade i18n-data om Firestore är tom.

#### Externa footer-länkar (`settings/links`)

Footern har externa länkar hårdkodade i `Footer.tsx:7–19` som kan behöva uppdateras utan deploy.

- [ ] `teknologkaren` — URL till Teknologkårens webbplats (idag `https://www.teknologkaren.se`).
- [ ] `larv` — URL till LARV (idag `https://larv.org`).
- [ ] `sections` — array med 4 poster: `{ name, href }` för Datasektionen, Geosektionen, I-sektionen och Maskinsektionen. Hårdkodade i `Footer.tsx:12–19`.
- [ ] `Footer.tsx` hämtar dessa från `settings/links` med befintliga hårdkodade värden som fallback.

#### Global informationsbanner (`settings/banner`)

- [ ] Möjlighet att aktivera/deaktivera en global informationsbanner (text + färg) som visas överst på alla sidor — sparas som `settings/banner`.
- [ ] Bannern hämtas i `RootLayout` (via klientkomponent) och renderas konditionellt.

### Adminhantering (`/admin/admins`)

- [ ] Lista alla e-postadresser i `admins`-kollektionen.
- [ ] Lägg till ny admin (skapar dokument med e-post som nyckel).
- [ ] Ta bort admin med bekräftelsedialog (kan ej ta bort sig själv).

---

## Tekniska & Arkitektoniska Förbättringar

### Admin-panel — Framtida förbättringar

- [ ] **Collapsible sidebar (approach C):** Sidebaren kan fällas ihop till ikonläge för mer desktop-yta. Kräver collapse-state (localStorage), animerad breddtransition och tooltip-labels på ikonerna i hopfällt läge.
- [ ] **Migrera admin-CSS till Tailwind:** Alla custom CSS-klasser i `globals.css` under `/* === Admin Shell === */` (`.admin-shell`, `.admin-sidebar`, `.admin-nav-item`, `.dash-*`, etc.) ska skrivas om till Tailwind v4-utilities direkt i respektive komponent. Görs som ett separat refactor-steg efter att alla admin-paneler är byggda.
