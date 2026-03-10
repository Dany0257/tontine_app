import { auth, db } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    paymentDetails?: {
        method: 'mobile_money' | 'bank_transfer';
        accountNumber: string;
    };
    createdAt: number;
}

export const authService = {
    async registerUser(email: string, password: string, displayName?: string, phoneNumber?: string): Promise<UserProfile> {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: displayName || user.displayName,
            phoneNumber: phoneNumber || user.phoneNumber,
            createdAt: Date.now(),
        };

        // Stocker les données utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), userProfile);

        return userProfile;
    },

    async loginUser(email: string, password: string): Promise<FirebaseUser> {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    async logoutUser(): Promise<void> {
        await signOut(auth);
    },

    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    }
};
