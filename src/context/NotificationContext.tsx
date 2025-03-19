import React, {createContext, useState, useEffect, useContext, ReactNode} from 'react';
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import notificationService from '../services/notificationService';
import { NotificationOptions, InteractiveNotificationOptions, NotificationPreferences } from '../models/Notification';

// Interface pour le contexte de notification
interface NotificationContextType {
  scheduleNotification: (options: NotificationOptions) => Promise<boolean>;
  scheduleInteractiveNotification: (options: InteractiveNotificationOptions) => Promise<boolean>;
  cancelNotification: (id: string) => void;
  cancelAllNotifications: () => void;
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  preferences: NotificationPreferences;
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
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialisation du service de notification
  useEffect(() => {
    const initNotifications = async () => {
      try {
        console.log('Initialisation du contexte de notification...');
        
        // Initialiser le service de notification
        const initialized = await notificationService.initialize();
        
        // Vérifier les permissions
        const permission = await notificationService.checkPermissions();
        setHasPermission(permission);
        
        // Mettre à jour les préférences
        setPreferences(notificationService.getPreferences());
        
        setIsInitialized(initialized);
        
        console.log(`Contexte de notification initialisé: ${initialized ? 'succès' : 'échec'}`);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du contexte de notification:', error);
        Alert.alert(
          'Erreur de notification',
          'Une erreur est survenue lors de l\'initialisation des notifications. Certaines fonctionnalités peuvent ne pas fonctionner correctement.'
        );
      }
    };
    
    initNotifications();
    
    // Fonction de nettoyage
    return () => {
      console.log('Nettoyage du contexte de notification');
    };
  }, []);

  // Demander les permissions de notification
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Erreur lors de la demande de permissions de notification:', error);
      return false;
    }
  };

  // Planifier une notification
  const scheduleNotification = async (options: NotificationOptions): Promise<boolean> => {
    if (!isInitialized) {
      console.warn('Tentative de programmer une notification avant l\'initialisation');
      return false;
    }
    
    try {
      return await notificationService.scheduleNotification(options);
    } catch (error) {
      console.error('Erreur lors de la programmation de notification:', error);
      return false;
    }
  };

  // Planifier une notification interactive
  const scheduleInteractiveNotification = async (
    options: InteractiveNotificationOptions
  ): Promise<boolean> => {
    if (!isInitialized) {
      console.warn('Tentative de programmer une notification interactive avant l\'initialisation');
      return false;
    }
    
    try {
      return await notificationService.scheduleInteractiveNotification(options);
    } catch (error) {
      console.error('Erreur lors de la programmation de notification interactive:', error);
      return false;
    }
  };

  // Annuler une notification
  const cancelNotification = (id: string): void => {
    if (!isInitialized) {
      console.warn('Tentative d\'annuler une notification avant l\'initialisation');
      return;
    }
    
    notificationService.cancelNotification(id);
  };

  // Annuler toutes les notifications
  const cancelAllNotifications = (): void => {
    if (!isInitialized) {
      console.warn('Tentative d\'annuler toutes les notifications avant l\'initialisation');
      return;
    }
    
    notificationService.cancelAllNotifications();
  };

  // Mettre à jour les préférences de notification
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>): Promise<void> => {
    try {
      await notificationService.updatePreferences(newPreferences);
      setPreferences(notificationService.getPreferences());
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de notification:', error);
    }
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
        updatePreferences,
        preferences,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};
