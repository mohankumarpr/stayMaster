import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, ImageBackground, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import NetInfo from '@react-native-community/netinfo';
import api from '../../api/api'; // Import the axios instance

type OTPScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { mobileNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      handleVerifyOTP(enteredOtp);
    }
  }, [otp]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  const handleBackspace = (text: string, index: number) => {
    if (text === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    let newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
  };

  const handleVerifyOTP = async (enteredOtp: string) => {
    // Check network status
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }

    // Validate OTP
    if (enteredOtp.length === 0) {
      Alert.alert('Invalid OTP', 'Please enter the OTP sent to your mobile number.');
      return;
    }

    // Show loading indicator
    setLoading(true);

      console.log('Mobile Number:', mobileNumber);
      console.log('Entered OTP:', enteredOtp);
    // Verify OTP
    try {
      const response = await api.post('/hosts/loginWithOTP', {
      phone: `91${mobileNumber}`,
      otp: enteredOtp
      });

      // Debugging: Log the response data
      console.log('Response Data:', response.data);
      var data = response.data;

      if (data!=null && data.success) {
      Alert.alert('Success', 'OTP verified successfully.');
      navigation.navigate('Welcome'); // Navigate to the home screen or any other screen
      } else {
      Alert.alert('Error', `Failed to verify OTP. Please try again. ${data.message}`);
      }
    } catch (error) {
      // Debugging: Log the error
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred while verifying OTP. Please try again.');
    } finally {
      // Hide loading indicator
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../assets/images/Login.png')} style={styles.background}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode='contain' />
      <View style={styles.container}>
        <View style={styles.Space} />
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>OTP has been sent to your registered</Text>
        <Text style={[styles.subtitle1, { textAlign: 'center' }]}>mobile number</Text>
        <View style={styles.bottomSpace} />
        <Text style={[styles.title, { textAlign: 'center' }]}>Enter the OTP</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref as TextInput)}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace('', index);
                }
              }}
            />
          ))}
        </View>
        {loading && <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />}
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Text style={[styles.subtitle1, { textAlign: 'center' }]}>Didn't receive the OTP?</Text>
          <TouchableOpacity onPress={() => { /* Handle resend OTP */ }}>
            <Text style={[styles.resendotp, { textDecorationLine: 'underline' }]}>Resend</Text>
          </TouchableOpacity>
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
  bottomSpace: { height: 40 },
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
});

export default OTPScreen;
