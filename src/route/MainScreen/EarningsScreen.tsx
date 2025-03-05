import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EarningsScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Earnings</Text>
            <View style={styles.buttonContainer}></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    buttonContainer: { width: '100%', gap: 10 },
});

export default EarningsScreen;
