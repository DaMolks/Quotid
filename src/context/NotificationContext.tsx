import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';

// Structure pour les options de notification planifiée
interface ScheduleOptions {
  id: string;
  title: string;
  message: string;
  date: Date;
  category?: string;
  data?: any;
  autoCancel?: boolean;
  autoCancelTime?: number; // Temps en minutes après lequel la notification disparaît automatiquement
  actions?: string[]; // Boutons d'action pour les notifications interactives
}

// Interface pour le contexte de notification
interface NotificationContextType {
  scheduleNotification: (options: ScheduleOptions) => void;
  scheduleInteractiveNotification: (options: ScheduleOptions & { actions: string[] }) => void;
  cancelNotification: (id: string) => void;
  cancelAllNotifications: () => void;
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
}

// Création du contexte avec une valeur par défaut undefined
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Hook pour utiliser le contexte de notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

// Props pour le provider
interface NotificationProviderProps {
  children: ReactNode;
}

// Composant Provider
export const NotificationProvider = ({children}: NotificationProviderProps) => {
  // États
  const [hasPermission, setHasPermission] = useState(false);
  const [timers, setTimers] = useState<{[key: string]: NodeJS.Timeout}>({});
  const [channelsCreated, setChannelsCreated] = useState(false);

  // Initialisation de PushNotification à la création du composant
  useEffect(() => {
    console.log('Initialisation du système de notification...');
    
    try {
      // Configuration générale des notifications
      PushNotification.configure({
        // Called when Token is generated
        onRegister: function (token) {
          console.log('TOKEN:', token);
        },
        
        // Called when a notification is received/opened
        onNotification: function (notification) {
          console.log('NOTIFICATION REÇUE:', notification);
          
          // Process the notification action
          const actionId = notification.action;
          if (actionId) {
            console.log('Action sélectionnée:', actionId);
            
            // Handle specific actions
            switch(actionId) {
              case 'complete':
                console.log('Marquer comme terminé');
                Alert.alert('Événement terminé', 'L\'événement a été marqué comme terminé');
                break;
              case 'postpone':
                console.log('Reporter l\'événement');
                Alert.alert('Événement reporté', 'L\'événement a été reporté de 30 minutes');
                break;
              case 'details':
                console.log('Voir les détails');
                Alert.alert('Détails', 'Affichage des détails de l\'événement');
                break;
              default:
                console.log('Action non reconnue');
            }
          }
          
          // Finish processing (required for iOS)
          if (notification.finish) {
            notification.finish();
          }
        },
        
        // Called when Action is pressed and invokeApp is false
        onAction: function (notification) {
          console.log('ACTION:', notification.action);
          console.log('NOTIFICATION:', notification);
        },
        
        // Called when registration fails
        onRegistrationError: function(err) {
          console.error('Erreur d\'enregistrement des notifications:', err.message, err);
        },
        
        // IOS ONLY
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        
        popInitialNotification: true,
        requestPermissions: false,
      });
      
      console.log('PushNotification configuré avec succès');
      
      // Créer les canaux de notification
      createNotificationChannels();
      
      // Vérifier l'état des permissions
      checkPermissions();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
    
    // Nettoyer les ressources lors du démontage
    return () => {
      console.log('Nettoyage des timers de notification');
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Création des canaux de notification (Android uniquement)
  const createNotificationChannels = () => {
    if (Platform.OS === 'android') {
      console.log('Création des canaux de notification Android...');
      
      try {
        // Canal principal pour les événements réguliers
        PushNotification.createChannel(
          {
            channelId: 'events-channel',
            channelName: 'Événements',
            channelDescription: 'Notifications pour les événements du calendrier',
            soundName: 'default',
            importance: Importance.HIGH,
            vibrate: true,
          },
          (created) => {
            console.log(`Canal d'événements créé: ${created}`);
          },
        );

        // Canal pour les rappels d'événements importants avec actions
        PushNotification.createChannel(
          {
            channelId: 'reminders-channel',
            channelName: 'Rappels',
            channelDescription: 'Rappels pour les événements importants',
            soundName: 'default',
            importance: Importance.MAX,
            vibrate: true,
            // Actions possibles pour ce canal
            actions: ["Terminer", "Reporter", "Détails"],
          },
          (created) => {
            console.log(`Canal de rappels créé: ${created}`);
          },
        );

        // Canal pour les notifications système
        PushNotification.createChannel(
          {
            channelId: 'system-channel',
            channelName: 'Système',
            channelDescription: 'Notifications système de l\'application',
            soundName: 'default',
            importance: Importance.DEFAULT,
            vibrate: true,
          },
          (created) => {
            console.log(`Canal système créé: ${created}`);
            setChannelsCreated(true);
          },
        );
        
        // Canal pour les notifications interactives
        PushNotification.createChannel(
          {
            channelId: 'interactive-channel',
            channelName: 'Notifications Interactives',
            channelDescription: 'Notifications avec boutons d\'action',
            soundName: 'default',
            importance: Importance.HIGH,
            vibrate: true,
            actions: ["Accepter", "Refuser", "Plus tard"],
          },
          (created) => {
            console.log(`Canal interactif créé: ${created}`);
          }
        );
      } catch (error) {
        console.error('Erreur lors de la création des canaux de notification:', error);
      }
    } else {
      // Sur iOS, pas besoin de canaux
      setChannelsCreated(true);
    }
  };

  // Vérifier si l'application a les permissions de notification
  const checkPermissions = async () => {
    console.log(`Vérification des permissions de notification sur ${Platform.OS}...`);
    
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) { // Android 13+
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          console.log('Android notification permission:', granted);
          setHasPermission(granted);
          return granted;
        } else {
          // Pour les anciennes versions d'Android, les permissions sont implicites
          console.log('Android < 13, permissions considérées comme accordées');
          setHasPermission(true);
          return true;
        }
      } catch (err) {
        console.warn('Échec de la vérification des permissions de notification:', err);
        setHasPermission(false);
        return false;
      }
    } else {
      // Sur iOS, nous devons faire confiance au système
      console.log('iOS: suppose que les permissions sont accordées');
      setHasPermission(true);
      return true;
    }
  };

  // Demander les permissions de notification
  const requestPermissions = async () => {
    console.log(`Demande de permissions de notification sur ${Platform.OS}...`);
    
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) { // Android 13 (API 33) et plus
          console.log('Demande de permission POST_NOTIFICATIONS pour Android 13+');
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Permissions de notification',
              message: 'Quotid a besoin d\'envoyer des notifications pour vous rappeler vos événements',
              buttonNeutral: 'Demander plus tard',
              buttonNegative: 'Annuler',
              buttonPositive: 'OK',
            },
          );
          const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
          console.log('Permission accordée:', permissionGranted);
          setHasPermission(permissionGranted);
          return permissionGranted;
        } else {
          // Pour les anciennes versions d'Android, les permissions ne sont pas nécessaires
          console.log('Android < 13, permissions considérées comme accordées');
          setHasPermission(true);
          return true;
        }
      } else if (Platform.OS === 'ios') {
        // Pour iOS, utiliser la méthode de react-native-push-notification
        console.log('Demande de permissions iOS via PushNotification.requestPermissions');
        const permission = await PushNotification.requestPermissions();
        const permissionGranted = permission?.alert || false;
        console.log('iOS permissions:', permission, 'accordé:', permissionGranted);
        setHasPermission(permissionGranted);
        return permissionGranted;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      Alert.alert(
        'Erreur',
        'Impossible de demander les permissions de notification. Veuillez les activer manuellement dans les paramètres.',
      );
      return false;
    }
  };

  // Planifier une notification
  const scheduleNotification = ({
    id,
    title,
    message,
    date,
    category = 'default',
    data = {},
    autoCancel = true,
    autoCancelTime = 30,
    actions = [],
  }: ScheduleOptions) => {
    console.log(`Programmation de notification: ID=${id}, Titre=${title}, Date=${date.toISOString()}`);
    
    // Approche directe qui fonctionne
    try {
      // Vérifier si les permissions sont accordées
      if (!hasPermission) {
        console.warn('Tentative de programmer une notification sans permission');
        Alert.alert(
          'Permissions requises',
          'Les notifications ne peuvent pas être programmées sans votre autorisation.',
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Autoriser',
              onPress: requestPermissions,
            },
          ],
        );
        return;
      }

      // Annuler toute notification existante avec le même ID
      cancelNotification(id);

      // Déterminer le canal à utiliser (Android uniquement)
      let channelId = 'events-channel';
      if (category === 'reminder') {
        channelId = 'reminders-channel';
      } else if (category === 'system') {
        channelId = 'system-channel';
      } else if (category === 'interactive') {
        channelId = 'interactive-channel';
      }
      
      // Pour les notifications immédiates ou très proches
      const now = new Date();
      const isImmediate = date.getTime() - now.getTime() < 3000; // Moins de 3 secondes
      
      if (isImmediate) {
        console.log('Envoi de notification immédiate (< 3s)');
        
        // Notification locale immédiate - approche directe
        PushNotification.localNotification({
          id: id,
          channelId: channelId,
          title: title,
          message: message,
          playSound: true,
          soundName: 'default',
          actions: actions.length > 0 ? actions : undefined,
          // Données spécifiques
          userInfo: {
            category: category,
            ...data,
          },
          // Importance et priorité élevées
          importance: "high",
          priority: "high",
          // Vibrations
          vibrate: true,
          vibration: 300,
        });
      } else {
        // Notification planifiée - approche directe
        console.log('Programmation de notification pour plus tard');
        
        PushNotification.localNotificationSchedule({
          id: id,
          channelId: channelId,
          title: title,
          message: message,
          date: date,
          allowWhileIdle: true, // Fonctionnera même si l'appareil est en mode économie d'énergie
          playSound: true,
          soundName: 'default',
          actions: actions.length > 0 ? actions : undefined,
          // Données spécifiques
          userInfo: {
            category: category,
            ...data,
          },
          // Importance et priorité élevées
          importance: "high",
          priority: "high",
          // Vibrations
          vibrate: true,
          vibration: 300,
        });
      }

      console.log(`Notification ${isImmediate ? 'envoyée' : 'programmée'}: ${id} - ${title} - ${date.toLocaleString()}`);

      // Si autoCancel est activé, planifier l'annulation automatique
      if (autoCancel) {
        // Calcul du temps d'annulation (temps de l'événement + temps d'auto-annulation)
        const cancelTime = new Date(date.getTime() + autoCancelTime * 60000);
        const timeUntilCancel = cancelTime.getTime() - now.getTime();

        // Si le temps d'annulation est dans le futur
        if (timeUntilCancel > 0) {
          // Nettoyer tout timer existant pour cet ID
          if (timers[id]) {
            clearTimeout(timers[id]);
          }

          // Créer un nouveau timer
          const timerId = setTimeout(() => {
            cancelNotification(id);
            // Nettoyer le timer de la liste
            setTimers(prev => {
              const newTimers = {...prev};
              delete newTimers[id];
              return newTimers;
            });
          }, timeUntilCancel);

          // Stocker le timer
          setTimers(prev => ({
            ...prev,
            [id]: timerId,
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la programmation de notification:', error);
      Alert.alert(
        'Erreur',
        `Impossible de programmer la notification: ${error}`
      );
    }
  };
  
  // Planifier une notification interactive avec boutons d'action
  const scheduleInteractiveNotification = (options: ScheduleOptions & { actions: string[] }) => {
    // Utiliser la même fonction mais s'assurer que la catégorie est bien 'interactive'
    scheduleNotification({
      ...options,
      category: 'interactive',
    });
  };

  // Annuler une notification spécifique
  const cancelNotification = (id: string) => {
    console.log(`Annulation de la notification: ${id}`);
    
    try {
      PushNotification.cancelLocalNotification(id);
    } catch (error) {
      console.error(`Erreur lors de l'annulation de la notification ${id}:`, error);
    }
    
    // Nettoyer le timer associé s'il existe
    if (timers[id]) {
      clearTimeout(timers[id]);
      setTimers(prev => {
        const newTimers = {...prev};
        delete newTimers[id];
        return newTimers;
      });
    }
  };

  // Annuler toutes les notifications
  const cancelAllNotifications = () => {
    console.log('Annulation de toutes les notifications');
    
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de toutes les notifications:', error);
    }
    
    // Nettoyer tous les timers
    Object.values(timers).forEach(timer => clearTimeout(timer));
    setTimers({});
  };

  // Fournir le contexte aux composants enfants
  return (
    <NotificationContext.Provider
      value={{
        scheduleNotification,
        scheduleInteractiveNotification,
        cancelNotification,
        cancelAllNotifications,
        requestPermissions,
        hasPermission,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
