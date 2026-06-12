# Cloudinary delete-proxy (Cloudflare Worker)

Håller `CLOUDINARY_API_SECRET` utanför webbläsaren. Klienten anropar Workern
med sin Firebase ID-token; Workern verifierar admin-status via Firestore REST
(med användarens egen token — security rules är admin-kontrollen) och utför
den signerade raderingen mot Cloudinary.

## Deploy (engångsjobb, ~5 min)

1. Skapa gratis Cloudflare-konto: https://dash.cloudflare.com/sign-up
2. ```bash
   cd workers/cloudinary-delete
   npx wrangler login
   npx wrangler secret put CLOUDINARY_CLOUD_NAME
   npx wrangler secret put CLOUDINARY_API_KEY
   npx wrangler secret put CLOUDINARY_API_SECRET
   npx wrangler deploy
   ```
   VARNING (Windows): pipea ALDRIG värden till `secret put` från PowerShell —
   pipen lägger till BOM/radbrytning och Cloudinary svarar då 401
   ("Unknown API key ﻿..."). Skriv värdet interaktivt, eller använd
   `npx wrangler secret bulk <fil.json>` med en BOM-fri JSON-fil.
3. Kopiera URL:en som `deploy` skriver ut (t.ex. `https://tkl-cloudinary-delete.<konto>.workers.dev`)
   och lägg i `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_DELETE_URL=https://tkl-cloudinary-delete.<konto>.workers.dev
   ```
4. Bygg om och deploya sajten.

## Efterstädning (viktigt)

När Workern är verifierad (radera en testbild i admin):

1. Ta bort fälten `apiKey` och `apiSecret` ur Firestore-dokumentet
   `secrets/cloudinary` — klienten använder dem inte längre. Behåll
   `cloudName` och `uploadPreset` (krävs för uppladdning).
2. Skärp gärna CSP: byt `https://*.workers.dev` mot din exakta Worker-URL
   i `firebase.json` och `next.config.ts`.

## Felsökning

- `403 not admin` — kontot saknar dokument i `admins`-kollektionen.
- `401 invalid token` — ID-token har gått ut; logga ut/in i admin.
- CORS-fel — kontrollera `ALLOWED_ORIGINS` i `wrangler.toml` och deploya om.
