import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

// Configuration réelle du projet Firebase fournie par l'utilisateur
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

// Passer à 'false' pour utiliser le vrai backend Firebase en ligne
const USE_EMULATORS = false;

if (USE_EMULATORS) {
    try {
        // Utilise localhost pour le web, et l'IP de la machine pour le mobile (iPhone/Android)
        // Votre IP de carte eth0 : 172.23.2.147
        const platform = typeof window !== 'undefined' ? 'web' : 'native';
        const host = platform === 'web' ? 'localhost' : '172.23.2.147';

        connectAuthEmulator(auth, `http://${host}:9099`);
        connectFirestoreEmulator(db, host, 8080);
        console.log(`Émulateurs Firebase configurés sur ${host}`);
    } catch (e) {
        console.log("Les émulateurs sont déjà configurés.");
    }
}

export { app, auth, db };
