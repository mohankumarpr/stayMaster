import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import HomeScreen from '../MainScreen/HomeScreen';

// Import SVG icons
import CalendarIcon from '../../assets/icons/calendartest.svg';
import WalletIcon from '../../assets/icons/dollar.svg';
import HomeIcon from '../../assets/icons/home.svg';
import ProfileIcon from '../../assets/icons/profile.svg';
import CalendarScreen from '../MainScreen/CalendarScreen';
import EarningsScreen from '../MainScreen/EarningsScreen';
import ProfileScreen from '../MainScreen/ProfileScreen';

// Placeholder Screens
const DashboardScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Dashboard</Text>
  </View>
);

 
// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

type WorkingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Working'>;
};

const WorkingScreen: React.FC<WorkingScreenProps> = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <HomeIcon width={size} height={size} fill={color} />;
            case 'Earnings':
              return <WalletIcon width={size} height={size} fill={color} />;
            case 'Calendar':
              return <CalendarIcon width={size} height={size} fill={color} />;
            case 'Profile':
              return <ProfileIcon width={size} height={size} fill={color} />;
            default:
              return <HomeIcon width={size} height={size} fill={color} />;
          }
        },
        tabBarActiveTintColor: '#2A144B',
        tabBarInactiveTintColor: '#9CA1A7',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: 'white',
          height: 60,
          borderTopWidth: 0,
          position: 'absolute',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#2A144B',
          height: 4,
          width: '15%',
          borderRadius: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ headerShown: false   }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default WorkingScreen;
