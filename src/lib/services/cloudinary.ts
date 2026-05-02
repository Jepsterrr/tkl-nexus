import type { CloudinarySecrets } from './secrets';

async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

export async function deleteFromCloudinary(
  publicId: string,
  secrets: CloudinarySecrets
): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${secrets.apiSecret}`;
  const signature = await sha1(toSign);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', secrets.apiKey);
  formData.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${secrets.cloudName}/image/destroy`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    throw new Error(`Cloudinary delete misslyckades: ${res.status}`);
  }

  const body = await res.json() as { result: string };
  if (body.result !== 'ok') {
    console.warn(`[cloudinary] deleteFromCloudinary: oväntat svar för public_id "${publicId}":`, body.result);
  }
}
