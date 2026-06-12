import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Klienten behöver enbart cloudName + uploadPreset (unsigned upload).
 * apiKey/apiSecret får ALDRIG hämtas till webbläsaren — signerad radering
 * sker via Cloudflare Workern i workers/cloudinary-delete/ som håller
 * hemligheterna serversidigt.
 */
export interface CloudinarySecrets {
  cloudName: string;
  uploadPreset: string;
}

export async function getCloudinarySecrets(): Promise<CloudinarySecrets> {
  const docRef = doc(db, 'secrets', 'cloudinary');
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('secrets/cloudinary saknas i Firestore');
  }

  const data = snap.data();

  if (typeof data.cloudName !== 'string' || typeof data.uploadPreset !== 'string') {
    throw new Error('secrets/cloudinary har ogiltigt format');
  }

  return {
    cloudName: data.cloudName,
    uploadPreset: data.uploadPreset,
  };
}
