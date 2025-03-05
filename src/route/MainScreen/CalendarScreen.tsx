import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CalendarScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calendar</Text>
            <View style={styles.buttonContainer}></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    buttonContainer: { width: '100%', gap: 10 },
});

export default CalendarScreen;
