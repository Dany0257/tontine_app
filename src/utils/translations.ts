export const translateStatus = (status: string) => {
    switch (status) {
        case 'pending': return 'En attente';
        case 'active': return 'Actif';
        case 'completed': return 'Terminé';
        case 'paid': return 'Payé';
        case 'verified': return 'Vérifié';
        default: return status;
    }
};

export const translateFrequency = (freq: string) => {
    switch (freq) {
        case 'daily': return 'Quotidien';
        case 'weekly': return 'Hebdomadaire';
        case 'monthly': return 'Mensuel';
        default: return freq;
    }
};
