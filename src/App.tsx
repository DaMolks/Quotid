import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from './context/ThemeContext';
import {DatabaseProvider} from './context/DatabaseContext';
import {NotificationProvider} from './context/NotificationContext';
import AppNavigator from './navigation/AppNavigator';

// Composant App qui fournit les contextes et la navigation
const App = () => {
  useEffect(() => {
    console.log('Application complète chargée avec navigation');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DatabaseProvider>
          <NotificationProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
