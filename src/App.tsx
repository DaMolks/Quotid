import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {ThemeProvider} from './context/ThemeContext';
import {DatabaseProvider} from './context/DatabaseContext';
import {NotificationProvider} from './context/NotificationContext';
import AppNavigator from './navigation/AppNavigator';

// Import Firebase configuration
import {initializeFirebase} from './services/firebaseConfig';

// Composant App qui fournit les contextes et la navigation
const App = () => {
  useEffect(() => {
    console.log('Application complète chargée avec navigation');
    
    // Initialiser Firebase au démarrage de l'application
    const setupFirebase = async () => {
      try {
        const initialized = await initializeFirebase();
        if (initialized) {
          console.log('Firebase initialisé avec succès au démarrage de l\'app');
        } else {
          console.error('Échec de l\'initialisation de Firebase au démarrage');
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase:', error);
      }
    };
    
    setupFirebase();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* Configuration de la barre d'état avec une couleur très sombre */}
        <StatusBar 
          backgroundColor="#121212" // Couleur presque noire pour la barre d'état
          barStyle="light-content" // Style du texte et des icônes (light-content = blanc)
          translucent={false} // Pas translucide pour une séparation nette
        />
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
