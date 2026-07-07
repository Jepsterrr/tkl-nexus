/**
 * Lägger på Cloudinarys leverans-transformationer (f_auto, q_auto, w_)
 * på en delivery-URL. Icke-Cloudinary-URL:er (t.ex. SVG-defaults i
 * /images/heroes/) returneras orörda, liksom URL:er som redan har
 * transformationer. Sparade Firestore-värden ska förbli otransformerade —
 * anropa denna vid RENDERING, aldrig innan skrivning.
 */
const CLOUDINARY_UPLOAD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

export function optimizeCloudinaryUrl(url: string, width = 1920): string {
  const match = CLOUDINARY_UPLOAD_RE.exec(url);
  if (!match) return url;
  // Redan transformerad — rör inte. Ett transformationssegment känns igen på
  // "nyckel_värde"-par (ev. kommaseparerade) före versions-/publicId-delen,
  // inte bara f_auto/q_auto som prefix.
  const firstSegment = match[2].split('/')[0];
  if (firstSegment.includes(',') || /^[a-z]{1,4}_[^/]+$/.test(firstSegment)) return url;
  return `${match[1]}f_auto,q_auto,w_${width},c_limit/${match[2]}`;
}
