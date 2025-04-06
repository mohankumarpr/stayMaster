import { NavigationProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Storage from './Storage';

/**
 * Handles 401 authentication errors consistently across the app
 * @param error The error object from API calls
 * @param navigation Navigation object for redirecting to login
 * @returns true if the error was a 401 and was handled, false otherwise
 */
export const handleAuthError = async (error: any, navigation?: NavigationProp<any>): Promise<boolean> => {
  if (error?.response?.status === 401) {
    // Clear user data and token
    await Storage.clear();
    
    // Show professional error message
    Toast.show({
      type: 'error',
      text1: 'Session Expired',
      text2: 'Your session has expired. Please log in again to continue.',
      position: 'top',
      visibilityTime: 4000,
    });
    
    // Navigate to login screen if navigation is provided
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    
    return true;
  }
  
  return false;
};

/**
 * Creates a response object for 401 errors that can be handled by components
 * @returns A response object indicating authentication failure
 */
export const createAuthErrorResponse = () => {
  return {
    success: false,
    status: 401,
    authError: true
  };
}; 