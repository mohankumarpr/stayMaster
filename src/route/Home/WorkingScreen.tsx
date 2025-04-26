import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import HomeScreen from '../MainScreen/HomeScreen';

// Import SVG icons
import CalendarIcon from '../../assets/icons/calendar.svg';
import CalendarIcon1 from '../../assets/icons/calendar_new.svg';
import WalletIcon from '../../assets/icons/dollar1.svg';
import WalletIcon1 from '../../assets/icons/dollar.svg';
import HomeIcon from '../../assets/icons/home1.svg';
import HomeIcon1 from '../../assets/icons/home.svg';
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
        tabBarIcon: ({ color, size, focused }) => {
          switch (route.name) {
            case 'Home':
              return (
                focused ? <HomeIcon1 width={size} height={size} stroke={color} fill="none" /> : <HomeIcon width={size} height={size} stroke={color} fill="none" />
              );
            case 'Earnings':
              return (
                focused ? <WalletIcon1 width={size} height={size} stroke={color} fill="none" /> : <WalletIcon width={size} height={size} stroke={color} fill="none" />
              );
            case 'Calendar':
              return (
                focused ? <CalendarIcon1 width={size} height={size} stroke={color} fill="none" /> : <CalendarIcon width={size} height={size} stroke={color} fill="none" />
              );
            case 'Profile':
              return <FontAwesomeIcon icon={faUser} size={22} color={color} />
            default:
              return <HomeIcon1 width={size} height={size} stroke={color} fill="none" />;
          }
        },
        tabBarActiveTintColor: '#000000',        // Black color for active tab
        tabBarInactiveTintColor: '#808080',      // Gray color for inactive tab
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
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ headerShown: false }} />
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
