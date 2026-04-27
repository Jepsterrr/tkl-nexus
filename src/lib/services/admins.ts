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
import { auth, db } from '@/lib/firebase';
import { withFetchTimeout } from '@/lib/fetch-timeout';

export async function getAdmins(): Promise<string[]> {
  const snap = await withFetchTimeout(getDocs(collection(db, 'admins')));
  return snap.docs.map((d) => d.id).sort();
}

export async function addAdmin(email: string): Promise<void> {
  await setDoc(doc(db, 'admins', email), {});
}

export async function removeAdmin(email: string): Promise<void> {
  await deleteDoc(doc(db, 'admins', email));
}

export async function sendInvite(email: string, origin: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, {
    url: `${origin}/verify`,
    handleCodeInApp: true,
  });
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
