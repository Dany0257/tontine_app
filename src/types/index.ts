export interface Tontine {
    id: string;
    name: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    startDate: number;
    adminId: string;
    participants: string[]; // List of user IDs
    status: 'pending' | 'active' | 'completed';
    currentRound: number;
    inviteCode: string;
    createdAt: number;
}

export interface Round {
    id: string;
    tontineId: string;
    roundNumber: number;
    dueDate: number;
    recipientId: string;
    status: 'pending' | 'completed';
    payments: Payment[];
}

export interface Payment {
    id: string;
    roundId: string;
    payerId: string;
    amount: number;
    status: 'pending' | 'paid' | 'verified';
    paymentDate?: number;
}
