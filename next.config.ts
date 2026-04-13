import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Content Security Policy
// Tillåter:
//  - Firebase (auth, firestore, storage, analytics, remote config)
//  - Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
//  - LUDD Events API
//  - Egna tillgångar (self)
// ---------------------------------------------------------------------------
const CSP = [
  "default-src 'self'",
  // Scripts: egna + Next.js inline hattar (unsafe-inline behövs för Next.js hydration)
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  // Styles: egna + Google Fonts CDN
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonter: Google Fonts statiska tillgångar
  "font-src 'self' https://fonts.gstatic.com",
  // Bilder: egna + data-URI:er
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com",
  // API-anrop: Firebase services + LUDD Events API
  [
    "connect-src 'self'",
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "https://*.cloudfunctions.net",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://events.ludd.ltu.se",
    "https://www.google-analytics.com",
  ].join(" "),
  // Frames: ingen inbäddning tillåten
  "frame-src 'none'",
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
  async headers() {
    return [
      {
        // Applicera på alla routes
        source: "/(.*)",
        headers: [
          // XSS-skydd via Content Security Policy
          {
            key: "Content-Security-Policy",
            value: CSP,
          },
          // Blockera inbäddning i iframes (clickjacking-skydd)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Hindra webbläsare från att sniffa MIME-typ
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Begränsa referrer-information vid cross-origin-navigering
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Inaktivera känsliga browser-API:er som inte används
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Aktivera HSTS (1 år, inkludera under-domäner)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
