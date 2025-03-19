import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification, { Importance } from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import firebaseService from './firebaseService';
import { NotificationOptions, NotificationChannel, InteractiveNotificationOptions, NotificationPreferences } from '../models/Notification';

// Clé pour stocker les préférences de notification
const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

// Préférences par défaut
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  categories: {
    default: { enabled: true, sound: true, vibration: true },
    reminder: { enabled: true, sound: true, vibration: true },
    system: { enabled: true, sound: true, vibration: true },
    interactive: { enabled: true, sound: true, vibration: true },
    sport: { enabled: true, sound: true, vibration: true },
    meal: { enabled: true, sound: true, vibration: true },
    housework: { enabled: true, sound: true, vibration: true },
  },
  reminderDelay: 15, // 15 minutes
};

/**
 * NotificationService - Service pour gérer les notifications dans l'application
 * Combine Firebase Cloud Messaging avec les notifications locales via PushNotification
 */
class NotificationService {
  private static instance: NotificationService;
  private _isInitialized: boolean = false;
  private _hasPermission: boolean = false;
  private _timers: { [key: string]: NodeJS.Timeout } = {};
  private _preferences: NotificationPreferences = DEFAULT_PREFERENCES;

  /**
   * Obtenir l'instance unique du service (pattern Singleton)
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialiser le service de notification
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('Initialisation du service de notification...');
      
      if (this._isInitialized) {
        console.log('Service de notification déjà initialisé');
        return true;
      }

      // 1. Charger les préférences de notification
      await this._loadPreferences();

      // 2. Initialiser Firebase
      const firebaseInitialized = await firebaseService.initialize();
      if (!firebaseInitialized) {
        console.log('Échec de l\'initialisation de Firebase');
      }

      // 3. Configurer les canaux de notification (Android uniquement)
      if (Platform.OS === 'android') {
        await this._createNotificationChannels();
      }

      // 4. Vérifier l'état des permissions
      this._hasPermission = await this.checkPermissions();

      // 5. Configurer les gestionnaires d'événements pour PushNotification
      this._configurePushNotification();

      this._isInitialized = true;
      console.log('Service de notification initialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service de notification:', error);
      return false;
    }
  }

  /**
   * Configurer PushNotification
   */
  private _configurePushNotification(): void {
    PushNotification.configure({
      // Callback lorsqu'un token est généré
      onRegister: (token) => {
        console.log('TOKEN PushNotification:', token);
      },
      
      // Callback lors de la réception d'une notification
      onNotification: (notification) => {
        console.log('NOTIFICATION REÇUE:', notification);
        
        // Gérer les actions de notification
        const actionId = notification.action;
        if (actionId) {
          console.log('Action sélectionnée:', actionId);
          this._handleNotificationAction(actionId, notification);
        }
        
        // Terminer le traitement (requis pour iOS)
        if (notification.finish) {
          notification.finish();
        }
      },
      
      // Callback lors d'une action sans ouvrir l'application
      onAction: (notification) => {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },
      
      // Callback en cas d'erreur d'enregistrement
      onRegistrationError: (err) => {
        console.error('Erreur d\'enregistrement des notifications:', err.message, err);
      },
      
      // iOS uniquement
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      
      popInitialNotification: true,
      requestPermissions: false,
    });
  }

  /**
   * Gérer les actions de notification
   */
  private _handleNotificationAction(action: string, notification: any): void {
    // Récupérer les données associées à la notification
    const data = notification.data || {};
    
    switch (action) {
      case 'complete':
      case 'Terminer':
        // Logique pour marquer un événement comme terminé
        if (data.eventId) {
          console.log(`Marquer l'événement ${data.eventId} comme terminé`);
          // Ici, nous devrions appeler un service pour mettre à jour l'événement
        }
        break;
        
      case 'postpone':
      case 'Reporter':
        // Logique pour reporter un événement
        if (data.eventId) {
          console.log(`Reporter l'événement ${data.eventId}`);
          // Ici, nous devrions reprogrammer l'événement
        }
        break;
        
      case 'details':
      case 'Détails':
        // Logique pour afficher les détails d'un événement
        if (data.eventId) {
          console.log(`Afficher les détails de l'événement ${data.eventId}`);
          // Ici, nous devrions naviguer vers l'écran de détails
        }
        break;
        
      default:
        console.log('Action non reconnue:', action);
    }
  }

  /**
   * Créer les canaux de notification pour Android
   */
  private async _createNotificationChannels(): Promise<void> {
    console.log('Création des canaux de notification Android...');
    
    try {
      // Canal pour les événements réguliers
      PushNotification.createChannel(
        {
          channelId: NotificationChannel.EVENTS,
          channelName: 'Événements',
          channelDescription: 'Notifications pour les événements du calendrier',
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Canal d'événements créé: ${created}`)
      );

      // Canal pour les rappels d'événements importants
      PushNotification.createChannel(
        {
          channelId: NotificationChannel.REMINDERS,
          channelName: 'Rappels',
          channelDescription: 'Rappels pour les événements importants',
          soundName: 'default',
          importance: Importance.MAX,
          vibrate: true,
          actions: ['Terminer', 'Reporter', 'Détails'],
        },
        (created) => console.log(`Canal de rappels créé: ${created}`)
      );

      // Canal pour les notifications système
      PushNotification.createChannel(
        {
          channelId: NotificationChannel.SYSTEM,
          channelName: 'Système',
          channelDescription: 'Notifications système de l\'application',
          soundName: 'default',
          importance: Importance.DEFAULT,
          vibrate: true,
        },
        (created) => console.log(`Canal système créé: ${created}`)
      );
      
      // Canal pour les notifications interactives
      PushNotification.createChannel(
        {
          channelId: NotificationChannel.INTERACTIVE,
          channelName: 'Notifications Interactives',
          channelDescription: 'Notifications avec boutons d\'action',
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
          actions: ['Accepter', 'Refuser', 'Plus tard'],
        },
        (created) => console.log(`Canal interactif créé: ${created}`)
      );
    } catch (error) {
      console.error('Erreur lors de la création des canaux de notification:', error);
      throw error;
    }
  }

  /**
   * Charger les préférences de notification
   */
  private async _loadPreferences(): Promise<void> {
    try {
      const storedPreferences = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      if (storedPreferences) {
        this._preferences = JSON.parse(storedPreferences);
      } else {
        // Si aucune préférence n'est trouvée, utiliser les valeurs par défaut et les sauvegarder
        await this._savePreferences();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences de notification:', error);
      // En cas d'erreur, utiliser les valeurs par défaut
      this._preferences = DEFAULT_PREFERENCES;
    }
  }

  /**
   * Sauvegarder les préférences de notification
   */
  private async _savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_PREFERENCES_KEY,
        JSON.stringify(this._preferences)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences de notification:', error);
    }
  }

  /**
   * Vérifier si l'application a la permission d'envoyer des notifications
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      // Vérifier les permissions via Firebase
      const firebasePermission = await firebaseService.checkPermissions();
      return firebasePermission;
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions de notification:', error);
      return false;
    }
  }

  /**
   * Demander la permission d'envoyer des notifications
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      // Demander les permissions via Firebase
      const granted = await firebaseService.requestPermissions();
      if (granted) {
        this._hasPermission = true;
      }
      return granted;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions de notification:', error);
      return false;
    }
  }

  /**
   * Planifier une notification
   */
  public async scheduleNotification(options: NotificationOptions): Promise<boolean> {
    console.log(`Programmation de notification: ID=${options.id}, Titre=${options.title}`);
    
    try {
      // 1. Vérifier si les notifications sont activées pour cette catégorie
      const category = options.category || 'default';
      if (!this._preferences.enabled || !this._preferences.categories[category]?.enabled) {
        console.log(`Notifications désactivées pour la catégorie: ${category}`);
        return false;
      }

      // 2. Vérifier si nous avons la permission d'envoyer des notifications
      if (!this._hasPermission) {
        console.warn('Tentative de programmer une notification sans permission');
        return false;
      }

      // 3. Annuler toute notification existante avec le même ID
      this.cancelNotification(options.id);

      // 4. Déterminer le canal à utiliser (Android uniquement)
      let channelId = NotificationChannel.EVENTS;
      if (category === 'reminder') {
        channelId = NotificationChannel.REMINDERS;
      } else if (category === 'system') {
        channelId = NotificationChannel.SYSTEM;
      } else if (category === 'interactive') {
        channelId = NotificationChannel.INTERACTIVE;
      }
      
      // 5. Vérifier si c'est une notification immédiate ou programmée
      const now = new Date();
      const isImmediate = options.date.getTime() - now.getTime() < 3000; // Moins de 3 secondes
      
      if (isImmediate) {
        // Notification immédiate
        PushNotification.localNotification({
          id: options.id,
          channelId: channelId,
          title: options.title,
          message: options.message,
          playSound: this._preferences.categories[category]?.sound || true,
          soundName: 'default',
          actions: options.actions?.length ? options.actions : undefined,
          userInfo: {
            category,
            ...options.data,
          },
          importance: "high",
          priority: "high",
          vibrate: this._preferences.categories[category]?.vibration || true,
          vibration: 300,
        });
      } else {
        // Notification programmée
        PushNotification.localNotificationSchedule({
          id: options.id,
          channelId: channelId,
          title: options.title,
          message: options.message,
          date: options.date,
          allowWhileIdle: true,
          playSound: this._preferences.categories[category]?.sound || true,
          soundName: 'default',
          actions: options.actions?.length ? options.actions : undefined,
          userInfo: {
            category,
            ...options.data,
          },
          importance: "high",
          priority: "high",
          vibrate: this._preferences.categories[category]?.vibration || true,
          vibration: 300,
        });
      }

      console.log(`Notification ${isImmediate ? 'envoyée' : 'programmée'}: ${options.id}`);

      // 6. Si autoCancel est activé, planifier l'annulation automatique
      if (options.autoCancel) {
        const autoCancelTime = options.autoCancelTime || this._preferences.reminderDelay;
        const cancelTime = new Date(options.date.getTime() + autoCancelTime * 60000);
        const timeUntilCancel = cancelTime.getTime() - now.getTime();

        if (timeUntilCancel > 0) {
          // Nettoyer tout timer existant pour cet ID
          if (this._timers[options.id]) {
            clearTimeout(this._timers[options.id]);
          }

          // Créer un nouveau timer
          this._timers[options.id] = setTimeout(() => {
            this.cancelNotification(options.id);
            // Nettoyer le timer de la liste
            delete this._timers[options.id];
          }, timeUntilCancel);
        }
      }

      // 7. Tenter d'envoyer également via Firebase (pour le cloud messaging)
      if (firebaseService && await firebaseService.getToken()) {
        try {
          // Envoyer une notification via Firebase si possible
          // Note: Cela nécessiterait généralement un serveur, 
          // mais nous pouvons essayer d'utiliser les méthodes locales
          await firebaseService.sendLocalNotification({
            title: options.title,
            body: options.message,
            data: {
              id: options.id,
              category,
              ...options.data,
            },
          });
        } catch (firebaseError) {
          // Ne pas échouer si Firebase échoue, les notifications locales fonctionneront toujours
          console.warn('Échec de l\'envoi de notification via Firebase:', firebaseError);
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la programmation de notification:', error);
      return false;
    }
  }

  /**
   * Planifier une notification interactive avec boutons d'action
   */
  public async scheduleInteractiveNotification(options: InteractiveNotificationOptions): Promise<boolean> {
    return this.scheduleNotification({
      ...options,
      category: 'interactive',
    });
  }

  /**
   * Annuler une notification spécifique
   */
  public cancelNotification(id: string): void {
    console.log(`Annulation de la notification: ${id}`);
    
    try {
      PushNotification.cancelLocalNotification(id);
    } catch (error) {
      console.error(`Erreur lors de l'annulation de la notification ${id}:`, error);
    }
    
    // Nettoyer le timer associé s'il existe
    if (this._timers[id]) {
      clearTimeout(this._timers[id]);
      delete this._timers[id];
    }
  }

  /**
   * Annuler toutes les notifications
   */
  public cancelAllNotifications(): void {
    console.log('Annulation de toutes les notifications');
    
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de toutes les notifications:', error);
    }
    
    // Nettoyer tous les timers
    Object.keys(this._timers).forEach(id => {
      clearTimeout(this._timers[id]);
      delete this._timers[id];
    });
  }

  /**
   * Mettre à jour les préférences de notification
   */
  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      // Mettre à jour les préférences
      this._preferences = {
        ...this._preferences,
        ...preferences,
        // Fusion des catégories
        categories: {
          ...this._preferences.categories,
          ...(preferences.categories || {}),
        },
      };
      
      // Sauvegarder les préférences mises à jour
      await this._savePreferences();
      
      console.log('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de notification:', error);
    }
  }

  /**
   * Obtenir les préférences de notification actuelles
   */
  public getPreferences(): NotificationPreferences {
    return { ...this._preferences };
  }

  /**
   * Vérifier si les notifications sont activées pour une catégorie spécifique
   */
  public isEnabledForCategory(category: string): boolean {
    return (
      this._preferences.enabled &&
      !!this._preferences.categories[category]?.enabled
    );
  }

  /**
   * Ajouter un écouteur pour les notifications Firebase
   */
  public addFirebaseListener(callback: (message: any) => void): () => void {
    return firebaseService.addOnMessageListener(callback);
  }

  /**
   * S'abonner à un sujet de notification (pour les notifications par sujet)
   */
  public async subscribeToTopic(topic: string): Promise<void> {
    await firebaseService.subscribeToTopic(topic);
  }

  /**
   * Se désabonner d'un sujet de notification
   */
  public async unsubscribeFromTopic(topic: string): Promise<void> {
    await firebaseService.unsubscribeFromTopic(topic);
  }
}

// Exporter l'instance unique
export default NotificationService.getInstance();
