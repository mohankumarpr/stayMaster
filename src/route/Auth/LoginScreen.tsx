import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import api from '../../api/api';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    console.log('Mobile Number:', mobileNumber);
    // Check network status
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }

    // Validate mobile number
    if (mobileNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    // Show loading indicator
    setLoading(true);

    // Generate OTP
    try {
      const response = await api.post('/hosts/generateOTP', {
        phone: `91${mobileNumber}`
      });
       // Debugging: Log the response data
       console.log('Response Data:', response.data);
      if (response.data != null && response.data.otp) {
        navigation.navigate('OTP', { mobileNumber });
      } else {
        Alert.alert('Error', 'Failed to generate OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred while generating OTP. Please try again. ${error}`);
    } finally {
      // Hide loading indicator
      setLoading(false);
    }
  };

  const [isEmailLogin, setIsEmailLogin] = useState(false);

  return (
    <ImageBackground
      source={require('../../assets/images/Login.png')} // Adjust the path to your background image
      style={styles.background}
      resizeMode="cover" // Ensure the image covers the screen without blurring
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/logo.png')} // Adjust the path to your email icon image
          style={styles.logo}
          resizeMode='contain'
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.topSpace} />
          <View style={styles.formContainer}>
            {isEmailLogin ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#FFFFFF"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  value={email}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#FFFFFF"
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                />
                <TouchableOpacity style={styles.forgotPassword} onPress={() => { /* Handle forgot password */ }}>
                  <Text style={[styles.forgotPasswordText, { textDecorationLine: 'underline' }]}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TextInput
                style={styles.registerinput}
                placeholder="Register Mobile Number"
                placeholderTextColor="#FFFFFF"
                keyboardType="phone-pad"
                maxLength={10}
                onChangeText={(text) => {
                  if (/^\d{0,10}$/.test(text)) {
                    setMobileNumber(text);
                  }
                }}
                value={mobileNumber}
                onBlur={() => {

                }}
              />
            )}
            {isEmailLogin && <View style={styles.bottomSpace} />}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>
                {isEmailLogin ? 'Login' : 'Generate OTP'}
              </Text>
            </TouchableOpacity>
            {loading && <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />}
            <View style={styles.bottomSpace} />
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <TouchableOpacity style={styles.loginTextButton} onPress={() => setIsEmailLogin(!isEmailLogin)}>
                <Text style={styles.loginTextButtonText}>
                  {isEmailLogin ? 'Login via Mobile Number' : 'Login via Email'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Align content to the top
  },
  topSpace: {
    height: 150, // Adjust the height to create space at the top
  },
  bottomSpace: {
    height: 60, // Adjust the height to create space at the top
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 50,
  },
  input: {
    height: 40,
    borderBottomWidth: 1, // Add bottom border
    borderBottomColor: '#FFFFFF', // Color of the underline
    color: '#FFFFFF', // Text color
    paddingHorizontal: 10, // Padding inside the input field
    marginBottom: 20, // Space between input fields
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 20,
  },
  registerinput: {
    height: 40,
    borderBottomWidth: 1, // Add bottom border
    borderBottomColor: '#FFFFFF', // Color of the underline
    color: '#FFFFFF', // Text color
    paddingHorizontal: 10, // Padding inside the input field
    marginBottom: 65, // Space between input fields
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  separatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30, // Space above and below the separator text
  },
  loginButton: {
    backgroundColor: '#008281', // Button background color
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginTextButton: {
    // backgroundColor: '#008281', // Button background color
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff', // White text color for the button
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginTextButtonText: {
    color: '#fff', // White text color for the button
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 0,
    marginTop: 50,
  },
  loading: {
    marginTop: 20,
  },
});

export default LoginScreen;