import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../route/Auth/LoginScreen';
import OTPScreen from '../route/Auth/OTPScreen';
import WelcomeScreen from '../route/Home/WelcomeScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../route/MainScreen/HomeScreen';
import EarningsScreen from '../route/MainScreen/EarningsScreen';
import CalendarScreen from '../route/MainScreen/CalendarScreen';
import ProfileScreen from '../route/MainScreen/ProfileScreen';
import WorkingScreen from '../route/Home/WorkingScreen';
import PropertyDetails from '../route/MainScreen/PropertyDetails';
import RatingsScree from '../route/ProfileSub/RatingScree';
import RatingsScreen from '../route/ProfileSub/RatingScreen';
import MonthlyStatementsScreen from '../route/ProfileSub/MonthlyStatement';
import PropertyReferralScreen from '../route/ProfileSub/ReferPropertyDetails';
import SupportScreen from '../route/ProfileSub/SupportScreen';
import CalendarInfo from '../route/MainScreen/CalendarInfo';
import UnblockBlockScreen from '../route/MainScreen/UserBlock';
import BlockInfoScreen from '../route/MainScreen/BlockInfoScreen'; 
import ResetPasswordScreen from '../route/Auth/ResetPasswordScreen';

export type RootStackParamList = {
  Login: undefined;
  OTP: { mobileNumber: string, email: string, isEmailLogin: boolean, otp?: string | number };
  Welcome: undefined;
  Home: undefined;
  Earnings: undefined;
  Calendar: undefined;
  Profile: undefined;
  Working: undefined;
  RatingsScreen: undefined;
  Statements: undefined;
  ReferProperty: undefined;
  Listings: undefined;
  Support: undefined;
  RatingsScree: undefined;
  MonthlyStatementsScreen: undefined;
  PropertySelector: undefined;
  PropertyDetails: { propertyId: string };
  PropertyReferralScreen: undefined;
  SupportScreen: undefined;
  CalendarInfo: undefined;
  UnblockBlockScreen: undefined;
  BlockInfoScreen: undefined; 
  ResetPassword: { email: string };

};

const Stack = createStackNavigator<RootStackParamList>();
// Stack Navigator for Authentication Flow 
const Tab = createBottomTabNavigator();

// HomeScreen with Bottom Tabs
const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home-outline';
              break;
            case 'Earnings':
              iconName = 'cash-outline';
              break;
            case 'Calendar':
              iconName = 'calendar-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'alert-circle-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2A144B',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Working" component={WorkingScreen} />
        {/*  <Stack.Screen name="Statements" component={StatementsScreen} />
        <Stack.Screen name="ReferProperty" component={ReferPropertyScreen} />
        <Stack.Screen name="Listings" component={ListingsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} /> */}
        <Stack.Screen name="RatingsScreen" component={RatingsScreen} />
        <Stack.Screen name="RatingsScree" component={RatingsScree} />
        <Stack.Screen name="MonthlyStatementsScreen" component={MonthlyStatementsScreen} />
        <Stack.Screen name="PropertyReferralScreen" component={PropertyReferralScreen} />
        <Stack.Screen name="SupportScreen" component={SupportScreen} />
        <Stack.Screen name="CalendarInfo" component={CalendarInfo} />
        <Stack.Screen name="UnblockBlockScreen" component={UnblockBlockScreen} />
        <Stack.Screen name="BlockInfoScreen" component={BlockInfoScreen} /> 
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen
          name="PropertyDetails"
          component={PropertyDetails}
          options={{
            headerShown: true,
            headerTitle: '',
            headerTransparent: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
