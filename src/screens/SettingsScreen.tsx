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

  // Tester les notifications avec toutes les approches possibles
  const testNotifications = () => {
    console.log("Test des notifications de base...");
    
    try {
      // Utiliser directement PushNotification pour plus de fiabilité
      PushNotification.localNotification({
        channelId: 'system-channel',
        title: '🔔 Notification Standard',
        message: 'Ceci est un test de notification standard directe',
        importance: "high",
        priority: "high",
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: 'default',
      });
      
      console.log("Notification standard envoyée directement via PushNotification");
    } catch (error) {
      console.error("Erreur avec notification directe:", error);
      
      // Essayer via SimpleNotification comme fallback
      SimpleNotification.showReminder({
        title: '🔔 Notification Standard (fallback)',
        message: 'Ceci est un test de notification via fallback'
      });
    }
  };
  
  // Tester les notifications interactives
  const testInteractiveNotifications = () => {
    console.log("Test des notifications interactives...");
    
    try {
      // Utiliser directement PushNotification pour plus de fiabilité
      PushNotification.localNotification({
        channelId: 'interactive-channel',
        title: '⭐ Notification Interactive',
        message: 'Exemple de notification avec actions personnalisées',
        importance: "high",
        priority: "high",
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: 'default',
        actions: ['Accepter', 'Refuser', 'Plus tard'],
      });
      
      console.log("Notification interactive envoyée directement via PushNotification");
    } catch (error) {
      console.error("Erreur avec notification interactive directe:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification interactive. Erreur: ' + error.message
      );
    }
  };
  
  // Fonction pour envoyer une notification interactive
  const sendInteractiveNotification = () => {
    // Cette fonction n'est plus utilisée directement
    scheduleInteractiveNotification({
      id: `interactive-${Date.now()}`,
      title: '⭐ Exemple: Rappel de réunion',
      message: 'Réunion d\'équipe dans 15 minutes. Préparer les documents?',
      date: new Date(),
      actions: ['Accepter', 'Refuser', 'Plus tard'],
      category: 'interactive',
      data: {
        type: 'meeting',
        importance: 'high'
      }
    });
  };
  
  // Exemple de notification pour un événement
  const testEventReminder = () => {
    console.log("Test de notification pour un événement...");
    
    try {
      // Utiliser directement PushNotification pour plus de fiabilité
      PushNotification.localNotification({
        channelId: 'reminders-channel',
        title: '📅 Rappel: Faire le ménage',
        message: 'N\'oubliez pas de nettoyer l\'appartement aujourd\'hui',
        importance: "high",
        priority: "high",
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: 'default',
        actions: ['Terminer', 'Reporter', 'Détails'],
      });
      
      console.log("Notification de rappel envoyée directement via PushNotification");
    } catch (error) {
      console.error("Erreur avec notification de rappel directe:", error);
      
      // Essayer via SimpleNotification comme fallback
      SimpleNotification.showReminder({
        title: '📅 Rappel (fallback)',
        message: 'N\'oubliez pas de nettoyer l\'appartement aujourd\'hui'
      });
    }
  };
  
  // Fonction pour envoyer une notification de rappel d'événement
  const sendEventReminder = () => {
    // Cette fonction n'est plus utilisée directement
    scheduleNotification({
      id: `event-reminder-${Date.now()}`,
      title: '📅 Rappel: Faire le ménage',
      message: 'N\'oubliez pas de nettoyer l\'appartement aujourd\'hui',
      date: new Date(),
      category: 'reminder',
      actions: ['Terminer', 'Reporter', 'Détails'],
      data: {
        eventType: 'housekeeping',
        priority: 'medium'
      }
    });
  };
  
  // Test de notification personnalisée avec icône et couleur
  const testCustomNotification = () => {
    console.log("Test de notification personnalisée...");
    
    try {
      // Utiliser directement PushNotification pour plus de fiabilité
      PushNotification.localNotification({
        channelId: 'events-channel',
        title: '🌟 Notification Personnalisée',
        message: 'Cette notification utilise le canal événements',
        importance: "high",
        priority: "high",
        vibrate: true,
        vibration: 300,
        playSound: true,
        soundName: 'default',
      });
      
      console.log("Notification personnalisée envoyée directement via PushNotification");
    } catch (error) {
      console.error("Erreur avec notification personnalisée directe:", error);
      
      // Essayer via SimpleNotification comme fallback
      SimpleNotification.showReminder({
        title: '🌟 Notification Personnalisée (fallback)',
        message: 'Cette notification est envoyée via le système de secours'
      });
    }
  };
  
  // Test de notification avancée avec liste cochable
  const testAdvancedNotification = async () => {
    console.log("Test de notification avancée avec liste cochable...");
    setAdvancedTesting(true);
    
    try {
      // Exemple de liste de tâches à cocher
      const items = [
        { text: "Nettoyer la cuisine", checked: false },
        { text: "Laver le linge", checked: true },
        { text: "Faire les courses", checked: false },
        { text: "Nettoyer la litière des chats", checked: false },
        { text: "Ranger le salon", checked: true }
      ];
      
      // Afficher la notification avec liste cochable
      const result = await AdvancedNotification.showChecklistNotification(
        "📋 Liste de tâches",
        "Voici vos tâches ménagères du jour",
        items
      );
      
      console.log("Notification avec liste cochable envoyée, ID:", result.id);
      
      // Afficher un message de confirmation
      Alert.alert(
        "Notification envoyée",
        "Une notification avec liste cochable a été envoyée. Vérifiez vos notifications."
      );
      
    } catch (error) {
      console.error("Erreur avec notification avancée:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer la notification avancée: ' + 
        (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setAdvancedTesting(false);
    }
  };
  
  // Fonction pour envoyer une notification personnalisée
  const sendCustomNotification = () => {
    // Cette fonction n'est plus utilisée directement
    scheduleNotification({
      id: `custom-${Date.now()}`,
      title: '🌟 Notification Personnalisée',
      message: 'Cette notification montre comment personnaliser l\'apparence et les comportements',
      date: new Date(),
      category: 'system',
      // Personnalisation supplémentaire
      autoCancel: true,
      autoCancelTime: 20, // Disparaît après 20 minutes
      data: {
        // Données personnalisées qui peuvent être utilisées dans onNotification
        screen: 'Stats',
        customId: 'demo-notification',
        importance: 'medium',
        // Vous pouvez ajouter d'autres données pertinentes ici
      }
    });
  };
  
  // Diagnostic et réparation des notifications
  const runNotificationDiagnostic = async () => {
    setDiagnosing(true);
    
    try {
      // Exécuter le diagnostic
      console.log("Lancement du diagnostic des notifications...");
      const result = await NotificationFix.diagnose();
      
      // Afficher les résultats à l'utilisateur
      Alert.alert(
        'Diagnostic terminé',
        `Vérifiez la console pour les détails.\n\nPermissions: ${result ? 'OK' : 'PROBLÈME'}`,
        [
          {
            text: 'Réinitialiser',
            onPress: async () => {
              await NotificationFix.reset();
              NotificationFix.forceDirectNotification();
              Alert.alert(
                'Réinitialisation terminée',
                'Le système de notification a été réinitialisé. Vérifiez si vous recevez la notification de test.'
              );
            }
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors du diagnostic:", error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du diagnostic');
    } finally {
      setDiagnosing(false);
    }
  };
  
  // Forcer le rafraîchissement complet des canaux de notification
  const forceChannelRefresh = () => {
    setRefreshing(true);
    
    try {
      // Exécuter la suppression et recréation des canaux
      Alert.alert(
        'Rafraîchissement des canaux',
        'Tous les canaux de notification vont être supprimés puis recréés. Cette opération peut prendre quelques secondes.',
        [
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => setRefreshing(false)
          },
          {
            text: 'Continuer',
            onPress: async () => {
              NotificationFix.forceRefresh();
              setTimeout(() => {
                setRefreshing(false);
                Alert.alert(
                  'Rafraîchissement terminé',
                  'Les canaux de notification ont été recréés. Des notifications de test ont été envoyées pour vérifier le bon fonctionnement. Vérifiez si vous les recevez.'
                );
              }, 5000);
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des canaux:", error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du rafraîchissement des canaux');
      setRefreshing(false);
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

  // Ouvrir les paramètres de notification du système
  const openNotificationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
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
          
          {/* Option de rafraîchissement du thème */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => {
              refreshTheme();
              Alert.alert(
                'Thème actualisé',
                'Le thème a été rafraîchi avec les dernières couleurs.'
              );
            }}>
            <View style={styles.settingContent}>
              <Icon name="refresh" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Rafraîchir le thème
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Notifications
          </Text>
          <View
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}>
            <View style={styles.settingContent}>
              <Icon name="bell-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Activer les notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{false: '#767577', true: theme.primary}}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={requestPermissions}>
            <View style={styles.settingContent}>
              <Icon name="bell-ring-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Demander les permissions
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testNotifications}>
            <View style={styles.settingContent}>
              <Icon name="bell-check-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Notification standard
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testInteractiveNotifications}>
            <View style={styles.settingContent}>
              <Icon name="bell-plus-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Notification interactive
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testEventReminder}>
            <View style={styles.settingContent}>
              <Icon name="calendar-clock" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Rappel d'événement
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testCustomNotification}>
            <View style={styles.settingContent}>
              <Icon name="bell-badge-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Notification personnalisée
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
          
          {/* Nouveau bouton pour notification avec liste cochable */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={testAdvancedNotification}
            disabled={advancedTesting || Platform.OS !== 'android'}>
            <View style={styles.settingContent}>
              <Icon 
                name="format-list-checks" 
                size={24} 
                color={advancedTesting || Platform.OS !== 'android' ? theme.border : theme.primary} 
              />
              <Text 
                style={[
                  styles.settingTitle, 
                  {color: advancedTesting || Platform.OS !== 'android' ? theme.border : theme.text}
                ]}
              >
                {advancedTesting 
                  ? 'Envoi en cours...' 
                  : Platform.OS !== 'android'
                    ? 'Liste cochable (Android uniquement)'
                    : 'Notification avec liste cochable'}
              </Text>
            </View>
            {advancedTesting ? (
              <Icon name="loading" size={24} color={theme.primary} />
            ) : (
              <Icon name="chevron-right" size={24} color={Platform.OS !== 'android' ? theme.border : theme.text} />
            )}
          </TouchableOpacity>
          
          {/* Nouvel élément: Diagnostic */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={runNotificationDiagnostic}
            disabled={diagnosing}>
            <View style={styles.settingContent}>
              <Icon name="tools" size={24} color={diagnosing ? theme.border : theme.primary} />
              <Text style={[styles.settingTitle, {color: diagnosing ? theme.border : theme.text}]}>
                {diagnosing ? 'Diagnostic en cours...' : 'Diagnostic et réparation'}
              </Text>
            </View>
            {diagnosing ? (
              <Icon name="loading" size={24} color={theme.primary} />
            ) : (
              <Icon name="chevron-right" size={24} color={theme.text} />
            )}
          </TouchableOpacity>
          
          {/* Nouvel élément: Rafraîchir canaux */}
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: refreshing ? theme.background : theme.danger,
                borderColor: theme.border
              },
            ]}
            onPress={forceChannelRefresh}
            disabled={refreshing}>
            <View style={styles.settingContent}>
              <Icon 
                name={refreshing ? "loading" : "restart"} 
                size={24} 
                color={refreshing ? theme.border : "#ffffff"} 
              />
              <Text style={[styles.settingTitle, {color: refreshing ? theme.border : "#ffffff"}]}>
                {refreshing ? 'Rafraîchissement en cours...' : 'Réinitialiser tous les canaux'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={openNotificationSettings}>
            <View style={styles.settingContent}>
              <Icon name="cog-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Paramètres système
              </Text>
            </View>
            <Icon name="open-in-new" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Test simple alert */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Tests de base
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => Alert.alert("Alerte basique", "Si vous voyez cette alerte, les alertes fonctionnent.")}>
            <View style={styles.settingContent}>
              <Icon name="alert-circle-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Tester les alertes basiques
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Catégories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Catégories
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={() => {
              // Cette fonctionnalité sera implémentée ultérieurement
              Alert.alert(
                'Information',
                'Fonctionnalité non disponible pour le moment',
              );
            }}>
            <View style={styles.settingContent}>
              <Icon name="tag-outline" size={24} color={theme.primary} />
              <Text style={[styles.settingTitle, {color: theme.text}]}>
                Gérer les catégories
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Données */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Données
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {backgroundColor: theme.card, borderColor: theme.border},
            ]}
            onPress={handleClearData}>
            <View style={styles.settingContent}>
              <Icon name="delete-outline" size={24} color={theme.danger} />
              <Text style={[styles.settingTitle, {color: theme.danger}]}>
                Effacer toutes les données
              </Text>
            </View>
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
