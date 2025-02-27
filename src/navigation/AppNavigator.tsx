import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native'; 
import LoginScreen from '../route/Auth/LoginScreen';
import OTPScreen from '../route/Auth/OTPScreen'; 
import WelcomeScreen from '../route/Home/WelcomeScreen'; 
export type RootStackParamList = {
  Login: undefined;
  OTP: { mobileNumber: string };
  Welcome: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} // Hide the app bar for LoginScreen
        />
        <Stack.Screen name="OTP" component={OTPScreen}options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 

export default AppNavigator;
