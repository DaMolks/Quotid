import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

interface NotificationContextType {
  scheduleNotification: (options: ScheduleOptions) => void;
  cancelNotification: (id: string) => void;
  cancelAllNotifications: () => void;
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

  useEffect(() => {
    // Configuration des notifications
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
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
      (created) => console.log(`Channel created: ${created}`),
    );

    // Nettoyer les timers lors du démontage
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [timers]);

  // Planifier une notification
  const scheduleNotification = ({id, title, message, date, category = 'default', data = {}, autoCancel = true, autoCancelTime = 30}: ScheduleOptions) => {
    // Annuler toute notification existante avec le même ID
    cancelNotification(id);

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
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
