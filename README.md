# TKL NEXUS

**Teknologkårens arbetsmarknadsportal** — kopplar samman studenter vid Luleå tekniska universitet med företag via exjobb, events, kårförmåner och direktkontakt.

Produktion: **[tklnexus.se](https://tklnexus.se)**

> Det här dokumentet är skrivet som en överlämning till nästa webmästare. Läs det uppifrån och ner en gång — särskilt [Spark-begränsningarna](#firebase-spark--absoluta-begränsningar), de förklarar varför koden ser ut som den gör.

---

## Innehåll

- [Snabbstart](#snabbstart)
- [Kommandon](#kommandon)
- [Tech stack](#tech-stack)
- [Arkitektur](#arkitektur)
- [Firebase Spark — absoluta begränsningar](#firebase-spark--absoluta-begränsningar)
- [Firestore — datamodell och säkerhet](#firestore--datamodell-och-säkerhet)
- [Adminpanelen](#adminpanelen)
- [Bilduppladdning (Cloudinary + Cloudflare Worker)](#bilduppladdning-cloudinary--cloudflare-worker)
- [Deploy](#deploy)
- [Tester och CI](#tester-och-ci)
- [Design, teman och i18n](#design-teman-och-i18n)
- [SEO](#seo)
- [Analytics och GDPR](#analytics-och-gdpr)
- [Konton och tjänster du behöver åtkomst till](#konton-och-tjänster-du-behöver-åtkomst-till)
- [Kända fällor](#kända-fällor)
- [Licens och ägande](#licens-och-ägande)

---

## Snabbstart

Förkunskaper: Node.js 20+, npm, ett Firebase-konto med åtkomst till projektet `tkl-nexus`.

```bash
git clone https://github.com/Jepsterrr/tkl-nexus.git
cd tkl-nexus
npm install
```

Skapa `.env.local` i projektroten (värdena finns i Firebase Console → Project settings → General → Your apps):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_CLOUDINARY_DELETE_URL=...   # Cloudflare Worker-URL, se workers/cloudinary-delete/README.md
```

> **Obs:** `.env.local` är gitignorerad och följer alltså **inte** med repot — den måste överlämnas separat eller återskapas från Firebase Console + Cloudflare-dashboarden.

Starta:

```bash
npm run dev   # http://localhost:3000
```

Sajten hämtar all data direkt från live-Firestore — det finns ingen lokal databas att seeda. Firebase-emulatorer finns förberedda (utkommenterade) i `src/lib/firebase.ts` om du vill jobba isolerat.

## Kommandon

| Kommando              | Gör                                                        |
| --------------------- | ---------------------------------------------------------- |
| `npm run dev`         | Dev-server på http://localhost:3000                        |
| `npm run build`       | Produktionsbygge — ska alltid gå igenom med 0 TS-fel       |
| `npm run start`       | Kör produktionsbygget lokalt                               |
| `npm run lint`        | ESLint                                                     |
| `npm run test:e2e`    | Playwright E2E (kräver `npm run build` först)              |
| `npm run test:e2e:ui` | Playwright i interaktivt UI-läge                           |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Firebase** Firestore + Auth — på **Spark-planen** (gratis, inga Cloud Functions — se begränsningarna nedan)
- **Tailwind CSS v4** — ingen `tailwind.config.ts`; all temakonfiguration via `@theme`-direktivet i `src/app/globals.css`
- **Framer Motion** — animationer
- **Zod v4** — runtime-validering av all Firestore-data
- **lucide-react** — ikoner
- **Playwright** — E2E-tester
- **PostHog (EU)** — produktanalys, för närvarande avstängd (se [Analytics och GDPR](#analytics-och-gdpr))

## Arkitektur

### Mappstruktur

```
src/
├── app/           # Rutter — page.tsx + *Content.tsx per sida (se tvåfilsmönstret)
├── components/    # ui/ (kort, drawers, hero), layout/ (Navbar, Footer), providers/, admin/
└── lib/           # firebase.ts, i18n.ts, types.ts, schemas/ (Zod), services/ (Firestore), hooks/
e2e/               # Playwright-tester + helpers
workers/           # Cloudflare Worker för Cloudinary-radering
public/            # Statiska filer: sitemap.xml, robots.txt, llms.txt, og-image, hero-SVG:er
firestore.rules    # Firestore säkerhetsregler
firebase.json      # Hosting-konfig + produktionens security headers
```

### Tvåfilsmönstret

Varje sida består av två filer:

1. `page.tsx` — Server Component. Exporterar `metadata` (SEO, canonical, JSON-LD). Ingen interaktivitet.
2. `*Content.tsx` — Client Component (`"use client"`). All UI, state och datahämtning.

### Publika rutter

| Route                 | Content-fil            | Beskrivning                                             |
| --------------------- | ---------------------- | ------------------------------------------------------- |
| `/`                   | `HomeContent.tsx`      | Startsida med RootNetwork-navigering                    |
| `/students`           | `StudentsContent.tsx`  | Student-hub                                             |
| `/students/deals`     | `DealsContent.tsx`     | Kårförmåner med klick-för-kopiera rabattkoder           |
| `/corporate`          | `CorporateContent.tsx` | Företagslandning med Settings-driven statistik          |
| `/corporate/post`     | `PostContent.tsx`      | Självbetjäningsformulär — mailto till ao@teknologkaren.se |
| `/corporate/services` | `ServicesContent.tsx`  | Produktportfölj (Firestore-driven)                      |
| `/events`             | `EventsContent.tsx`    | Dual view: TKL-events (Firestore) + Campus Events (LUDD-API) med kalendervy |
| `/career`             | `CareerContent.tsx`    | Jobb/exjobb/praktik/trainee med filtrering              |
| `/about`              | `AboutContent.tsx`     | Om kåren, Firestore-driven tidslinje, kontakt           |
| `/privacy`            | `PrivacyContent.tsx`   | GDPR-integritetspolicy                                  |

### Dataflöde

```
Firestore  →  src/lib/services/*  →  Content-komponent
              (async queries,         (useEffect + state)
               Timestamp→ISO,
               Zod-parsning)
```

Regler som **alltid** gäller:

- All datahämtning sker **på klienten** via Firestore SDK — aldrig API Routes eller Server Actions (se Spark-begränsningarna).
- Publika queries filtrerar alltid på `published == true`.
- Nya Firestore-fält definieras alltid som `.optional()` i Zod-schemat — bakåtkompatibilitet med gamla dokument.
- TypeScript-typer härleds **alltid** via `z.infer<>` — aldrig manuellt definierade vid sidan om schemat.
- Publika Content-komponenter importerar service-lagret **dynamiskt** (`await import('@/lib/services/...')` i effekter) — statisk import drar in hela Firestore-SDK:t (~145 kB gzip) i root-bundlen och förstör LCP. Admin-komponenter får importera statiskt.
- Firebase Auth ligger separat i `src/lib/firebase-auth.ts` och får **endast** importeras av admin-kod. Publika sidor drar annars in ~40 kB extra och SDK:t försöker ladda `apis.google.com`, som CSP:n blockerar. `src/lib/firebase.ts` exporterar bara `app` + `db`.
- Nya service-filer bygger på hjälparna i `src/lib/services/firestore-helpers.ts` — duplicera inte mönstret.

### Providers (root-layouten)

`PHProvider` → `LanguageProvider` → `SettingsProvider` → `ThemeProvider` → `NavbarStateProvider` → `ScrollProvider` → sidinnehåll. Globala inställningar (statistik, kontakt, banner, hero-bilder m.m.) läses via `useSettings()`; språk via `useLanguage()`.

**Obs — inner-scroll:** `body` scrollar aldrig. All scroll sker i en container-div (`ScrollContainer.tsx`). Alla Framer Motion `useScroll` måste därför ange `container: useScrollContainer()`.

## Firebase Spark — absoluta begränsningar

Sajten hostas på Firebase Hostings gratisplan, som **saknar Node.js-server i produktion**. Bryts någon av dessa regler kraschar deployen eller så genereras en Cloud Function som kostar pengar:

1. **Inga Route Handlers** (`src/app/api/...`), inga Server Actions, ingen `getServerSideProps`.
2. **Använd aldrig `next/image`** — Image Optimization triggar en Cloud Function. Använd alltid vanlig `<img>`.
3. **Inga `[id]`-segment i admin-routes** — dynamiska path-segment kräver server-runtime. Edit-sidor använder alltid `?id=`-query-param.
4. **Ingen `output: 'export'`** i `next.config.ts` — det bryter Framer Motion-animationerna.
5. **Security headers finns på TVÅ ställen**: `next.config.ts` (gäller bara `next dev`/`next start`) och `firebase.json` (**enda** som gäller i produktion). Ändrar du CSP eller headers — uppdatera **båda**.

## Firestore — datamodell och säkerhet

| Kollektion                  | Innehåll                          | Läsning                    | Skrivning |
| --------------------------- | --------------------------------- | -------------------------- | --------- |
| `events`                    | TKL-events                        | Publik (`published==true`) | Admin     |
| `opportunities`             | Karriärannonser (rutten heter `/career` — kollektionen behöll sitt gamla namn) | Publik (`published==true`) | Admin |
| `deals`                     | Kårförmåner                       | Publik (`published==true`) | Admin     |
| `products`                  | Produktportfölj                   | Publik (`published==true`) | Admin     |
| `settings`                  | Siddata: `stats`, `contact`, `about`, `services`, `links`, `banner`, `heroImages`, `cacheVersion` | Publik | Admin |
| `settings/timeline/items`   | Tidslinjeposter (`/about`)        | Publik                     | Admin     |
| `settings/eventTypes/items` | Eventtyper (dropdown i `/corporate/post`) | Publik (`published==true`) | Admin |
| `admins`                    | E-post som dokument-id — existens = adminbehörighet | Admin | Admin |
| `secrets`                   | `cloudinary`: `cloudName`, `uploadPreset` | Admin              | Admin     |

Reglerna ligger i `firestore.rules`. Catch-all kräver admin — **en ny publik kollektion måste få en explicit regel**, annars är den oläsbar för besökare. Schemas ligger i `src/lib/schemas/`, service-lagret i `src/lib/services/`.

## Adminpanelen

`/admin/*` — lösenordsskyddad CRUD för allt innehåll (events, career, deals, produkter, settings, eventtyper, tidslinje, hero-bilder, banner) plus adminhantering och inbäddad PostHog-dashboard. Skyddas av `AuthGuard` (Firebase Auth **+** dokument i `admins`-kollektionen).

**Lägga till en ny admin** (t.ex. din efterträdare):

1. Logga in → `/admin/admins` → lägg till e-postadressen. Det skapar dokumentet i `admins` och skickar en Firebase email-link.
2. Mottagaren klickar länken → hamnar på `/verify` → bekräftar e-post → sätter lösenord → klar.

## Bilduppladdning (Cloudinary + Cloudflare Worker)

Bilder (deal-logotyper, hero-foton) lagras hos **Cloudinary** — inte Firebase Storage.

- **Uppladdning** sker direkt från admin-klienten (unsigned upload med `cloudName` + `uploadPreset` från `secrets/cloudinary`).
- **Radering** kräver Cloudinarys API-secret, som aldrig får nå webbläsaren. Därför går delete via en **Cloudflare Worker** (`workers/cloudinary-delete/`) som verifierar anroparens Firebase ID-token mot `admins`-kollektionen innan den raderar. Worker-URL:en ligger i `NEXT_PUBLIC_CLOUDINARY_DELETE_URL`.

Deploy-instruktioner och felsökning: `workers/cloudinary-delete/README.md`.

## Deploy

Hosting sker via Firebase Web Frameworks (Next.js byggs och paketeras av Firebase CLI):

```bash
npm run build          # verifiera 0 fel lokalt först
firebase deploy        # kräver Firebase CLI, inloggning och webframeworks aktiverat:
                       #   npm i -g firebase-tools
                       #   firebase login
                       #   firebase experiments:enable webframeworks
```

`firebase deploy` deployar både hosting och `firestore.rules`. Vill du enbart deploya regler: `firebase deploy --only firestore:rules`.

Domänen `tklnexus.se` pekas via DNS hos **Simply.com** mot Firebase Hosting. (`www.tklnexus.se` saknar i skrivande stund CNAME — se ToDo.md för färdig instruktion.)

## Tester och CI

**Playwright E2E** i `e2e/`: navigation/404, språk- och tematoggle, drawers (URL-synk, Escape, fokus), filtrering/sök, deals, LUDD-mock, ankarlänkar, corporate/post-formuläret, axe-tillgänglighet (WCAG AA, gate på critical/serious) och security headers. Två projekt: desktop-Chrome + Pixel 7.

```bash
npm run build && npm run test:e2e
```

Viktigt att veta:

- Testerna går mot **live Firestore** och skippar datadrivna fall när kollektioner är tomma — skippade tester är förväntat, inte fel.
- Använd **aldrig** `waitForLoadState('networkidle')` — Firestore long-pollar så nätverket blir aldrig idle. Använd `waitForAppReady()` från `e2e/helpers.ts`.
- **CI:** `.github/workflows/e2e.yml` kör lint → build → E2E på varje PR/push mot `master`. Kräver `NEXT_PUBLIC_*` som GitHub Secrets (dokumenterat i workflow-filen).

Kvalitetskrav i övrigt: `npm run build` med noll TypeScript-fel före varje merge, och Zod-validering på all inkommande Firestore-data.

## Design, teman och i18n

- **Två teman:** Cosmic Dark (standard — djupa svarta, neonaccenter, glassmorphism) och High-Contrast Light (tillgänglighetsanpassat). Temaväxling via `ThemeProvider`; `light:`-prefixet fungerar som Tailwind-variant.
- **Accentfärger** per sida (`red, purple, green, blue, orange`) styrs av `ACCENT_COLOR_MAP` i `src/lib/types.ts`.
- **Glasskort** använder alltid CSS-variabler (`var(--glass-bg-subtle)` osv.) — aldrig hårdkodad rgba.
- **Mobile-first:** bygg för mobil, skala upp med `sm:`/`md:`/`lg:`. Använd `svh` i stället för `vh` (iOS-reflow).
- **Animationer:** enbart GPU-säkra egenskaper (`transform`, `opacity`, `filter`, `clip-path`), alltid `prefers-reduced-motion`-fallback.
- **Hero-rubriker (LCP):** animeras med CSS-klassen `.hero-reveal` i `globals.css` — **aldrig** Framer Motion. Framer serialiserar `initial` som `opacity:0` i SSR-HTML:en, så rubriken målas först efter hydration (uppmätt LCP-skillnad: 5,5 s → 1,5 s).
- **i18n:** alla UI-strängar (även felmeddelanden och tomma states) ligger i `src/lib/i18n.ts` (`sv` + `en`). Komponenter använder `t` från `useLanguage()`. **Inget hårdkodat copy i publika komponenter.** Locale sparas i `localStorage` (`tkl-locale`). Adminpanelen är undantagen — den är enbart på svenska med hårdkodade strängar, och auditeras inte heller mot samma designkrav som publika sidor.

## SEO

- `public/sitemap.xml`, `public/robots.txt` och `public/llms.txt` uppdateras **manuellt** när rutter tillkommer.
- Varje `page.tsx` exporterar canonical-URL och BreadcrumbList JSON-LD; `/career` och `/events` renderar dessutom dynamisk `ItemList` JSON-LD efter datahämtning.

Checklista vid ny publik rutt: canonical + `openGraph.url` i `page.tsx`, BreadcrumbList JSON-LD, ny `<url>`-post i `sitemap.xml`, ny rad i `llms.txt`.

## Analytics och GDPR

PostHog (EU-hostat) är integrerat men **avstängt** (`ANALYTICS_ENABLED=false` i `src/lib/analytics.ts`) i väntan på signerat DPA med PostHog. Flaggan styr init, cookie-bannern och gör all `capture()` till no-ops. Init-koden i `instrumentation-client.ts` är dessutom utkommenterad — när DPA:t är signerat: kommentera in den och sätt flaggan till `true`.

När det aktiveras: samtycke krävs innan något lagras (opt-out per default, memory-persistens tills besökaren accepterar cookie-bannern). Känsliga formulärfält markeras med `data-ph-no-capture`. All tracking går via `capture()` i `src/lib/analytics.ts` — aldrig `posthog.capture` direkt, och aldrig statisk import av `posthog-js` utanför den filen.

## Konton och tjänster du behöver åtkomst till

| Tjänst               | Används till                                  | Var                                    |
| -------------------- | --------------------------------------------- | -------------------------------------- |
| **Firebase Console** | Firestore, Auth, Hosting, deploy              | console.firebase.google.com → `tkl-nexus` |
| **GitHub**           | Källkod, CI (Actions), secrets                | github.com/Jepsterrr/tkl-nexus (bör flyttas till kår-ägd organisation vid överlämning) |
| **Cloudinary**       | Bildlagring                                   | cloudinary.com                         |
| **Cloudflare**       | Worker för säker bildradering                 | dash.cloudflare.com                    |
| **Simply.com**       | DNS för tklnexus.se                           | simply.com                             |
| **PostHog (EU)**     | Produktanalys (vilande tills DPA signerats)   | eu.posthog.com                         |
| **ao@teknologkaren.se** | Mottagare av företagens formulärinskick    | Kårens mailsystem                      |

## Kända fällor

- **OneDrive + `.next` (Windows):** ligger projektet i en OneDrive-synkad mapp låser OneDrive filer i `.next` och builds kraschar med `EPERM: unlink`. Lösningen är att göra `.next` till en junction mot lokal disk (utanför synken):

  ```powershell
  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
  New-Item -ItemType Junction -Path .next -Target "$env:LOCALAPPDATA\tkl-nexus-build\.next"
  # Krävs också (modulupplösning från fysiska sökvägen):
  New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\tkl-nexus-build\node_modules" -Target "$PWD\node_modules"
  ```

  Målkatalogen `%LOCALAPPDATA%\tkl-nexus-build\.next` måste finnas innan junctions skapas.
- **CSP-blockningar:** misslyckas en fetch mot en extern domän utan att synas i Network-fliken — kontrollera CSP först. Nya externa domäner måste tillåtas i **både** `next.config.ts` och `firebase.json`.
- **`settings/cacheVersion`:** service-lagret cachar Firestore-läsningar per kollektion. Admin-skrivningar bumpar versionen automatiskt via `bumpCacheVersion()` — ändrar du data manuellt i Firebase Console kan publika sidor visa gammal cache tills versionen bumpas.
- **LUDD-API:et** (`events.ludd.ltu.se`) är en extern beroendepunkt för Campus Events — sajten hanterar fel/timeout, men bryts API-kontraktet behöver mappningen i `EventsContent` ses över.
- **Hydration-mismatch:** läs aldrig `localStorage` i en `useState`-initializer — initiera med default och läs i `useEffect`.
- **Glasskort i light mode:** syns kortet dåligt, lägg `<div className="absolute inset-0 light:bg-white/50 pointer-events-none" aria-hidden="true" />` inuti kortet.

## Licens och ägande

© Teknologkåren vid Luleå tekniska universitet. Alla rättigheter förbehållna.

Källkoden är publikt läsbar på GitHub i transparens- och överlämningssyfte, men **ingen öppen licens är beviljad** — koden får inte återanvändas, kopieras eller distribueras utan Teknologkårens tillstånd. (Enligt GitHubs användarvillkor får andra användare se och forka publika repos på plattformen, men utan licens ger det ingen rätt att använda koden utanför GitHub.)