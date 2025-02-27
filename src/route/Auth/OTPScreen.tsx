import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ImageBackground } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { TouchableOpacity } from 'react-native';

type OTPScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const { mobileNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

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

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      navigation.navigate('Welcome');
    } else {
      alert('Please enter a 6-digit OTP');
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
        {/* <View style={styles.Space} /> */}
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Text style={[styles.subtitle1, { textAlign: 'center' }]}>Didn't receive the OTP?</Text>
          <TouchableOpacity onPress={() => { /* Handle forgot password */ }}>
            <Text style={[styles.resendotp, { textDecorationLine: 'underline' }]}>Resend</Text>
          </TouchableOpacity>
        </View>
        
        {/* <View style={styles.bottomSpace} />
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>OTP will expire in 00:30</Text>
        <View style={styles.bottomSpace} />
        <Text style={[styles.subtitle, { textAlign: 'center' }]}>Change Mobile Number</Text>
        <View style={styles.bottomSpace} /> */}

        {/* <Button title="Verify" onPress={handleVerify} /> */}
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
    height: 30,
  },
  resendotp: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OTPScreen;
