import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

export default function Button({ title, variant = 'primary', loading, style, disabled, ...props }: ButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.base,
                styles[variant],
                (disabled || loading) && styles.disabled,
                style,
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#fff'} />
            ) : (
                <Text style={[styles.text, variant === 'outline' && styles.textOutline]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    primary: {
        backgroundColor: '#007AFF',
    },
    secondary: {
        backgroundColor: '#E5E5EA',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    textOutline: {
        color: '#007AFF',
    },
});
