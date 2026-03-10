import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

export default function Card({ children, style, ...props }: ViewProps) {
    return (
        <View style={[styles.card, style]} {...props}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 16,
    },
});
