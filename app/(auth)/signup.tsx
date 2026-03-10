import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Input from '../../src/components/ui/Input';
import Button from '../../src/components/ui/Button';
import { authService } from '../../src/services/authService';

export default function SignUpScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        if (!email || !password || !name) {
            setError('Veuillez remplir le Nom, l\'Email et le Mot de passe.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await authService.registerUser(email, password, name, phone);
            // AuthContext redirigera automatiquement après une authentification réussie
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Échec de l\'inscription.');
            Alert.alert('Erreur', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Input
                    label="Nom Complet"
                    placeholder="Jean Dupont"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Numéro de Téléphone"
                    placeholder="+228 90 00 00 00"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                />

                <Input
                    label="Email"
                    placeholder="votre@exemple.com"
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
                    title="S'inscrire"
                    onPress={handleSignUp}
                    loading={loading}
                    style={styles.button}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    button: {
        marginTop: 24,
    },
});
