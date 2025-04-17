import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import NetInfo from '@react-native-community/netinfo';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View, PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../api/api'; // Import the axios instance
import { RootStackParamList } from '../../navigation/AppNavigator';
import Storage, { STORAGE_KEYS } from '../../utils/Storage';
import OtpVerify from 'react-native-otp-verify';

type OTPScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'> & {
    params: {
      mobileNumber: string;
      email: string;
      isEmailLogin: boolean;
      otp?: string | number;
    };
  };
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { mobileNumber, email, isEmailLogin } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpDetected, setOtpDetected] = useState(false);

  // Start OTP detection
  const startOtpDetection = useCallback(() => {
    if (otpDetected) return; // Prevent multiple detection attempts
    
    console.log('Starting OTP detection...');
    OtpVerify.getHash()
      .then((hash: string[]) => {
        console.log('Hash received:', hash);
        
        // Start listening for OTP using hash-based detection
        OtpVerify.addListener((message: string) => {
          console.log('Raw message received:', message);
          
          // First try to extract OTP from the response data
          try {
            const responseData = JSON.parse(message);
            if (responseData.otp) {
              console.log('OTP found in response data:', responseData.otp);
              const otpString = responseData.otp.toString();
              const otpArray = otpString.split('');
              console.log('Setting OTP array:', otpArray);
              setOtp(otpArray);
              setOtpDetected(true);
              OtpVerify.removeListener();
              return;
            }
          } catch (e) {
            console.log('Not a JSON response, trying regex patterns');
          }

          // If not found in response data, try regex patterns
          const patterns = [
            /Your staymaster OTP is (\d{6})/, // StayMaster specific format
            /(\d{6})/, // Standard 6-digit OTP
            /OTP[:\s]*(\d{6})/, // OTP followed by 6 digits
            /verification code[:\s]*(\d{6})/, // Verification code followed by 6 digits
            /code[:\s]*(\d{6})/, // Code followed by 6 digits
          ];

          for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
              const detectedOtp = match[1];
              console.log('OTP detected from regex:', detectedOtp);
              
              // Fill OTP fields
              const otpArray = detectedOtp.split('');
              console.log('Setting OTP array:', otpArray);
              setOtp(otpArray);
              setOtpDetected(true);
              
              // Remove listener after OTP is detected
              OtpVerify.removeListener();
              return;
            }
          }
        });
      })
      .catch((error: Error) => {
        console.log('Error in OTP detection:', error);
        showToast('error', 'Error', 'Failed to start OTP detection');
      });
  }, [otpDetected]);

  // Request SMS permissions and start OTP detection
  const requestSMSPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        console.log('Requesting SMS permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'StayMaster needs access to your SMS to auto-fill OTP',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        console.log('Permission result:', granted);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('SMS permission granted, starting OTP detection');
          startOtpDetection();
        } else {
          console.log('SMS permission denied');
          showToast('error', 'Permission Denied', 'Please grant SMS permission to auto-fill OTP');
        }
      } catch (err) {
        console.warn('Error requesting SMS permission:', err);
        showToast('error', 'Error', 'Failed to request SMS permission');
      }
    } else {
      // For iOS, we can't request SMS permissions directly
      // The library will handle this internally
      console.log('iOS platform detected, starting OTP detection');
      startOtpDetection();
    }
  }, [startOtpDetection]);

  const handleVerifyOTP = useCallback(async (enteredOtp: string) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }

    if (enteredOtp.length === 0) {
      Alert.alert('Invalid OTP', 'Please enter the OTP.');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isEmailLogin) {
        if (email) {
          response = await api.post('/hosts/loginWithEmail', {
            email: email,
            password: enteredOtp
          });
        }
      } else {
        response = await api.post('/hosts/loginWithOTP', {
          phone: `91${mobileNumber}`,
          otp: enteredOtp
        });
      }

      if (response != null) {
        console.log('Response Data:', response.data);
        var data = response.data;

        if (data != null) {
          console.log('Login successful, storing user data and token...');
          await Storage.setObject(STORAGE_KEYS.USER_DATA, data.user);
          if (data.webUserToken) {
            console.log('Storing web user token...');
            await Storage.setItem(STORAGE_KEYS.USER_TOKEN, data.webUserToken);
            console.log('Token stored successfully');
          } else {
            console.log('No web user token received from server');
          }
          if (isEmailLogin) {
            showToast('success', 'Success', 'Password verified successfully.');
          } else {
            showToast('success', 'Success', 'OTP verified successfully.');
          }
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        } else {
          if (isEmailLogin) {
            showToast('error', 'Error', `Failed to verify password. Please try again. ${data.message}`);
          } else {
            showToast('error', 'Error', `Failed to verify OTP. Please try again. ${data.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      if (isEmailLogin) {
        showToast('error', 'Error', 'An error occurred while verifying password. Please try again.');
      } else {
        showToast('error', 'Error', 'An error occurred while verifying OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [isEmailLogin, email, mobileNumber, navigation]);

  useEffect(() => {
    // Start initial timer
    setTimer(60);
    setCanResend(false);
    
    // Handle initial OTP if available in route params
    if (route.params?.otp) {
      console.log('Initial OTP received:', route.params.otp);
      const otpString = route.params.otp.toString();
      const otpArray = otpString.split('');
      console.log('Setting initial OTP array:', otpArray);
      setOtp(otpArray);
      setOtpDetected(true);
    }
    
    // Request SMS permissions and start OTP detection
    if (!isEmailLogin) {
      requestSMSPermission();
    }
  }, [isEmailLogin, requestSMSPermission, route.params?.otp]);

  // Add effect to handle OTP from response data
  useEffect(() => {
    const handleInitialOTP = async () => {
      try {
        let response;
        if (email) {
          response = await api.post('/hosts/generateEmailOTP', {
            email: email
          });
        } else {
          response = await api.post('/hosts/generateOTP', {
            phone: `91${mobileNumber}`
          });
        }

        if (response.data != null && response.data.otp) {
          console.log('Initial OTP received in response:', response.data.otp);
          const otpString = response.data.otp.toString();
          const otpArray = otpString.split('');
          console.log('Setting initial OTP array from response:', otpArray);
          setOtp(otpArray);
          setOtpDetected(true);
        }
      } catch (error) {
        console.log('Error getting initial OTP:', error);
      }
    };

    handleInitialOTP();
  }, [email, mobileNumber]);

  useEffect(() => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      handleVerifyOTP(enteredOtp);
    }
  }, [otp, handleVerifyOTP]);

  // Clean up OTP listener when component unmounts
  useEffect(() => {
    return () => {
      console.log('Cleaning up OTP listener');
      if (otpDetected) {
        OtpVerify.removeListener();
      }
    };
  }, [otpDetected]);

  // Add effect to log OTP changes
  useEffect(() => {
    console.log('OTP state updated:', otp);
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

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setCanResend(false);
      setTimer(60);

      let response;
      if (email) {
        response = await api.post('/hosts/generateEmailOTP', {
          email: email
        });
      } else {
        response = await api.post('/hosts/generateOTP', {
          phone: `91${mobileNumber}`
        });
      }

      if (response.data != null && response.data.otp) {
        console.log('OTP received in response:', response.data.otp);
        // Set OTP directly from response
        const otpString = response.data.otp.toString();
        const otpArray = otpString.split('');
        console.log('Setting OTP array from response:', otpArray);
        setOtp(otpArray);
        setOtpDetected(true);
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesomeIcon icon={faArrowLeft} size={16} color="white" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode='contain' />
      <View style={styles.container}>
        <View style={styles.Space} />
        {!isEmailLogin ? (
          <>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>OTP has been sent to your</Text>
            <Text style={[styles.subtitle1, { textAlign: 'center' }]}>
              {'registered mobile number'}
            </Text>
          </>
        ) : (
          <Text style={[styles.subtitle, { textAlign: 'center' }]}></Text>
        )}

        <View style={styles.bottomSpace} />
        <Text style={[styles.title, { textAlign: 'center' }]}>
          {isEmailLogin ? 'Enter your password' : 'Enter the OTP'}
        </Text>

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
          {isEmailLogin ? (
            <TouchableOpacity
              onPress={() => {
                // Add your forgot password navigation logic here
                // navigation.navigate('ForgotPassword');
                navigation.navigate('ResetPassword', { email: email });
              }}
              style={styles.resendContainer}
            >
              <Text style={[styles.resendotp, { textDecorationLine: 'underline' }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          ) : (
            <>
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
            </>
          )}
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 4,
    lineHeight: 24,
  },
});

export default OTPScreen;
