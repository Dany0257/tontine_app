import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { authService, UserProfile } from '../services/authService';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useRouter, useSegments } from 'expo-router';

// Définition de l'état du contexte
interface AuthContextState {
    user: FirebaseUser | null;
    userProfile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextState>({
    user: null,
    userProfile: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                try {
                    const profile = await authService.getUserProfile(authUser.uid);
                    setUserProfile(profile);
                } catch (e) {
                    console.error("Échec du chargement du profil utilisateur", e);
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Gérer la logique de routage en toute sécurité après le montage du rendu/layout
    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Rediriger vers la connexion si l'utilisateur n'est pas authentifié et essaie d'accéder à l'application
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Rediriger vers les onglets principaux si l'utilisateur est authentifié et se trouve sur les écrans d'authentification
            router.replace('/(tabs)');
        }
    }, [user, segments, loading]);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
