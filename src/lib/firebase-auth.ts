import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { app } from './firebase';

/**
 * Firebase Auth initieras ENBART här — får aldrig importeras från publika
 * sidor/komponenter. Auth-SDK:t försöker ladda apis.google.com (blockeras
 * korrekt av CSP → konsolfel på varje sidvisning) och drar in ~40 kB JS
 * som publika sidor inte behöver. Publika sidor använder bara Firestore
 * via service-lagret.
 */
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn('Failed to set auth persistence:', e);
});
