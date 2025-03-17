import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

import {useTheme} from '../context/ThemeContext';
import {useNotification} from '../context/NotificationContext';
// Import de notre système de notifications simples comme solution de secours
import SimpleNotification from '../utils/SimpleNotification';
// Import de l'outil de diagnostic et correctif
import NotificationFix from '../utils/NotificationFix';
// Import du module de notifications avancées
import AdvancedNotification from '../utils/AdvancedNotification';
// Import du module de super notifications
import SuperAdvancedNotification from '../utils/SuperAdvancedNotification';
// Import du module de notifications style chinois
import ChineseStyleNotification from '../utils/ChineseStyleNotification';

const SettingsScreen = () => {
  const {theme, isDark, toggleTheme, refreshTheme} = useTheme();
  const {
    scheduleNotification,
    scheduleInteractiveNotification,
    cancelAllNotifications,
    requestPermissions,
    hasPermission,
  } = useNotification();

  const [notificationsEnabled, setNotificationsEnabled] = useState(hasPermission);
  const [diagnosing, setDiagnosing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gameNotifLoading, setGameNotifLoading] = useState(false);
  const [fitnessNotifLoading, setFitnessNotifLoading] = useState(false);
  const [ecommerceNotifLoading, setEcommerceNotifLoading] = useState(false);
  
  // Surveiller le changement d'état des permissions
  useEffect(() => {
    setNotificationsEnabled(hasPermission);
  }, [hasPermission]);

  // Activer/désactiver les notifications
  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      // Si on active les notifications, demander les permissions
      const granted = await requestPermissions();
      setNotificationsEnabled(granted);
    } else {
      // Si les notifications sont désactivées, annuler toutes les notifications existantes
      cancelAllNotifications();
      setNotificationsEnabled(false);
    }
  };
  
  // Test de notification de jeu style chinois
  const testGameNotification = async () => {
    console.log("Test de notification de jeu style chinois...");
    setGameNotifLoading(true);
    
    try {
      const result = await ChineseStyleNotification.showGameNotification();
      
      console.log("Notification de jeu style chinois envoyée, ID:", result.id);
      
      if (result.id !== -1) {
        Alert.alert(
          "Notification de jeu envoyée",
          "Une notification dans le style des jeux mobiles chinois a été envoyée. Vérifiez vos notifications."
        );
      }
    } catch (error) {
      console.error("Erreur avec notification de jeu style chinois:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification de jeu: ' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setGameNotifLoading(false);
    }
  };
  
  // Test de notification de fitness style chinois
  const testFitnessNotification = async () => {
    console.log("Test de notification de fitness style chinois...");
    setFitnessNotifLoading(true);
    
    try {
      const result = await ChineseStyleNotification.showFitnessNotification();
      
      console.log("Notification de fitness style chinois envoyée, ID:", result.id);
      
      if (result.id !== -1) {
        Alert.alert(
          "Notification de fitness envoyée",
          "Une notification dans le style des apps fitness chinoises a été envoyée. Vérifiez vos notifications."
        );
      }
    } catch (error) {
      console.error("Erreur avec notification de fitness style chinois:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification de fitness: ' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setFitnessNotifLoading(false);
    }
  };
  
  // Test de notification e-commerce style chinois
  const testEcommerceNotification = async () => {
    console.log("Test de notification e-commerce style chinois...");
    setEcommerceNotifLoading(true);
    
    try {
      const result = await ChineseStyleNotification.showEcommerceNotification();
      
      console.log("Notification e-commerce style chinois envoyée, ID:", result.id);
      
      if (result.id !== -1) {
        Alert.alert(
          "Notification e-commerce envoyée",
          "Une notification dans le style des apps e-commerce chinoises a été envoyée. Vérifiez vos notifications."
        );
      }
    } catch (error) {
      console.error("Erreur avec notification e-commerce style chinois:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification e-commerce: ' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setEcommerceNotifLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <ScrollView style={styles.scrollView}>
        {/* Thème */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Apparence
          </Text>
          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="theme-light-dark" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Thème sombre
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: '#767577', true: theme.primary}}
              thumbColor="#f4f3f4"
            />
          </View>
        </View>

        {/* Notifications style chinois */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Notifications Style Chinois
          </Text>
          
          {/* En-tête explicatif */}
          <View style={[styles.infoCard, {backgroundColor: theme.card, borderColor: theme.border}]}>
            <Icon name="information-outline" size={24} color={theme.primary} />
            <Text style={[styles.infoText, {color: theme.text}]}>
              Notifications inspirées des applications chinoises, avec des éléments visuels riches, 
              des boutons colorés et des incitations à l'action.
            </Text>
          </View>
          
          {/* Bouton pour notification de jeu */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: gameNotifLoading 
                  ? theme.background 
                  : '#FF5722', // Orange pour le thème jeu
                borderColor: theme.border
              },
            ]}
            onPress={testGameNotification}
            disabled={gameNotifLoading || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={gameNotifLoading ? "loading" : "gamepad-variant"} 
                size={24} 
                color={gameNotifLoading || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: gameNotifLoading || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}
              >
                {gameNotifLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notification Jeu (Android)'
                    : '🎮 Style Jeu Mobile Chinois'}
              </Text>
            </View>
            {!gameNotifLoading && Platform.OS === 'android' && (
              <Icon name="chevron-right" size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          {/* Bouton pour notification de fitness */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: fitnessNotifLoading 
                  ? theme.background 
                  : '#4CAF50', // Vert pour le thème fitness
                borderColor: theme.border
              },
            ]}
            onPress={testFitnessNotification}
            disabled={fitnessNotifLoading || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={fitnessNotifLoading ? "loading" : "run"} 
                size={24} 
                color={fitnessNotifLoading || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: fitnessNotifLoading || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}
              >
                {fitnessNotifLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notification Fitness (Android)'
                    : '🏃 Style App Fitness Chinoise'}
              </Text>
            </View>
            {!fitnessNotifLoading && Platform.OS === 'android' && (
              <Icon name="chevron-right" size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          {/* Bouton pour notification e-commerce */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: ecommerceNotifLoading 
                  ? theme.background 
                  : '#E91E63', // Rose pour le thème e-commerce
                borderColor: theme.border
              },
            ]}
            onPress={testEcommerceNotification}
            disabled={ecommerceNotifLoading || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={ecommerceNotifLoading ? "loading" : "shopping"} 
                size={24} 
                color={ecommerceNotifLoading || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: ecommerceNotifLoading || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}
              >
                {ecommerceNotifLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notification E-commerce (Android)'
                    : '🛍️ Style E-commerce Chinois'}
              </Text>
            </View>
            {!ecommerceNotifLoading && Platform.OS === 'android' && (
              <Icon name="chevron-right" size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {/* À propos */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            À propos
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => {
              // Ouvrir le lien vers le dépôt GitHub
              Linking.openURL('https://github.com/DaMolks/Quotid');
            }}>
            <View style={styles.settingContent}>
              <Icon name="github" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Dépôt GitHub
              </Text>
            </View>
            <Icon name="open-in-new" size={24} color={theme.text} />
          </TouchableOpacity>

          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="information-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Version
              </Text>
            </View>
            <Text style={[styles.versionText, {color: theme.text}]}>
              0.1.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});

export default SettingsScreen;
