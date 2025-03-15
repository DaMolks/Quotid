import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ThemeProvider, useTheme} from './context/ThemeContext';
import {DatabaseProvider, useDatabase} from './context/DatabaseContext';

// Composant contenu qui utilise le thème et la base de données
const AppContent = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {database, isLoading, error} = useDatabase();
  const [categoryCount, setCategoryCount] = useState(0);
  
  useEffect(() => {
    console.log('AppContent monté avec ThemeProvider, SafeAreaProvider et DatabaseProvider');
    console.log('Database status:', {database: !!database, isLoading, error: !!error});
    
    // Si la base de données est disponible, comptons les catégories
    if (database && !isLoading) {
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
  }, [database, isLoading, error]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.subtitle, {color: theme.text, marginTop: 16}]}>
          Initialisation de la base de données...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
        <Text style={[styles.title, {color: theme.danger}]}>Erreur</Text>
        <Text style={[styles.subtitle, {color: theme.text}]}>
          Une erreur est survenue lors de l'initialisation de la base de données.
        </Text>
        <Text style={{color: theme.danger, marginTop: 16}}>
          {error.message}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
      <Text style={[styles.title, {color: theme.primary}]}>Quotid - Étape 3</Text>
      <Text style={[styles.subtitle, {color: theme.text}]}>
        ThemeProvider, SafeAreaProvider et DatabaseProvider fonctionnent !
      </Text>
      
      <View style={styles.infoBox}>
        <Text style={{color: theme.text}}>
          Base de données initialisée avec {categoryCount} catégories
        </Text>
      </View>
      
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
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  }
});

export default App;
