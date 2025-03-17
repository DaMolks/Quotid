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
}

// Interface pour le contexte de notification
interface NotificationContextType {
  scheduleNotification: (options: ScheduleOptions) => void;
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

  // Création des canaux de notification (Android uniquement)
  const createNotificationChannels = () => {
    if (Platform.OS === 'android') {
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

      // Canal pour les rappels d'événements importants
      PushNotification.createChannel(
        {
          channelId: 'reminders-channel',
          channelName: 'Rappels',
          channelDescription: 'Rappels pour les événements importants',
          soundName: 'default',
          importance: Importance.MAX,
          vibrate: true,
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
          vibrate: false,
        },
        (created) => {
          console.log(`Canal système créé: ${created}`);
          setChannelsCreated(true);
        },
      );
    } else {
      // Sur iOS, pas besoin de canaux
      setChannelsCreated(true);
    }
  };

  // Configuration initiale des notifications
  useEffect(() => {
    // Configuration générale des notifications
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Traitement spécifique selon le type de notification
        if (notification.userInfo && notification.userInfo.category) {
          // Logique spécifique à la catégorie...
        }
        
        // iOS requirement
        if (Platform.OS === 'ios' && notification.finish) {
          notification.finish('backgroundFetchResultNoData');
        }
      },

      // Permissions iOS (Android utilise PermissionsAndroid)
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Ne pas demander les permissions automatiquement
      requestPermissions: false,
      
      // Afficher la notification initiale si l'application est lancée par une notification
      popInitialNotification: true,
    });

    // Créer les canaux de notification
    createNotificationChannels();

    // Vérifier l'état des permissions
    checkPermissions();

    // Nettoyer les ressources à la désinscription
    return () => {
      // Nettoyer tous les timers
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Vérifier si l'application a les permissions de notification
  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        console.log('Android notification permission:', granted);
        setHasPermission(granted);
        return granted;
      } catch (err) {
        console.warn('Failed to check notification permission:', err);
        setHasPermission(false);
        return false;
      }
    } else {
      // Sur iOS, c'est plus complexe à vérifier, nous supposons que l'utilisateur a accordé les permissions
      setHasPermission(true);
      return true;
    }
  };

  // Demander les permissions de notification
  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) { // Android 13 (API 33) et plus
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
          setHasPermission(permissionGranted);
          return permissionGranted;
        } else {
          // Pour les anciennes versions d'Android, les permissions ne sont pas nécessaires
          setHasPermission(true);
          return true;
        }
      } else if (Platform.OS === 'ios') {
        // Pour iOS, utiliser la méthode de react-native-push-notification
        const permission = await PushNotification.requestPermissions();
        const permissionGranted = permission?.alert || false;
        setHasPermission(permissionGranted);
        return permissionGranted;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
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
  }: ScheduleOptions) => {
    // Vérifier si les permissions sont accordées
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
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
    }

    // Planifier la notification
    PushNotification.localNotificationSchedule({
      id: id,
      channelId: channelId,
      title: title,
      message: message,
      date: date,
      allowWhileIdle: true, // Fonctionnera même si l'appareil est en mode économie d'énergie
      userInfo: {
        category: category,
        ...data,
      },
    });

    console.log(`Notification programmée: ${id} - ${title} - ${date.toLocaleString()}`);

    // Si autoCancel est activé, planifier l'annulation automatique
    if (autoCancel) {
      // Calcul du temps d'annulation (temps de l'événement + temps d'auto-annulation)
      const cancelTime = new Date(date.getTime() + autoCancelTime * 60000);
      const timeUntilCancel = cancelTime.getTime() - Date.now();

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
  };

  // Annuler une notification spécifique
  const cancelNotification = (id: string) => {
    PushNotification.cancelLocalNotification(id);
    console.log(`Notification annulée: ${id}`);

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
    PushNotification.cancelAllLocalNotifications();
    console.log('Toutes les notifications ont été annulées');

    // Nettoyer tous les timers
    Object.values(timers).forEach(timer => clearTimeout(timer));
    setTimers({});
  };

  // Fournir le contexte aux composants enfants
  return (
    <NotificationContext.Provider
      value={{
        scheduleNotification,
        cancelNotification,
        cancelAllNotifications,
        requestPermissions,
        hasPermission,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
