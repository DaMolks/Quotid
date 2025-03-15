import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './context/ThemeContext';

// Composant contenu qui utilise le thème
const AppContent = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  
  useEffect(() => {
    console.log('AppContent monté avec ThemeProvider et SafeAreaProvider');
  }, []);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={[styles.title, {color: theme.primary}]}>Quotid - Étape 2</Text>
      <Text style={[styles.subtitle, {color: theme.text}]}>
        ThemeProvider et SafeAreaProvider fonctionnent !
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, {backgroundColor: theme.primary}]}
        onPress={toggleTheme}
      >
        <Text style={styles.buttonText}>
          Basculer en mode {isDark ? 'clair' : 'sombre'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Composant App qui fournit les contextes
const App = () => {
  useEffect(() => {
    console.log('App avec providers chargée');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default App;
