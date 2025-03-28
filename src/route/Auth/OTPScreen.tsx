import NetInfo from '@react-native-community/netinfo';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/api'; // Import the axios instance
import { RootStackParamList } from '../../navigation/AppNavigator';
import Storage, { STORAGE_KEYS } from '../../utils/Storage';
import Toast from 'react-native-toast-message';

interface UserData {
  id?: string;
  phoneNumber?: string;
  // Add other fields based on your API response
}

type OTPScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { mobileNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Start initial timer
    setTimer(60);
    setCanResend(false);
  }, []); // Empty dependency array means this runs once when component mounts

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

      if (data != null) {
        // Store user data and token separately
        await Storage.setObject(STORAGE_KEYS.USER_DATA, data.user);
        if (data.webUserToken) {
          await Storage.setItem(STORAGE_KEYS.USER_TOKEN, data.webUserToken);
          console.log('Token stored:', data.token);
        }
        showToast('success', 'Success', 'OTP verified successfully.');



        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } else {
        showToast('error', 'Error', `Failed to verify OTP. Please try again. ${data.message}`);
      }
    } catch (error) {
      // Debugging: Log the error
      console.error('Error:', error);
      showToast('error', 'Error', 'An error occurred while verifying OTP. Please try again.');
    } finally {
      // Hide loading indicator
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setCanResend(false);
      setTimer(60);
      const response = await api.post('/hosts/generateOTP', {
        phone: `91${mobileNumber}`
      }); 

      if (response.data != null && response.data.otp) {
        showToast('success', 'Success', 'OTP sent successfully');
      } else {
        showToast('error', 'Error', 'Failed to generate OTP. Please try again.');
      }
    } catch (error) {
      showToast('error', 'Error', 'Failed to generate OTP. Please try again.');
      setCanResend(true);
      setTimer(0);
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
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={!canResend}
            style={styles.resendContainer}
          >
            <Text style={[
              styles.resendotp, 
              { textDecorationLine: 'underline' },
              !canResend && styles.resendDisabled
            ]}>
              {canResend ? 'Resend OTP' : `Resend OTP in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const showToast = (type: string, title: string, message: string) => {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    visibilityTime: 4000, // Duration for which the toast is visible
    autoHide: true, // Automatically hide the toast after the visibility time
    topOffset: 30, // Offset from the top of the screen
  });
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
  resendContainer: {
    padding: 10,
  },
  resendDisabled: {
    opacity: 0.6,
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
