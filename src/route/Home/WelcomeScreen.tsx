import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack'; 
import { RootStackParamList } from '../../navigation/AppNavigator';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Button title="Go to Profile" onPress={() => {
            //   return navigation.navigate('Profile');
          }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});

export default WelcomeScreen;