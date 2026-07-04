import { auth } from '@/lib/firebase-auth';
import type { CloudinarySecrets } from './secrets';

export async function uploadToCloudinary(
  file: File,
  secrets: CloudinarySecrets
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', secrets.uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${secrets.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error(`Cloudinary upload misslyckades: ${res.status}`);
  }

  const data = await res.json() as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * Raderar en bild via Cloudflare Workern (workers/cloudinary-delete/),
 * som verifierar admin-status och håller API-hemligheterna serversidigt.
 * Kastar om Workern inte är konfigurerad eller raderingen misslyckas —
 * anroparna fångar och varnar (bilden blir då kvar som orphan i Cloudinary).
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_CLOUDINARY_DELETE_URL;
  if (!endpoint) {
    throw new Error(
      'NEXT_PUBLIC_CLOUDINARY_DELETE_URL saknas — se workers/cloudinary-delete/README.md'
    );
  }

  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) {
    throw new Error('deleteFromCloudinary: ingen inloggad användare');
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ publicId }),
  });

  if (!res.ok) {
    throw new Error(`Cloudinary delete misslyckades: ${res.status}`);
  }

  const body = await res.json() as { result: string };
  if (body.result !== 'ok' && body.result !== 'not found') {
    console.warn(`[cloudinary] Oväntat svar för public_id "${publicId}":`, body.result);
  }
}
