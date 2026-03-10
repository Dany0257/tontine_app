import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Configuration réelle du projet Firebase fournie par l'utilisateur
const firebaseConfig = {
    apiKey: "AIzaSyAMxL_WcLwzaVF-2OuY4hgHXGpfdnHKUIU",
    authDomain: "tontine-app-44229.firebaseapp.com",
    projectId: "tontine-app-44229",
    storageBucket: "tontine-app-44229.firebasestorage.app",
    messagingSenderId: "318047048254",
    appId: "1:318047048254:web:35ee352dd3a62a8a43f76f",
    measurementId: "G-FP7BLZDWDJ"
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
