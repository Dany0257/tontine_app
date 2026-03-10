import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import { authService } from '../../src/services/authService';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Veuillez entrer votre email et votre mot de passe.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authService.loginUser(email, password);
            // AuthContext redirigera automatiquement vers (tabs)
        } catch (e: any) {
            setError(e.message || 'Échec de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Tontine App</Text>
                <Text style={styles.subtitle}>Connectez-vous pour gérer votre épargne</Text>

                <Input
                    label="Email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <Input
                    label="Mot de passe"
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    error={error}
                />

                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.button}
                />

                <Button
                    title="Créer un compte"
                    variant="outline"
                    onPress={() => router.push('/(auth)/signup')}
                    disabled={loading}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 32,
        textAlign: 'center',
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
    },
});
