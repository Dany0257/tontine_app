export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    message: string;
}

export const paymentService = {
    /**
     * Simule un paiement Mobile Money via PayDunya ou Flutterwave
     */
    async simulateMobileMoneyPayment(
        phoneNumber: string,
        amount: number,
        provider: 'PayDunya' | 'Flutterwave'
    ): Promise<PaymentResponse> {
        console.log(`Starting ${provider} payment of ${amount} for ${phoneNumber}`);

        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Pour les besoins de la démo, nous supposerons que cela réussit la plupart du temps
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            return {
                success: true,
                transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                message: 'Payment successful'
            };
        } else {
            return {
                success: false,
                message: 'Payment failed. Please check your balance or try again later.'
            };
        }
    }
};
