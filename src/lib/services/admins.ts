import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  sendSignInLinkToEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';

/**
 * Dokumentnyckeln i admins/ MÅSTE vara gemener — security rules jämför mot
 * request.auth.token.email som Firebase alltid normaliserar till gemener.
 * En nyckel med versaler skapar en admin som aldrig kan logga in.
 * Invarianten ägs här i service-lagret, inte i UI:t.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getAdmins(): Promise<string[]> {
  const snap = await withFetchTimeout(getDocs(collection(db, 'admins')));
  return snap.docs.map((d) => d.id).sort();
}

export async function addAdmin(email: string): Promise<void> {
  await setDoc(doc(db, 'admins', normalizeEmail(email)), {});
}

export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(db, 'admins', normalizeEmail(email)));
}

export async function sendInvite(email: string, origin: string): Promise<void> {
  await sendSignInLinkToEmail(auth, normalizeEmail(email), {
    url: `${origin}/verify`,
    handleCodeInApp: true,
  });
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, normalizeEmail(email));
}
