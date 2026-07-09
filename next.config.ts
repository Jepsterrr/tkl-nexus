import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Content Security Policy
//
// VIKTIGT: headers() nedan körs ENBART av Node-servern (next dev / next start).
// I produktion serveras sajten statiskt av Firebase Hosting — där gäller
// uteslutande headers i firebase.json. Ändra alltid BÅDA filerna i synk.
//
// Tillåter:
//  - Firebase (auth, firestore, storage, analytics, remote config)
//  - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
//  - LUDD Events API
//  - Cloudinary (upload) + Cloudflare Worker (signerad delete)
//  - PostHog EU (script, API, inbäddad dashboard i admin)
//  - Egna tillgångar (self)
// ---------------------------------------------------------------------------
const CSP = [
  "default-src 'self'",
  // Scripts: egna + Next.js inline hattar (unsafe-inline behövs för Next.js hydration)
  "script-src 'self' 'unsafe-inline' https://eu-assets.i.posthog.com",
  // Styles: egna + Google Fonts CDN
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonter: Google Fonts statiska tillgångar
  "font-src 'self' https://fonts.gstatic.com",
  // Bilder: egna + data-URI:er + Cloudinary
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://res.cloudinary.com",
  // API-anrop: Firebase services + LUDD Events API + Cloudinary + Worker + PostHog
  [
    "connect-src 'self'",
    "https://firestore.googleapis.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://events.ludd.ltu.se",
    "https://api.cloudinary.com",
    "https://tkl-cloudinary-delete.tklnexus.workers.dev",
    "https://eu.i.posthog.com",
    "https://eu-assets.i.posthog.com",
  ].join(" "),
  // Frames: enbart PostHog-dashboard (inbäddas på /admin/analytics)
  "frame-src https://eu.posthog.com",
  // Ingen annan sajt får rama in oss (kompletterar X-Frame-Options: DENY)
  "frame-ancestors 'none'",
  // Objekt: blockera Flash och plugins
  "object-src 'none'",
  // Base URI: enbart eget ursprung
  "base-uri 'self'",
  // Form-actions: enbart eget ursprung
  "form-action 'self'",
  // Tvinga HTTP-resurser att uppgraderas till HTTPS
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        // Applicera på alla routes (gäller bara dev/next start — se kommentar ovan)
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
