import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../route/Auth/LoginScreen';
import OTPScreen from '../route/Auth/OTPScreen'; 
import WelcomeScreen from '../route/Home/WelcomeScreen'; 
import HomeScreen from '../route/Home/HomeScreen';

const AppRoutes = (Stack: ReturnType<typeof createStackNavigator>) => {
  return (
    <>
      {/* Authentication Routes */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Main App Routes */}
      {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    </>
  );
};

export default AppRoutes;
