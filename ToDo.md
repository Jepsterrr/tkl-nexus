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

## Epic 2

### Event / Exjobb / Deals

Just nu finns de bara som en lista med "kort" som tar dig till en annan sida med knapp, borde man inte kunna gå in på dem för att se hela texten och allt sådant på snyggare och större sätt? Det kan ju vara så att man vill se lite mer av eventet eller exjobbet innan man bestämmer sig för att klicka sig vidare. Exempelvis ett event kan ju vara en hel dag med flera delar, eller att ett exjobb har väldigt lång beskrivning.

På detta kan man ha metadata och specifika bilden ifall det finns någon, annars vanliga og-image som visas på länkarna. Detta gör att studenter eller annat kan skicka specifika länken till kompisar och det syns på korrekt sätt. Följ gärna andra sidors metadata ungefärligt men behöver ju inga keywords direkt (tror jag?).

---

## Tekniska & Arkitektoniska Förbättringar

### Caching — Firestore Offline Persistence + cacheVersion

Mål: spara Firebase-kvot och ge konsekvent laddningsupplevelse utan att studenter missar ny data.

**Koncept:**

- Faktisk data cachas i **IndexedDB** via Firestore Offline Persistence (GB-gränser, ingen custom serialisering).
- Enbart versionen (`{ events, career, deals }`) sparas i **localStorage** (bytes, ingen risk för 5 MB-gränsen).
- Ingen TTL — `cacheVersion`-dokumentet är den enda invalideringsmekanismen.
- Admin-write-funktioner använder `serverTimestamp()` för att undvika klock-skev mellan olika enheter.

**UX-flöde (skeleton hela vägen):**

```
1. Skeleton visas (loading = true)
2. Hämta settings/cacheVersion från server (1 Firestore-läsning)
3. Jämför mot localStorage-version
   Samma  → getDocs(..., { source: 'cache' })  → visa data (loading = false)
   Ny     → getDocs(..., { source: 'server' }) → visa data, spara ny version (loading = false)
   Miss*  → getDocs(..., { source: 'server' }) → visa data (loading = false)
```

\*Cache-miss (första besöket) hanteras med try/catch → fallback till server.

Data visas alltid en gång, definitivt. Ingen tyst uppdatering efteråt.

**Implementation:**

- [x] Aktivera **Firestore Offline Persistence** i `src/lib/firebase.ts` via `initializeFirestore` med `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`.
- [x] Skapa `settings/cacheVersion`-dokument i Firestore med fälten `events`, `career`, `deals`.
- [x] Skapa `src/lib/services/cacheVersion.ts` — hämtar `settings/cacheVersion` (source: 'server') och jämför mot localStorage-versionen.
- [x] Uppdatera `getEvents`, `getCareerPosts`, `getDeals` i respektive service-fil att använda `source: 'cache'` eller `source: 'server'` baserat på versionskollet.
- [x] Uppdatera alla admin write-funktioner (`createEvent`, `updateEvent`, `deleteEvent` osv.) att bumpa relevant fält i `settings/cacheVersion` med `serverTimestamp()`.

## Bilder

- [x] Utforska alternativ att använda bilder på sidan där det skulle passa och se snyggt ut. → Spec: `docs/superpowers/specs/2026-05-04-image-system-design.md`
- [x] Utforska användningen av bilder på Firebase Spark-plan i där det finns (Kan man ladda upp från datorn? Kräver det högre betalplan eller finns det snyggt workaround?).

### Framtida bilder i hemsidan:

- [ ] **Teamfoto-sektion på About** — individuella porträtt per person (arbetsmarknadsutskottet). Varje person har eget namn, roll och Cloudinary-bild. Kräver CRUD i admin och subkollektion `settings/team/members` eller array i `settings/about`. Ska vara helt admin-hanterbart utan kod.
