import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../route/Auth/LoginScreen';
import OTPScreen from '../route/Auth/OTPScreen'; 
import WelcomeScreen from '../route/Home/WelcomeScreen'; 
import HomeScreen from '../route/Home/WorkingScreen';
import CalendarScreen from '../route/MainScreen/CalendarScreen';
import EarningsScreen from '../route/MainScreen/EarningsScreen';
import ProfileScreen from '../route/MainScreen/ProfileScreen';
import BlockInfoScreen from '../route/MainScreen/BlockInfoScreen';
import UnblockBlockScreen from '../route/MainScreen/UserBlock';
import PasswordScreen from '../route/Auth/PasswordScreen';
import ResetPasswordScreen from '../route/Auth/ResetPasswordScreen';

const AppRoutes = (Stack: ReturnType<typeof createStackNavigator>) => {
  return (
    <>
      {/* Authentication Routes */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} /> 
      <Stack.Screen name="PasswordScreen" component={PasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      {/* Main App Routes */}
      {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    </>
  );
};

export default AppRoutes;
