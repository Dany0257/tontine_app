import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../../src/context/AuthContext';
import { tontineService } from '../../../../src/services/tontineService';
import { authService, UserProfile } from '../../../../src/services/authService';
import { paymentService } from '../../../../src/services/paymentService';
import { Round, Tontine, Payment } from '../../../../src/types';
import Card from '../../../../src/components/ui/Card';
import Button from '../../../../src/components/ui/Button';
import { translateStatus } from '../../../../src/utils/translations';

export default function RoundDetailsScreen() {
    const { id: tontineId, roundId } = useLocalSearchParams<{ id: string, roundId: string }>();
    const { user } = useAuth();

    const [round, setRound] = useState<Round | null>(null);
    const [tontine, setTontine] = useState<Tontine | null>(null);
    const [participantsInfo, setParticipantsInfo] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    // Charger les données au montage du composant
    useEffect(() => {
        loadData();
    }, [roundId]);

    const loadData = async () => {
        if (!roundId || !tontineId) return;
        try {
            setLoading(true);
            const [roundData, tontineData] = await Promise.all([
                tontineService.getRoundById(roundId),
                tontineService.getTontineById(tontineId)
            ]);

            setRound(roundData);
            setTontine(tontineData);

            if (tontineData) {
                const pInfo: Record<string, UserProfile> = {};
                for (const pid of tontineData.participants) {
                    const profile = await authService.getUserProfile(pid);
                    if (profile) pInfo[pid] = profile;
                }
                setParticipantsInfo(pInfo);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!user || !tontine || !round) return;

        Alert.alert(
            'Confirmation de paiement',
            `Vous êtes sur le point de payer ${tontine.amount} CFA pour le Tour ${round.roundNumber}. Continuer ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Payer via Mobile Money',
                    onPress: async () => {
                        setPaying(true);
                        try {
                            const res = await paymentService.simulateMobileMoneyPayment(
                                user.phoneNumber || '90000000',
                                tontine.amount,
                                'PayDunya'
                            );

                            if (res.success) {
                                await tontineService.submitPayment(round.id, user.uid, tontine.amount);
                                Alert.alert('Succès', 'Paiement soumis ! En attente de vérification par l\'administrateur.');
                                await loadData();
                            } else {
                                Alert.alert('Erreur', res.message);
                            }
                        } catch (e: any) {
                            Alert.alert('Erreur', e.message || 'Échec du paiement');
                        } finally {
                            setPaying(false);
                        }
                    }
                }
            ]
        );
    };

    const verifyPayment = async (payerId: string) => {
        if (!round) return;
        try {
            await tontineService.verifyPayment(round.id, payerId);
            Alert.alert('Succès', 'Paiement vérifié.');
            await loadData();
        } catch (e: any) {
            Alert.alert('Erreur', e.message);
        }
    };

    const completeRound = async () => {
        if (!round) return;
        try {
            await tontineService.completeRound(round.id);
            Alert.alert('Succès', 'Tour marqué comme complété.');
            await loadData();
        } catch (e: any) {
            Alert.alert('Erreur', e.message);
        }
    };

    if (loading || !round || !tontine) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const isAdmin = user?.uid === tontine.adminId;
    const isRecipient = user?.uid === round.recipientId;
    const myPayment = round.payments.find(p => p.payerId === user?.uid);
    const canPay = !isRecipient && (!myPayment || myPayment.status === 'pending') && round.status === 'pending';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Card>
                <Text style={styles.title}>Tour {round.roundNumber}</Text>
                <Text style={styles.detail}>Bénéficiaire : <Text style={styles.bold}>{participantsInfo[round.recipientId]?.displayName || 'Inconnu'}</Text></Text>
                <Text style={styles.detail}>Date d'échéance : {new Date(round.dueDate).toLocaleDateString()}</Text>
                <Text style={styles.detail}>Montant par participant : {tontine.amount} CFA</Text>
                <Text style={styles.detail}>Statut : <Text style={styles.statusText}>{translateStatus(round.status)}</Text></Text>

                {canPay && (
                    <Button
                        title="Effectuer le paiement"
                        onPress={handlePay}
                        loading={paying}
                        style={styles.payButton}
                    />
                )}

                {isAdmin && round.status === 'pending' && (
                    <Button
                        title="Marquer le tour comme terminé"
                        variant="secondary"
                        onPress={completeRound}
                        style={styles.adminButton}
                    />
                )}
            </Card>

            <Text style={styles.sectionTitle}>Suivi des paiements</Text>
            {tontine.participants.filter(pid => pid !== round.recipientId).map(pid => {
                const p = round.payments.find(pm => pm.payerId === pid);
                return (
                    <Card key={pid} style={styles.paymentCard}>
                        <View style={styles.paymentRow}>
                            <View>
                                <Text style={styles.payerName}>{participantsInfo[pid]?.displayName || 'Participant'}</Text>
                                <Text style={styles.paymentStatus}>
                                    {p ? `Statut : ${translateStatus(p.status)}` : 'Attente de paiement'}
                                </Text>
                            </View>
                            {isAdmin && p && p.status === 'paid' && (
                                <Button
                                    title="Vérifier"
                                    onPress={() => verifyPayment(pid)}
                                    style={styles.verifyButton}
                                />
                            )}
                        </View>
                    </Card>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    content: {
        padding: 16,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detail: {
        fontSize: 16,
        marginBottom: 4,
        color: '#3A3A3C',
    },
    bold: {
        fontWeight: 'bold',
    },
    statusText: {
        fontWeight: 'bold',
        color: '#FF9500',
        textTransform: 'capitalize',
    },
    payButton: {
        marginTop: 16,
    },
    adminButton: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        marginLeft: 4,
    },
    paymentCard: {
        marginBottom: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    payerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    paymentStatus: {
        fontSize: 14,
        color: '#8E8E93',
    },
    verifyButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        minHeight: 35,
    },
});
