import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '@/lib/firebase';

/**
 * Loggar in användaren med e-post + lösenord och sätter lokal persistens.
 * Kastar vid fel (felaktiga uppgifter, nätverksfel etc).
 */
export async function signInAdmin(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Loggar ut inloggad användare.
 */
export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/**
 * Kontrollerar om den autentiserade användaren finns i admins-kollektionen.
 * Returnerar false om dokumentet saknas (permission-denied = inte admin).
 * Kastar om felet är ett nätverksfel eller annan oväntat Firestore-fel.
 */
export async function checkAdminAccess(email: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', email));
    return snap.exists();
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'permission-denied') {
      return false;
    }
    throw err;
  }
}
