import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (Singleton pattern for Next.js)
// OBS: Auth initieras i firebase-auth.ts (enbart admin-vägar) — importera
// den ALDRIG härifrån till publika sidor. Storage används inte (Cloudinary).
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch {
  db = getFirestore(app);
}

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
  const host = "127.0.0.1";

  try {
    // connectFirestoreEmulator(db, host, 8080);
  } catch (e) {
    console.warn("Firebase emulators already connected or failed:", e);
  }
}

export { app, db };
