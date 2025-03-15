import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Version simplifiée pour test sans les providers ni la navigation
const App = () => {
  useEffect(() => {
    console.log('App simplifiée chargée pour test de rendu');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quotid - App de test</Text>
      <Text style={styles.subtitle}>Si vous voyez ce texte, l'application fonctionne !</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3498db',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});

export default App;
