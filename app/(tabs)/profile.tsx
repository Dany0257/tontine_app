import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import Card from '../../src/components/ui/Card';
import { authService } from '../../src/services/authService';

export default function ProfileScreen() {
    const { userProfile, user } = useAuth();

    const handleLogout = async () => {
        try {
            await authService.logoutUser();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View style={styles.container}>
            <Card>
                <Text style={styles.title}>Profil</Text>
                <Text style={styles.infoLabel}>Nom : <Text style={styles.infoValue}>{userProfile?.displayName || 'N/A'}</Text></Text>
                <Text style={styles.infoLabel}>Email : <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text></Text>
                <Text style={styles.infoLabel}>Téléphone : <Text style={styles.infoValue}>{userProfile?.phoneNumber || 'N/A'}</Text></Text>
            </Card>

            <Button
                title="Se déconnecter"
                variant="secondary"
                onPress={handleLogout}
                style={styles.logoutButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F2F2F7',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1C1C1E',
    },
    infoLabel: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 8,
    },
    infoValue: {
        color: '#1C1C1E',
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: 24,
    },
});
