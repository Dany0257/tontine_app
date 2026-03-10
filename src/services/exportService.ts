import { Tontine, Round } from '../types';
import * as Sharing from 'expo-sharing';

export const exportService = {
    async exportTontineSummary(tontine: Tontine, rounds: Round[]): Promise<void> {
        const lines = [
            `Summary for Tontine: ${tontine.name}`,
            `Invite Code: ${tontine.inviteCode}`,
            `Total Participants: ${tontine.participants.length}`,
            `Amount per Round: ${tontine.amount} CFA`,
            '',
            '--- Rounds Summary ---',
        ];

        rounds.forEach(round => {
            lines.push(`Round ${round.roundNumber}: ${round.status}`);
            lines.push(`Recipient: ${round.recipientId}`);
            lines.push(`Due Date: ${new Date(round.dueDate).toLocaleDateString()}`);
            lines.push(`Payments: ${round.payments.length} received`);
            lines.push('');
        });

        const content = lines.join('\n');
        console.log('Exporting Tontine Summary:', content);

        Alert.alert('Export Generated', 'In a real device, this would open a share dialog with a CSV/PDF file.');

        // Dans une vraie application avec des bibliothèques comme expo-file-system et expo-sharing :
        // const fileUri = FileSystem.cacheDirectory + 'tontine_summary.txt';
        // await FileSystem.writeAsStringAsync(fileUri, content);
        // await Sharing.shareAsync(fileUri);
    }
};

import { Alert } from 'react-native';
