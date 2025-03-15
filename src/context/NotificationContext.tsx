import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
// Nous commenterons ces importations, car elles sont probablement la source du problème
// import PushNotification from 'react-native-push-notification';
// import PushNotificationIOS from '@react-native-community/push-notification-ios';

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
    console.log('NotificationProvider initialisé avec des fonctions factices');
    // Nous ne configurons pas les notifications pour éviter l'écran blanc
    
    // Nettoyer les timers lors du démontage
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [timers]);

  // Version factice des fonctions pour éviter les erreurs
  const scheduleNotification = ({id, title, message}: ScheduleOptions) => {
    console.log('Notification factice programmée:', {id, title, message});
    // Affichage d'une alerte au lieu d'une vraie notification
    alert(`[NOTIFICATION FACTICE]\nTitre: ${title}\nMessage: ${message}`);
  };

  // Version factice de cancelNotification
  const cancelNotification = (id: string) => {
    console.log('Annulation factice de notification:', id);
    
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

  // Version factice de cancelAllNotifications
  const cancelAllNotifications = () => {
    console.log('Annulation factice de toutes les notifications');
    
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
