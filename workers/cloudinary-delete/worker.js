/**
 * Cloudinary delete-proxy för TKL NEXUS.
 *
 * Syfte: håller CLOUDINARY_API_SECRET utanför webbläsaren. Klienten skickar
 * sin Firebase ID-token + publicId hit; Workern verifierar admin-status och
 * utför den signerade destroy-requesten mot Cloudinary.
 *
 * Admin-verifiering utan service-konto: Workern läser admins/{email} via
 * Firestore REST API *med användarens egen ID-token*. Firestore verifierar
 * tokenens äkthet kryptografiskt, och våra security rules tillåter bara
 * tokenägaren själv att läsa sitt admins-dokument — alltså bevisar ett
 * 200-svar både giltig token och admin-behörighet.
 */

const CORS_BASE = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function corsHeaders(env, origin) {
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    ...CORS_BASE,
    // Otillåtet origin får inget ACAO-eko alls — webbläsaren blockerar då
    // svaret. Att falla tillbaka på första tillåtna origin är meningslöst
    // och ser ut som ett hål vid granskning.
    ...(allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    Vary: 'Origin',
  };
}

function json(status, body, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

/** Plockar ut e-post ur JWT-payload — äktheten verifieras av Firestore, inte här. */
function decodeJwtEmail(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const email = JSON.parse(decoded).email;
    return typeof email === 'string' && email.length > 0 ? email : null;
  } catch {
    return null;
  }
}

async function isAdmin(env, idToken, email) {
  const url =
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/admins/${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  return res.ok;
}

async function sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-1', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env, request.headers.get('Origin') ?? '');

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json(405, { error: 'method not allowed' }, cors);

    // Rate limit per klient-IP FÖRE all auth — skyddar både Cloudinary och
    // Firestore REST-anropet mot spam. Guarden gör bindningen valfri så en
    // äldre deploy/dev-miljö utan [[ratelimits]] inte kraschar.
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json(429, { error: 'too many requests' }, cors);
    }

    const auth = request.headers.get('Authorization') ?? '';
    if (!auth.startsWith('Bearer ')) return json(401, { error: 'missing token' }, cors);
    const idToken = auth.slice(7);

    const email = decodeJwtEmail(idToken);
    if (!email) return json(401, { error: 'invalid token' }, cors);

    if (!(await isAdmin(env, idToken, email))) {
      return json(403, { error: 'not admin' }, cors);
    }

    let publicId;
    try {
      ({ publicId } = await request.json());
    } catch {
      // hanteras av valideringen nedan
    }
    if (typeof publicId !== 'string' || publicId.length === 0 || publicId.length > 256) {
      return json(400, { error: 'publicId saknas eller ogiltigt' }, cors);
    }

    // Valfri skyddsvall: sätt PUBLIC_ID_PREFIX (t.ex. "tkl-nexus/") i
    // wrangler.toml så kan en komprometterad admin-session inte radera
    // bilder utanför projektets mapp i Cloudinary-kontot.
    if (env.PUBLIC_ID_PREFIX && !publicId.startsWith(env.PUBLIC_ID_PREFIX)) {
      return json(403, { error: 'publicId utanför tillåten mapp' }, cors);
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await sha1Hex(
      `public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`,
    );

    const form = new FormData();
    form.append('public_id', publicId);
    form.append('timestamp', timestamp);
    form.append('api_key', env.CLOUDINARY_API_KEY);
    form.append('signature', signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      { method: 'POST', body: form },
    );
    if (!res.ok) {
      const detail = await res.text();
      return json(502, { error: `cloudinary svarade ${res.status}`, detail }, cors);
    }

    const body = await res.json();
    // "not found" räknas som ok — bilden är borta oavsett
    return json(200, { result: body.result }, cors);
  },
};
