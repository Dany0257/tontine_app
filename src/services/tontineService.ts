import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, query, where, getDocs } from 'firebase/firestore';
import { Tontine, Round, Payment } from '../types';

function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const tontineService = {
    async createTontine(tontineData: Omit<Tontine, 'id' | 'inviteCode' | 'createdAt' | 'participants'>): Promise<Tontine> {
        const tontinesRef = collection(db, 'tontines');
        const newDocRef = doc(tontinesRef); // Génère un ID automatiquement

        const newTontine: Tontine = {
            ...tontineData,
            id: newDocRef.id,
            inviteCode: generateInviteCode(),
            participants: [tontineData.adminId],
            createdAt: Date.now(),
        };

        await setDoc(newDocRef, newTontine);
        return newTontine;
    },

    async joinTontine(inviteCode: string, userId: string): Promise<Tontine | null> {
        const tontinesRef = collection(db, 'tontines');
        const q = query(tontinesRef, where('inviteCode', '==', inviteCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Invalid invite code');
        }

        const tontineDoc = querySnapshot.docs[0];
        const tontine = tontineDoc.data() as Tontine;

        if (tontine.participants.includes(userId)) {
            throw new Error('You are already a participant');
        }

        // Ajouter l'utilisateur aux participants
        await updateDoc(doc(db, 'tontines', tontine.id), {
            participants: arrayUnion(userId)
        });

        return { ...tontine, participants: [...tontine.participants, userId] };
    },

    async getUserTontines(userId: string): Promise<Tontine[]> {
        const tontinesRef = collection(db, 'tontines');
        const q = query(tontinesRef, where('participants', 'array-contains', userId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data() as Tontine);
    },

    async getTontineById(tontineId: string): Promise<Tontine | null> {
        const docRef = doc(db, 'tontines', tontineId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Tontine;
        }
        return null;
    },

    async generateRounds(tontineId: string): Promise<void> {
        const tontine = await this.getTontineById(tontineId);
        if (!tontine) throw new Error('Tontine not found');

        // Vérification simple
        if (tontine.participants.length < 2) {
            throw new Error('Need at least 2 participants to generate rounds');
        }

        const roundsRef = collection(db, 'rounds');
        const q = query(roundsRef, where('tontineId', '==', tontineId));
        const existingRounds = await getDocs(q);
        if (!existingRounds.empty) {
            throw new Error('Rounds are already generated for this tontine.');
        }

        // Mélanger les participants pour un ordre de paiement aléatoire
        const shuffledParticipants = [...tontine.participants].sort(() => 0.5 - Math.random());

        let intervalMs = 0;
        if (tontine.frequency === 'daily') intervalMs = 24 * 60 * 60 * 1000;
        else if (tontine.frequency === 'weekly') intervalMs = 7 * 24 * 60 * 60 * 1000;
        else if (tontine.frequency === 'monthly') intervalMs = 30 * 24 * 60 * 60 * 1000;

        let currentDueDate = tontine.startDate + intervalMs;

        for (let i = 0; i < shuffledParticipants.length; i++) {
            const recipientId = shuffledParticipants[i];
            const newRoundRef = doc(roundsRef);

            const round: Round = {
                id: newRoundRef.id,
                tontineId: tontineId,
                roundNumber: i + 1,
                dueDate: currentDueDate,
                recipientId: recipientId,
                status: 'pending',
                payments: []
            };

            await setDoc(newRoundRef, round);
            currentDueDate += intervalMs;
        }
    },

    async getTontineRounds(tontineId: string): Promise<Round[]> {
        const roundsRef = collection(db, 'rounds');
        const q = query(roundsRef, where('tontineId', '==', tontineId));
        const querySnapshot = await getDocs(q);

        const rounds = querySnapshot.docs.map(doc => doc.data() as Round);
        rounds.sort((a, b) => a.roundNumber - b.roundNumber);
        return rounds;
    },

    async getRoundById(roundId: string): Promise<Round | null> {
        const docRef = doc(db, 'rounds', roundId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as Round;
        }
        return null;
    },

    async submitPayment(roundId: string, payerId: string, amount: number): Promise<void> {
        const roundRef = doc(db, 'rounds', roundId);
        const roundSnap = await getDoc(roundRef);
        if (!roundSnap.exists()) throw new Error('Round not found');

        const round = roundSnap.data() as Round;
        const existingPayment = round.payments.find(p => p.payerId === payerId);
        if (existingPayment && existingPayment.status !== 'pending') {
            throw new Error('Payment already submitted or verified for this round.');
        }

        const newPayment: Payment = {
            id: Math.random().toString(36).substring(2, 10).toUpperCase(),
            roundId,
            payerId,
            amount,
            status: 'paid',
            paymentDate: Date.now()
        };

        const updatedPayments = [...round.payments.filter(p => p.payerId !== payerId), newPayment];

        await updateDoc(roundRef, {
            payments: updatedPayments
        });
    },

    async verifyPayment(roundId: string, payerId: string): Promise<void> {
        const roundRef = doc(db, 'rounds', roundId);
        const roundSnap = await getDoc(roundRef);
        if (!roundSnap.exists()) throw new Error('Round not found');

        const round = roundSnap.data() as Round;
        const updatedPayments = round.payments.map(p => {
            if (p.payerId === payerId) {
                return { ...p, status: 'verified' as const };
            }
            return p;
        });

        await updateDoc(roundRef, {
            payments: updatedPayments
        });

        // Vérifier si tous les participants (sauf le bénéficiaire) ont des paiements vérifiés
        // Dans une vraie application, nous récupérerions la tontine pour obtenir la liste des participants
        // Pour l'instant, nous supposons que l'administrateur marque le tour comme terminé manuellement ou nous vérifions les comptes
    },

    async completeRound(roundId: string): Promise<void> {
        const roundRef = doc(db, 'rounds', roundId);
        await updateDoc(roundRef, { status: 'completed' });
    }
};
