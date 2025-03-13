import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import {ThemeProvider} from './context/ThemeContext';
import {DatabaseProvider} from './context/DatabaseContext';
import {NotificationProvider} from './context/NotificationContext';

const App = () => {
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
