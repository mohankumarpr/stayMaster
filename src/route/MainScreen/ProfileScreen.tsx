import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Storage from '../../utils/Storage';

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
            await Storage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    buttonContainer: { width: '100%', gap: 10 },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
