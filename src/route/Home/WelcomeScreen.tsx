import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Storage, { STORAGE_KEYS } from '../../utils/Storage';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Welcome'>;
};

interface UserData {
  firstname: string;
  // ... other user data properties ...
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userData = await Storage.getObject<UserData>(STORAGE_KEYS.USER_DATA);
        if (userData?.firstname) {
          setFirstName(userData.firstname);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    getUserName();
  }, []);

  return (
    <ImageBackground source={require('../../assets/images/Login.png')} style={styles.background}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode='contain' />
      <View style={styles.container}>
        <View style={styles.Space} />
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Text style={[styles.subtitle1, { textAlign: 'center', color: 'white', fontSize: 22, fontFamily: 'Inter', fontWeight: '500', lineHeight: 30.80, }]}>Good Evening, {firstName}</Text>

          <View style={styles.bottomSpace} />
          <TouchableOpacity style={styles.fab} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Working' }],
            });
          }}>
            <Ionicons name="chevron-forward-outline" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.Space} />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  container: { flex: 1, justifyContent: 'center', padding: 20, paddingTop: 50 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: 'white' },
  subtitle: { fontSize: 16, marginBottom: 0, color: 'white' },
  subtitle1: { fontSize: 16, marginBottom: 20, color: 'white' },
  bottomSpace: { height: 20 },
  Space: { height: 80 },
  logo: { width: 150, height: 150, alignSelf: 'center', marginBottom: 0, marginTop: 50 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  otpInput: {
    borderBottomWidth: 1,
    borderColor: 'white',
    paddingVertical: 5,
    margin: 5,
    textAlign: 'center',
    color: 'white',
    fontSize: 22,
    width: 40,
    height: 40,
  },
  resendotp: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  loading: {
    marginTop: 20,
  },
  fab: {
    position: 'static',
    bottom: 20,
    right: 20,
    backgroundColor: '#008281',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 12,
    position: 'absolute',
    bottom: -20,
  },
});

export default WelcomeScreen;