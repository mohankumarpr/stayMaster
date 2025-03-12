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

export type RootStackParamList = {
  Login: undefined;
  OTP: { mobileNumber: string };
  Welcome: undefined;
  Home: undefined;
  Earnings: undefined;
  Calendar: undefined;
  Profile: undefined;
  Working: undefined;
  PropertyDetails: { propertyId: string };
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
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
        <Stack.Screen name="Working" component={WorkingScreen} />
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
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
