import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const ResetPasswordScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params as { email: string };
    const [otp, setOtp] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        otp: '',
        oldPassword: '',
        newPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [otpRef, setOtpRef] = useState<TextInput | null>(null);
    const [oldPasswordRef, setOldPasswordRef] = useState<TextInput | null>(null);
    const [newPasswordRef, setNewPasswordRef] = useState<TextInput | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOtpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResendOtp(true);
        }
        return () => clearInterval(interval);
    }, [isOtpSent, timer]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const handleSendOtp = async () => {
        console.log('handleSendOtp ', email);
        setErrors({ email: '', otp: '', oldPassword: '', newPassword: '' });

        if (!email) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }

        if (!validateEmail(email)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
            return;
        }

        setIsLoading(true);
        try {
            let response;
            response = await api.post('/hosts/generateEmailOTP', {
                email: email
            });
            console.log('response received data ', response.data);

            if (response.data != null && response.data.otp) {
                showToast('success', 'Success', 'OTP sent successfully');
                setIsOtpSent(true);
                setTimer(60);
                setCanResendOtp(false);
            } else {
                showToast('error', 'Error', 'Failed to generate OTP. Please try again.');
            }
        } catch (error) {
            showToast('error', 'Error', 'Failed to generate OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        console.log('handleResetPassword ', email, otp, oldPassword, newPassword);
        // setErrors({ email: '', otp: '', oldPassword: '', newPassword: '' });

        if (!otp || otp.length !== 6) {
            setErrors(prev => ({ ...prev, otp: 'OTP must be 6 digits' }));
            return;
        }

        if (!oldPassword || oldPassword.length < 6) {
            setErrors(prev => ({ ...prev, oldPassword: 'Old password is required' }));
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setErrors(prev => ({ ...prev, newPassword: 'New password must be at least 6 characters' }));
            return;
        }

        if (!validatePassword(newPassword)) {
            setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 6 characters' }));
            return;
        }

        setIsLoading(true);
        try {
            let response;
            response = await api.post('/hosts/resetPassword', {
                email: email,
                otp: otp,
                new_password: newPassword,
                confirm_password: oldPassword
            });
            console.log('response received data ', response.data);

            if (response.data != null && response.data.success == true) {
                showToast('success', 'Success', 'Password reset successfully');
                navigation.goBack();
            } else {
                showToast('error', 'Error', 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            showToast('error', 'Error', 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
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

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Reset Password</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, errors.email && styles.errorInput]}
                            placeholder="Enter your email"
                            placeholderTextColor="grey"
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
                        />
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                        {!isOtpSent ? (
                            <TouchableOpacity
                                style={[styles.otpButton, isLoading && styles.disabledButton]}
                                onPress={handleSendOtp}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.otpButtonText}>Get OTP</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.otpMessageContainer}>
                                <Text style={styles.otpMessage}>OTP has been sent to your email</Text>
                                {!canResendOtp ? (
                                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                                ) : (
                                    <TouchableOpacity onPress={handleSendOtp}>
                                        <Text style={styles.resendText}>Resend OTP</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {isOtpSent && (
                            <>
                                <TextInput
                                    style={[styles.input, errors.otp && styles.errorInput]}
                                    placeholder="Enter OTP"
                                    placeholderTextColor="grey"
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    ref={setOtpRef}
                                    returnKeyType="next"
                                    onSubmitEditing={() => oldPasswordRef?.focus()}
                                />
                                {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}

                                <TextInput
                                    style={[styles.input, errors.oldPassword && styles.errorInput]}
                                    placeholder="Old Password"
                                    placeholderTextColor="grey"
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    secureTextEntry
                                    maxLength={6}
                                    ref={setOldPasswordRef}
                                    returnKeyType="next"
                                    onSubmitEditing={() => newPasswordRef?.focus()}
                                />
                                {errors.oldPassword ? <Text style={styles.errorText}>{errors.oldPassword}</Text> : null}

                                <TextInput
                                    style={[styles.input, errors.newPassword && styles.errorInput]}
                                    placeholder="New Password"
                                    placeholderTextColor="grey"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                    maxLength={6}
                                    ref={setNewPasswordRef}
                                    returnKeyType="done"
                                    onSubmitEditing={handleResetPassword}
                                />
                                {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
                            </>
                        )}

                        <TouchableOpacity
                            style={[styles.confirmButton, !isOtpSent && styles.disabledButton]}
                            onPress={handleResetPassword}
                            disabled={!isOtpSent}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    backButtonText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 16,
    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginTop: 20,
    },
    container: {
        flex: 1,
        padding: 20,
        margin: 20,
        borderRadius: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 30,
        color: 'white',
        textAlign: 'center',
    },
    inputContainer: {
        gap: 15,

    },
    input: {
        height: 40,
        borderBottomWidth: 1, // Add bottom border
        borderBottomColor: '#FFFFFF', // Color of the underline
        color: '#FFFFFF', // Text color
        paddingHorizontal: 10, // Padding inside the input field
        // marginBottom: 65, // Space between input fields
        fontSize: 16,
    },
    otpButton: {
        backgroundColor: '#008281',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    otpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    otpMessageContainer: {
        alignItems: 'center',
    },
    otpMessage: {
        color: 'white',
        textAlign: 'center',
        marginVertical: 10,
    },
    timerText: {
        color: 'white',
        marginTop: 5,
    },
    resendText: {
        color: 'white',
        marginTop: 5,
        textDecorationLine: 'underline',
    },
    confirmButton: {
        backgroundColor: '#008281',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 5,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
});

export default ResetPasswordScreen;

const showToast = (type: string, title: string, message: string) => {
    Toast.show({
        type: type,
        text1: title,
        text2: message,
        visibilityTime: 4000, // Duration for which the toast is visible
        autoHide: true, // Automatically hide the toast after the visibility time
        topOffset: 30, // Offset from the top of the screen
    });
}
