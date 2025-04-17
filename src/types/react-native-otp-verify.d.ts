declare module 'react-native-otp-verify' {
  interface OtpVerify {
    getHash(): Promise<string[]>;
    addListener(callback: (message: string) => void): void;
    removeListener(): void;
  }
  
  const otpVerify: OtpVerify;
  export default otpVerify;
} 