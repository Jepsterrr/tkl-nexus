import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CloudinarySecrets {
  cloudName: string;
  uploadPreset: string;
  apiKey: string;
  apiSecret: string;
}

export async function getCloudinarySecrets(): Promise<CloudinarySecrets> {
  const docRef = doc(db, 'secrets', 'cloudinary');
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('secrets/cloudinary saknas i Firestore');
  }

  const data = snap.data();

  if (
    typeof data.cloudName !== 'string' ||
    typeof data.uploadPreset !== 'string' ||
    typeof data.apiKey !== 'string' ||
    typeof data.apiSecret !== 'string'
  ) {
    throw new Error('secrets/cloudinary har ogiltigt format');
  }

  return {
    cloudName: data.cloudName,
    uploadPreset: data.uploadPreset,
    apiKey: data.apiKey,
    apiSecret: data.apiSecret,
  };
}
