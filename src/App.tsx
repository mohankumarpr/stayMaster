import React from 'react';
import { PropertyProvider } from './context/PropertyContext';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <PropertyProvider>
      <AppNavigator />
      <Toast />
    </PropertyProvider>
  );
};

export default App;
