import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import PushNotification from 'react-native-push-notification';
// Importation conditionnelle pour éviter les problèmes
let PushNotificationIOS: any;
try {
  PushNotificationIOS = require('@react-native-community/push-notification-ios');
} catch (error) {
  console.log('PushNotificationIOS could not be imported', error);
  // Fallback ou placeholder pour PushNotificationIOS
  PushNotificationIOS = {
    FetchResult: {
      NoData: 'NoData',
      NewData: 'NewData',
      Failed: 'Failed',
    },
  };
}

interface NotificationContextType {
  scheduleNotification: (options: ScheduleOptions) => void;
  cancelNotification: (id: string) => void;
  cancelAllNotifications: () => void;
  requestPermissions: () => void;
}

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

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({children}: NotificationProviderProps) => {
  // Timer IDs pour l'auto-annulation des notifications
  const [timers, setTimers] = useState<{[key: string]: NodeJS.Timeout}>({});
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    try {
      // Configuration des notifications
      PushNotification.configure({
        onRegister: function (token) {
          console.log('TOKEN:', token);
        },
        onNotification: function (notification) {
          console.log('NOTIFICATION:', notification);
          if (notification.finish) {
            // Uniquement appeler finish si la méthode existe
            notification.finish(PushNotificationIOS.FetchResult.NoData);
          }
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: false, // Nous demanderons les permissions manuellement
      });

      // Création des canaux de notification (Android)
      PushNotification.createChannel(
        {
          channelId: 'default-channel',
          channelName: 'Default Channel',
          channelDescription: 'A default channel for notifications',
          soundName: 'default',
          importance: 4, // Importance max
          vibrate: true,
        },
        (created) => {
          console.log(`Channel created: ${created}`);
          setIsConfigured(true);
        },
      );
    } catch (error) {
      console.error('Error configuring notifications:', error);
      // En cas d'erreur, nous utiliserons des notifications factices
      setIsConfigured(false);
    }

    // Nettoyer les timers lors du démontage
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Fonction pour demander les permissions
  const requestPermissions = () => {
    try {
      if (isConfigured) {
        PushNotification.requestPermissions();
      } else {
        // Utiliser une alerte pour simuler la demande de permission
        alert('Simulation de demande de permission pour les notifications');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      alert('Impossible de demander les permissions de notification');
    }
  };

  // Planifier une notification
  const scheduleNotification = ({id, title, message, date, category = 'default', data = {}, autoCancel = true, autoCancelTime = 30}: ScheduleOptions) => {
    // Annuler toute notification existante avec le même ID
    cancelNotification(id);
    
    try {
      if (isConfigured) {
        // Vraie notification
        PushNotification.localNotificationSchedule({
          id,
          title,
          message,
          date,
          channelId: 'default-channel',
          soundName: 'default',
          userInfo: {
            ...data,
            category,
          },
          allowWhileIdle: true,
        });
      } else {
        // Notification factice (alerte)
        const timeUntilNotification = date.getTime() - Date.now();
        if (timeUntilNotification > 0) {
          setTimeout(() => {
            alert(`[NOTIFICATION]\nTitre: ${title}\nMessage: ${message}`);
          }, timeUntilNotification);
        } else {
          alert(`[NOTIFICATION]\nTitre: ${title}\nMessage: ${message}`);
        }
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      // Fallback à une alerte simple
      alert(`Erreur lors de la programmation de la notification. Détails: ${title} - ${message}`);
    }

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
    try {
      if (isConfigured) {
        PushNotification.cancelLocalNotification(id);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
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
    try {
      if (isConfigured) {
        PushNotification.cancelAllLocalNotifications();
      }
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
    
    // Nettoyer tous les timers
    Object.values(timers).forEach(timer => clearTimeout(timer));
    setTimers({});
  };

  return (
    <NotificationContext.Provider
      value={{
        scheduleNotification,
        cancelNotification,
        cancelAllNotifications,
        requestPermissions,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
