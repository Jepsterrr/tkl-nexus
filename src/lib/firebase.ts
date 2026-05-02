import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn('Failed to set auth persistence:', e);
});
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch {
  db = getFirestore(app);
}
const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
  const host = "127.0.0.1";

  // Note: We avoid re-connecting emulators if they are already connected
  // (though Firebase SDK handles most of this, it's good practice in Next.js)
  try {
    // connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    // connectFirestoreEmulator(db, host, 8080);
    // connectStorageEmulator(storage, host, 9199);
  } catch (e) {
    console.warn("Firebase emulators already connected or failed:", e);
  }
}

export { app, auth, db, storage };
