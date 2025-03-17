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
  const [advancedTesting, setAdvancedTesting] = useState(false);
  const [superNotificationLoading, setSuperNotificationLoading] = useState(false);
  const [dailyScheduleLoading, setDailyScheduleLoading] = useState(false);
  
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
  
  // Test de super notification avec tâches ménagères
  const testSuperAdvancedNotification = async () => {
    console.log("Test de super notification avancée...");
    setSuperNotificationLoading(true);
    
    try {
      const result = await SuperAdvancedNotification.showHousekeepingNotification();
      
      console.log("Super notification avancée envoyée, ID:", result.id);
      
      if (result.id !== -1) {
        Alert.alert(
          "Notification ultra-riche envoyée",
          "Une notification interactive de ménage a été envoyée avec une liste de tâches cochables. Vérifiez vos notifications."
        );
      }
    } catch (error) {
      console.error("Erreur avec super notification avancée:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la super notification: ' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setSuperNotificationLoading(false);
    }
  };
  
  // Test de notification de planning quotidien
  const testDailyScheduleNotification = async () => {
    console.log("Test de notification de planning quotidien...");
    setDailyScheduleLoading(true);
    
    try {
      const result = await SuperAdvancedNotification.showDailyScheduleNotification();
      
      console.log("Notification de planning quotidien envoyée, ID:", result.id);
      
      if (result.id !== -1) {
        Alert.alert(
          "Planning quotidien envoyé",
          "Une notification de planning quotidien a été envoyée avec tâches et événements. Vérifiez vos notifications."
        );
      }
    } catch (error) {
      console.error("Erreur avec notification de planning quotidien:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification de planning: ' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setDailyScheduleLoading(false);
    }
  };

  // Effacer toutes les données
  const handleClearData = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            // Cette fonctionnalité sera implémentée ultérieurement
            Alert.alert(
              'Information',
              'Fonctionnalité non disponible pour le moment',
            );
          },
        },
      ],
    );
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

        {/* Notifications avancées */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Notifications Avancées
          </Text>
          
          {/* Bouton pour notification ultra-riche de tâches ménagères */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: superNotificationLoading 
                  ? theme.background 
                  : theme.primary,
                borderColor: theme.border
              },
            ]}
            onPress={testSuperAdvancedNotification}
            disabled={superNotificationLoading || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={superNotificationLoading ? "loading" : "broom"} 
                size={24} 
                color={superNotificationLoading || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: superNotificationLoading || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}
              >
                {superNotificationLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Notif. tâches ménagères (Android)'
                    : '✨ Notification ultra-riche ménage'}
              </Text>
            </View>
            {!superNotificationLoading && Platform.OS === 'android' && (
              <Icon name="chevron-right" size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          {/* Bouton pour notification de planning quotidien */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: dailyScheduleLoading 
                  ? theme.background 
                  : theme.primary,
                borderColor: theme.border
              },
            ]}
            onPress={testDailyScheduleNotification}
            disabled={dailyScheduleLoading || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name={dailyScheduleLoading ? "loading" : "calendar-text"} 
                size={24} 
                color={dailyScheduleLoading || Platform.OS !== 'android' 
                  ? theme.border 
                  : "#ffffff"} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {
                    color: dailyScheduleLoading || Platform.OS !== 'android'
                      ? theme.border 
                      : "#ffffff",
                    fontWeight: 'bold'
                  }
                ]}
              >
                {dailyScheduleLoading 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Planning journalier (Android)'
                    : '✨ Planning journalier interactif'}
              </Text>
            </View>
            {!dailyScheduleLoading && Platform.OS === 'android' && (
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
});

export default SettingsScreen;
