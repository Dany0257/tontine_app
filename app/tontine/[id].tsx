import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { tontineService } from '../../src/services/tontineService';
import { authService, UserProfile } from '../../src/services/authService';
import { exportService } from '../../src/services/exportService';
import { Tontine, Round } from '../../src/types';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import { translateStatus, translateFrequency } from '../../src/utils/translations';

export default function TontineDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();

    const [tontine, setTontine] = useState<Tontine | null>(null);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [participantsInfo, setParticipantsInfo] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await tontineService.getTontineById(id);
            setTontine(data);

            if (data) {
                // Charger les tours
                const loadedRounds = await tontineService.getTontineRounds(id);
                setRounds(loadedRounds);

                // Charger les participants
                const pInfo: Record<string, UserProfile> = {};
                for (const pid of data.participants) {
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

    const handleGenerateRounds = async () => {
        if (!tontine) return;
        setGenerating(true);
        try {
            await tontineService.generateRounds(tontine.id);
            Alert.alert('Succès', 'Les tours ont été générés !');
            await loadData();
        } catch (e: any) {
            Alert.alert('Erreur', e.message || 'Impossible de générer les tours.');
        } finally {
            setGenerating(false);
        }
    };

    const handleExport = async () => {
        if (!tontine || rounds.length === 0) {
            Alert.alert('Erreur', 'Aucune donnée de tour à exporter pour le moment.');
            return;
        }
        await exportService.exportTontineSummary(tontine, rounds);
    };

    if (loading || !tontine) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const isAdmin = user?.uid === tontine.adminId;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Card>
                <Text style={styles.title}>{tontine.name}</Text>
                <Text style={styles.detail}>Code d'invitation : <Text style={styles.highlight}>{tontine.inviteCode}</Text></Text>
                <Text style={styles.detail}>Montant : {tontine.amount} CFA</Text>
                <Text style={styles.detail}>Fréquence : {translateFrequency(tontine.frequency)}</Text>
                <Text style={styles.detail}>Statut : {translateStatus(tontine.status)}</Text>
                <Text style={styles.detail}>Participants : {tontine.participants.length}</Text>

                <View style={styles.headerActions}>
                    {isAdmin && rounds.length === 0 && (
                        <Button
                            title="Générer les tours"
                            onPress={handleGenerateRounds}
                            loading={generating}
                            style={[styles.actionButton, { flex: 1, marginRight: 8 }]}
                        />
                    )}
                    <Button
                        title="Exporter Résumé"
                        variant="outline"
                        onPress={handleExport}
                        style={[styles.actionButton, { flex: 1 }]}
                    />
                </View>
            </Card>

            <Text style={styles.sectionTitle}>Participants</Text>
            {tontine.participants.map(pid => (
                <Card key={pid} style={styles.participantCard}>
                    <Text style={styles.participantName}>
                        {participantsInfo[pid]?.displayName || 'Utilisateur inconnu'}
                        {pid === tontine.adminId ? ' (Admin)' : ''}
                    </Text>
                    <Text style={styles.participantPhone}>{participantsInfo[pid]?.phoneNumber || 'Pas de numéro'}</Text>
                </Card>
            ))}

            <Text style={styles.sectionTitle}>Calendrier des tours</Text>
            {rounds.length === 0 ? (
                <Text style={styles.emptyText}>Aucun tour généré pour le moment.</Text>
            ) : (
                rounds.map(round => (
                    <Card key={round.id} style={styles.roundCard}>
                        <View style={styles.roundHeader}>
                            <Text style={styles.roundTitle}>Tour {round.roundNumber}</Text>
                            <Text style={styles.roundStatus}>{translateStatus(round.status)}</Text>
                        </View>
                        <Text style={styles.detail}>
                            Bénéficiaire : {participantsInfo[round.recipientId]?.displayName || 'Inconnu'}
                        </Text>
                        <Text style={styles.detail}>
                            Date d'échéance : {new Date(round.dueDate).toLocaleDateString()}
                        </Text>
                        <Button
                            title="Voir les paiements"
                            variant="outline"
                            style={styles.paymentButton}
                            onPress={() => router.push(`/tontine/${tontine.id}/round/${round.id}`)}
                        />
                    </Card>
                ))
            )}
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
        paddingBottom: 40,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    detail: {
        fontSize: 16,
        color: '#3A3A3C',
        marginBottom: 4,
    },
    headerActions: {
        flexDirection: 'row',
        marginTop: 16,
    },
    highlight: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    actionButton: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 4,
    },
    participantCard: {
        marginBottom: 8,
    },
    participantName: {
        fontSize: 16,
        fontWeight: '500',
    },
    participantPhone: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    roundCard: {
        marginBottom: 12,
    },
    roundHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    roundTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    roundStatus: {
        fontSize: 14,
        color: '#FF9500',
        textTransform: 'capitalize',
        fontWeight: '600',
    },
    paymentButton: {
        marginTop: 12,
    },
    emptyText: {
        color: '#8E8E93',
        marginLeft: 4,
    },
});
