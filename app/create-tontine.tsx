import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { tontineService } from '../src/services/tontineService';
import { useAuth } from '../src/context/AuthContext';

export default function CreateTontineScreen() {
    const { user } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name || !amount) {
            Alert.alert('Erreur de validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Erreur de validation', 'Le montant doit être un nombre positif valide.');
            return;
        }

        setLoading(true);
        try {
            await tontineService.createTontine({
                name,
                amount: numAmount,
                frequency,
                adminId: user!.uid,
                status: 'pending',
                currentRound: 0,
                startDate: Date.now(), // Simplification pour l'instant, devrait idéalement être sélectionné via un DatePicker
            });
            Alert.alert('Succès', 'Tontine créée avec succès !', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Erreur', e.message || 'Échec de la création de la tontine.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Créer une nouvelle tontine</Text>

                <Input
                    label="Nom de la tontine"
                    placeholder="ex: Épargne Familiale"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Montant par tour (CFA)"
                    placeholder="5000"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />

                <Text style={styles.label}>Fréquence</Text>
                <View style={styles.frequencyContainer}>
                    {[
                        { key: 'daily', label: 'Quotidien' },
                        { key: 'weekly', label: 'Hebdo' },
                        { key: 'monthly', label: 'Mensuel' }
                    ].map((freq) => (
                        <Button
                            key={freq.key}
                            title={freq.label}
                            variant={frequency === freq.key ? 'primary' : 'secondary'}
                            onPress={() => setFrequency(freq.key as any)}
                            style={styles.frequencyButton}
                        />
                    ))}
                </View>

                <Button
                    title="Créer la tontine"
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.createButton}
                />
                <Button
                    title="Annuler"
                    variant="outline"
                    onPress={() => router.back()}
                    disabled={loading}
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
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3A3A3C',
        marginBottom: 8,
    },
    frequencyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    frequencyButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 10,
    },
    createButton: {
        marginBottom: 16,
    },
});
