import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Placeholder Screens
const DashboardScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Dashboard</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Profile</Text>
  </View>
);

const EarningsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Earnings</Text>
  </View>
);

const CalendarScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Calendar</Text>
  </View>
);

// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const HomeScreen = () => {
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
              iconName = 'wallet-outline';
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default HomeScreen;
