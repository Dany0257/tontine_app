import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { tontineService } from '../../src/services/tontineService';
import { Tontine } from '../../src/types';
import Card from '../../src/components/ui/Card';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { translateStatus, translateFrequency } from '../../src/utils/translations';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const router = useRouter();

  const loadTontines = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await tontineService.getUserTontines(user.uid);
      setTontines(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTontines();
  }, [user]);

  const handleJoin = async () => {
    if (!inviteCode || !user) return;
    setJoining(true);
    try {
      await tontineService.joinTontine(inviteCode.toUpperCase(), user.uid);
      setInviteCode('');
      loadTontines();
      Alert.alert('Succès', 'Tontine rejointe avec succès !');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Échec de l\'adhésion');
    } finally {
      setJoining(false);
    }
  };

  const renderItem = ({ item }: { item: Tontine }) => (
    <TouchableOpacity onPress={() => router.push(`/tontine/${item.id}`)}>
      <Card>
        <View style={styles.tontineHeader}>
          <Text style={styles.tontineName}>{item.name}</Text>
          <Text style={styles.tontineStatus}>{translateStatus(item.status)}</Text>
        </View>
        <Text style={styles.tontineDetail}>Montant : {item.amount} CFA</Text>
        <Text style={styles.tontineDetail}>Fréquence : {translateFrequency(item.frequency)}</Text>
        <Text style={styles.tontineDetail}>Participants : {item.participants.length}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Tontines</Text>
        <TouchableOpacity onPress={() => router.push('/create-tontine')} style={styles.createButton}>
          <IconSymbol name="plus" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.joinSection}>
        <Input
          placeholder="Code d'invitation"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters" // Force les majuscules
          style={styles.joinInput}
        />
        <Button
          title="Rejoindre"
          onPress={handleJoin}
          loading={joining}
          style={styles.joinButton}
        />
      </View>

      <FlatList
        data={tontines}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTontines} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Vous n'avez pas encore rejoint de tontine.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  createButton: {
    padding: 8,
  },
  joinSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  joinInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  joinButton: {
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
  },
  tontineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tontineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tontineStatus: {
    fontSize: 14,
    color: '#34C759',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  tontineDetail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 32,
    fontSize: 16,
  },
});
