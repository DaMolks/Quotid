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
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useTheme} from '../context/ThemeContext';
import {useNotification} from '../context/NotificationContext';
import {RootStackParamList} from '../navigation/AppNavigator';
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

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
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
  
  // Naviguer vers l'écran des paramètres de notification
  const navigateToNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };
  
  // Test de notification simple
  const testSimpleNotification = async () => {
    try {
      // Utiliser notre nouveau service de notification intégré à Firebase
      const success = await scheduleNotification({
        id: 'test-notification',
        title: '📱 Test de notification',
        message: 'Cette notification confirme que tout fonctionne correctement',
        date: new Date(Date.now() + 3000), // 3 secondes plus tard
        category: 'system',
        data: {
          type: 'test',
          timestamp: Date.now()
        },
        autoCancel: true,
        autoCancelTime: 60, // 1 minute
      });
      
      if (success) {
        Alert.alert(
          'Notification envoyée',
          'Vous recevrez une notification dans quelques secondes'
        );
      } else {
        Alert.alert(
          'Échec d\'envoi',
          'Impossible d\'envoyer la notification. Vérifiez les permissions.'
        );
      }
    } catch (error) {
      console.error('Erreur lors du test de notification:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'envoi de la notification'
      );
    }
  };
  
  // Test de notification interactive
  const testInteractiveNotification = async () => {
    try {
      // Utiliser notre service pour les notifications interactives
      const success = await scheduleInteractiveNotification({
        id: 'test-interactive-notification',
        title: '🔔 Test de notification interactive',
        message: 'Cette notification vous permet d\'effectuer des actions',
        date: new Date(Date.now() + 3000), // 3 secondes plus tard
        actions: ['Accepter', 'Refuser', 'Plus tard'],
        data: {
          type: 'test-interactive',
          timestamp: Date.now()
        },
        autoCancel: true,
        autoCancelTime: 60, // 1 minute
      });
      
      if (success) {
        Alert.alert(
          'Notification interactive envoyée',
          'Vous recevrez une notification avec boutons dans quelques secondes'
        );
      } else {
        Alert.alert(
          'Échec d\'envoi',
          'Impossible d\'envoyer la notification interactive. Vérifiez les permissions.'
        );
      }
    } catch (error) {
      console.error('Erreur lors du test de notification interactive:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'envoi de la notification interactive'
      );
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

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Notifications
          </Text>
          
          {/* Status des notifications */}
          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="bell-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{false: '#767577', true: theme.primary}}
              thumbColor="#f4f3f4"
            />
          </View>
          
          {/* Paramètres des notifications */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={navigateToNotificationSettings}
            disabled={!notificationsEnabled}>
            <View style={styles.settingContent}>
              <Icon 
                name="bell-cog-outline" 
                size={24} 
                color={notificationsEnabled ? theme.primary : theme.border} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {color: notificationsEnabled ? theme.text : theme.border}
                ]}>
                Paramètres des notifications
              </Text>
            </View>
            <Icon 
              name="chevron-right" 
              size={24} 
              color={notificationsEnabled ? theme.text : theme.border} 
            />
          </TouchableOpacity>
          
          {/* Test notifications simples */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testSimpleNotification}
            disabled={!notificationsEnabled}>
            <View style={styles.settingContent}>
              <Icon 
                name="bell-ring-outline" 
                size={24} 
                color={notificationsEnabled ? theme.primary : theme.border} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {color: notificationsEnabled ? theme.text : theme.border}
                ]}>
                Tester notification simple
              </Text>
            </View>
            <Icon 
              name="send" 
              size={24} 
              color={notificationsEnabled ? theme.text : theme.border} 
            />
          </TouchableOpacity>
          
          {/* Test notifications interactives */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testInteractiveNotification}
            disabled={!notificationsEnabled || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name="bell-badge-outline" 
                size={24} 
                color={notificationsEnabled && Platform.OS === 'android' ? theme.primary : theme.border} 
              />
              <View style={styles.settingTextContainer}>
                <Text 
                  style={[
                    styles.settingTitle, 
                    {color: notificationsEnabled && Platform.OS === 'android' ? theme.text : theme.border}
                  ]}>
                  Tester notification interactive
                </Text>
                {Platform.OS !== 'android' && (
                  <Text style={[styles.settingSubtitle, {color: theme.border}]}>
                    Seulement disponible sur Android
                  </Text>
                )}
              </View>
            </View>
            <Icon 
              name="send" 
              size={24} 
              color={notificationsEnabled && Platform.OS === 'android' ? theme.text : theme.border} 
            />
          </TouchableOpacity>
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
            disabled={gameNotifLoading || !notificationsEnabled || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={gameNotifLoading ? "loading" : "gamepad-variant"} 
                size={24} 
                color={gameNotifLoading || !notificationsEnabled || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: gameNotifLoading || !notificationsEnabled || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}>
                {gameNotifLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notification Jeu (Android)'
                    : '🎮 Style Jeu Mobile Chinois'}
              </Text>
            </View>
            {!gameNotifLoading && notificationsEnabled && Platform.OS === 'android' && (
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
            disabled={fitnessNotifLoading || !notificationsEnabled || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={fitnessNotifLoading ? "loading" : "run"} 
                size={24} 
                color={fitnessNotifLoading || !notificationsEnabled || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: fitnessNotifLoading || !notificationsEnabled || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}>
                {fitnessNotifLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notification Fitness (Android)'
                    : '🏃 Style App Fitness Chinoise'}
              </Text>
            </View>
            {!fitnessNotifLoading && notificationsEnabled && Platform.OS === 'android' && (
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
            disabled={ecommerceNotifLoading || !notificationsEnabled || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={ecommerceNotifLoading ? "loading" : "shopping"} 
                size={24} 
                color={ecommerceNotifLoading || !notificationsEnabled || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: ecommerceNotifLoading || !notificationsEnabled || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}>
                {ecommerceNotifLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notification E-commerce (Android)'
                    : '🛍️ Style E-commerce Chinois'}
              </Text>
            </View>
            {!ecommerceNotifLoading && notificationsEnabled && Platform.OS === 'android' && (
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
              0.2.0
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
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingSubtitle: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 2,
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
