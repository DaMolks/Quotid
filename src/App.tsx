import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import {DatabaseProvider, useDatabase} from './context/DatabaseContext';
// Nous avons retiré NotificationProvider pour isoler le problème

// Composant contenu qui utilise les contextes
const AppContent = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {database, isLoading: dbLoading, error: dbError} = useDatabase();
  const [categoryCount, setCategoryCount] = useState(0);
  
  useEffect(() => {
    console.log('AppContent monté sans NotificationProvider');
    
    // Si la base de données est disponible, comptons les catégories
    if (database && !dbLoading) {
      const getCategoryCount = async () => {
        try {
          const [result] = await database.executeSql('SELECT COUNT(*) as count FROM categories');
          const count = result.rows.item(0).count;
          console.log('Nombre de catégories trouvées:', count);
          setCategoryCount(count);
        } catch (err) {
          console.error('Erreur lors du comptage des catégories:', err);
        }
      };
      
      getCategoryCount();
    }
  }, [database, dbLoading, dbError]);

  if (dbLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.subtitle, {color: theme.text, marginTop: 16}]}>
          Initialisation de la base de données...
        </Text>
      </SafeAreaView>
    );
  }

  if (dbError) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <Text style={[styles.title, {color: theme.danger}]}>Erreur</Text>
        <Text style={[styles.subtitle, {color: theme.text}]}>
          Une erreur est survenue lors de l'initialisation de la base de données.
        </Text>
        <Text style={{color: theme.danger, marginTop: 16}}>
          {dbError.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={[styles.title, {color: theme.primary}]}>Quotid - Diagnostic</Text>
      <Text style={[styles.subtitle, {color: theme.text}]}>
        Problème identifié : NotificationProvider
      </Text>
      
      <View style={[styles.infoBox, {backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}]}>
        <Text style={{color: theme.text}}>
          Le problème vient du NotificationProvider. Nous allons devoir le corriger.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, {backgroundColor: theme.primary}]}
          onPress={toggleTheme}
        >
          <Text style={styles.buttonText}>
            Mode {isDark ? 'clair' : 'sombre'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Composant App qui fournit les contextes
const App = () => {
  useEffect(() => {
    console.log('App sans NotificationProvider chargée');
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DatabaseProvider>
          <AppContent />
        </DatabaseProvider>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  }
});

export default App;
