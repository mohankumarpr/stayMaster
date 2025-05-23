import NetInfo from '@react-native-community/netinfo';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../api/api';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Storage, { STORAGE_KEYS } from '../../utils/Storage';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

interface UserData {
  id?: string;
  phoneNumber?: string;
  // Add other user data fields as needed
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [_password, setPassword] = useState(''); // Prefix with underscore to indicate it's intentionally unused
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const checkUserData = useCallback(async () => {
    const userData = await Storage.getObject<UserData>(STORAGE_KEYS.USER_DATA);
    if (userData) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Working' }],
      });
    }
  }, [navigation]);

  // Add useEffect to check for stored user data
  useEffect(() => {
    checkUserData();
  }, [checkUserData]);

  const handleLogin = async () => {
    // Check network status
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      showToast('error', 'No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }

    if (isEmailLogin) {
      // Validate email
      if (!email) {
        showToast('error', 'Invalid Email', 'Please enter a valid email address.');
        return;
      }

      // Show loading indicator
      setLoading(true);
      
      try {
        const response = await api.post('/hosts/generateEmailOTP', {
          email: email
        });
        console.log('Response Data:', response.data);
        if (response.data != null && response.data.otp) {
          // Pass the OTP to the OTP screen
          navigation.navigate('OTP', { 
            mobileNumber, 
            email, 
            isEmailLogin,
            otp: response.data.otp // Pass the OTP to the OTP screen
          });
        } else {
          showToast('error', 'Failed to generate OTP. Please try again.', '');
        }
      } catch (error) {
        showToast('error', 'Email is not valid. Please try again.', '');
      } finally {
        setLoading(false);
      }
    } else {
      // Validate mobile number
      if (mobileNumber.length < 10) {
        showToast('error', 'Invalid Number', 'Please enter a valid 10-digit mobile number.');
        return;
      }

      // Show loading indicator
      setLoading(true);

      try {
        const response = await api.post('/hosts/generateOTP', {
          phone: `91${mobileNumber}`
        });
        console.log('Response Data:', response.data);
        if (response.data != null && response.data.otp) {
          // Pass the OTP to the OTP screen
          navigation.navigate('OTP', { 
            mobileNumber, 
            email, 
            isEmailLogin,
            otp: response.data.otp // Pass the OTP to the OTP screen
          });
        } else {
          showToast('error', 'Failed to generate OTP. Please try again.', '');
        }
      } catch (error) {
        showToast('error', 'Mobile number is not valid. Please try again.', '');
      } finally {
        setLoading(false);
      }
    }
  };

  const [isEmailLogin, setIsEmailLogin] = useState(false);

  return (
    <ImageBackground
      source={require('../../assets/images/Login.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode='contain'
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        style={{ width: '100%', alignItems: 'center' }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.topSpace} />
        <View style={[styles.formContainer, { alignSelf: 'center', width: '95%' }]}>
          {isEmailLogin ? (
            <TextInput
              style={styles.registerinput}
              placeholder="Email Address"
              placeholderTextColor="#FFFFFF"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
          ) : (
            <TextInput
              style={styles.registerinput}
              placeholder="Registered Mobile Number"
              placeholderTextColor="#FFFFFF"
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(text) => {
                if (/^\d{0,10}$/.test(text)) {
                  setMobileNumber(text);
                }
              }}
              value={mobileNumber}
            />
          )}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>
              {isEmailLogin ? 'Login' : 'Generate OTP'}
            </Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />}
          <View style={styles.bottomSpace} />
          <TouchableOpacity style={[styles.loginTextButton, { marginTop: 24 }]} onPress={() => {
            setIsEmailLogin(!isEmailLogin);
            setEmail('');
            setPassword('');
            setMobileNumber('');
          }}>
            <Text style={styles.loginTextButtonText}>
              {isEmailLogin ? 'Login using Mobile Number' : 'Login using Email'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Align content to the top
  },
  topSpace: {
    height: 100, // Adjust the height to create space at the top
  },
  bottomSpace: {
    height: 5, // Adjust the height to create space at the top
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 70,
  },
  input: {
    height: 40,
    borderBottomWidth: 1, // Add bottom border
    borderBottomColor: '#FFFFFF', // Color of the underline
    color: '#FFFFFF', // Text color
    paddingHorizontal: 10, // Padding inside the input field
    marginBottom: 10, // Space between input fields
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 20,
  },
  registerinput: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    marginBottom: 35,
    fontSize: 16,
    width: '100%',
    minWidth: 280,
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
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginTextButton: {
    // backgroundColor: '#008281', // Button background color
    padding: 10,
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
    marginTop: 30,
  },
  loading: {
    marginTop: 20,
  },
});

export default LoginScreen;

function showToast(arg0: string, arg1: string, arg2: string) {
  Toast.show({
    type: arg0,
    text1: arg1,
    text2: arg2,
    visibilityTime: 4000, // Duration for which the toast is visible
    autoHide: true, // Automatically hide the toast after the visibility time
    topOffset: 30, // Offset from the top of the screen
  });
}
