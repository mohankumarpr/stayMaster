import React from 'react';
import { PropertyProvider } from './context/PropertyContext';
import AppNavigator from './navigation/AppNavigator';


const App = () => {
  return (
    <PropertyProvider>
      <AppNavigator />;
    </PropertyProvider>
  );
};

export default App;
