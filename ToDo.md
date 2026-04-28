# TKL Nexus - Utvecklingsplan & ToDo

Den här filen fungerar som projektets övergripande road map och sprint-backlog. Endast öppna/aktiva uppgifter listas här.

## Epic 1: Admin-panel

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

### Jobb & Exjobb-panel (`/admin/career`)

- [x] Lista alla jobbannonser (publicerade + opublicerade) sorterade efter `createdAt`.
- [x] Skapa ny annons — formulär: `title`, `titleEn`, `company`, `type` (exjobb / jobb / praktik / trainee), `location`, `description`, `descriptionEn`, `startDate`, `startDateEn`, `deadline`, `applyUrl`, `published`.
- [x] Redigera befintlig annons.
- [x] Publicera / avpublicera annons.
- [x] Ta bort annons med bekräftelsedialog.

### Partnerföretag-panel (`/admin/partners`) (Borde det göras?)

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

#### Statistik (`settings/stats`) ✅

- [x] `members`, `programs`, `sections` — redigerbara via `/admin/settings/stats`. `CorporateContent.tsx` hämtar från Firestore med i18n-fallback.

#### Kontaktuppgifter (`settings/contact`) ✅

- [x] `email`, `linkedin`, `instagram`, `address` — redigerbara via `/admin/settings/contact`. `PostContent.tsx`, `AboutContent.tsx` och `Footer.tsx` hämtar dynamiskt med fallback.

#### Om-oss-texter (`settings/about`) ✅

- [x] `whatIs.p1/p2/p3` (sv+en) och `footerDescription` (sv+en) — redigerbara via `/admin/settings/about`. `AboutContent.tsx` och `Footer.tsx` hämtar med i18n-fallback.

#### Tjänstekort på /corporate (`settings/services`) ✅

- [x] Redigerbara titlar och beskrivningar (sv+en) per tjänstekort via `/admin/settings/services`. `CorporateContent.tsx` hämtar med i18n-fallback.

#### Historik-tidslinje (`settings/timeline`) ✅

- [x] CRUD för timelineposter (år, titel sv+en, beskrivning sv+en, ordning) via `/admin/settings/timeline`. Sparas i subkollektion `settings/timeline/items/<id>`. `AboutContent.tsx` hämtar med i18n-fallback.

#### Externa footer-länkar (`settings/links`) ✅

- [x] `teknologkaren`, `larv`, 4 sektionslänkar — redigerbara via `/admin/settings/links`. `Footer.tsx` hämtar med hårdkodade fallback-värden.

#### Global informationsbanner (`settings/banner`) ✅

- [x] Aktiv/inaktiv toggle, bannertext och färgval (5 swatches) via `/admin/settings/banner`. `GlobalBanner`-komponent i root layout renderas konditionellt (döljs på `/admin/*`).

### Adminhantering (`/admin/admins`)

- [x] Lista alla e-postadresser i `admins`-kollektionen.
- [x] Lägg till ny admin (skapar dokument med e-post som nyckel).
- [x] Ta bort admin med bekräftelsedialog (kan ej ta bort sig själv).

---

## Tekniska & Arkitektoniska Förbättringar

### Admin-panel — Framtida förbättringar

- [x] **Collapsible sidebar:** Sidebaren kan fällas ihop till ikonläge för mer desktop-yta. Kräver collapse-state (localStorage), animerad breddtransition och tooltip-labels på ikonerna i hopfällt läge.
- [x] **Migrera admin-CSS till Tailwind:** Alla custom CSS-klasser i `globals.css` under `/* === Admin Shell === */` (`.admin-shell`, `.admin-sidebar`, `.admin-nav-item`, `.dash-*`, etc.) ska skrivas om till Tailwind v4-utilities direkt i respektive komponent. Görs som ett separat refactor-steg efter att alla admin-paneler är byggda.
- [x] **Lista "utgågna" events och annat:** Just nu visas alla saker som inte syns i själva publika sidorna ändå likadant i Admin sidorna, förslagsvis en form av "Gamla" eller något åt det hållet för att visa vad som hänt tidigare så man kan ta bort eller uppdatera vad som helst. Men mest för att kunna se vad som inte syns publika men som ändå finns.
