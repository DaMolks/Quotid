/**
 * Interface pour les options de notification standard
 */
export interface NotificationOptions {
  // Identifiant unique de la notification
  id: string;
  
  // Contenu de la notification
  title: string;
  message: string;
  
  // Date d'envoi (pour les notifications planifiées)
  date: Date;
  
  // Catégorie pour le regroupement des notifications
  category?: string;
  
  // Données supplémentaires à associer à la notification
  data?: Record<string, any>;
  
  // Configuration de l'auto-annulation
  autoCancel?: boolean;
  autoCancelTime?: number; // minutes
  
  // Actions/boutons disponibles sur la notification
  actions?: string[];
}

/**
 * Interface pour les options de notification interactive avec actions
 */
export interface InteractiveNotificationOptions extends NotificationOptions {
  // Actions obligatoires pour les notifications interactives
  actions: string[];
}

/**
 * Interface pour les statistiques de notification
 */
export interface NotificationStats {
  // Nombre total de notifications envoyées
  totalSent: number;
  
  // Nombre de notifications vues/ouvertes
  totalOpened: number;
  
  // Nombre de notifications dans chaque catégorie
  byCategory: Record<string, number>;
  
  // Dernière interaction avec une notification
  lastInteraction?: Date;
}

/**
 * Interface pour les préférences de notification utilisateur
 */
export interface NotificationPreferences {
  // Statut des notifications générales
  enabled: boolean;
  
  // Préférences par catégorie
  categories: {
    [category: string]: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
      timeWindow?: {
        start: string; // Format "HH:MM"
        end: string; // Format "HH:MM"
      };
    };
  };
  
  // Délai de rappel pour les notifications manquées (en minutes)
  reminderDelay: number;
  
  // Période de silence (ne pas déranger)
  quietHours?: {
    enabled: boolean;
    start: string; // Format "HH:MM"
    end: string; // Format "HH:MM"
  };
}

/**
 * Types de canaux de notification
 */
export enum NotificationChannel {
  EVENTS = 'events-channel',
  REMINDERS = 'reminders-channel',
  SYSTEM = 'system-channel',
  INTERACTIVE = 'interactive-channel'
}

/**
 * Interface pour les erreurs de notification
 */
export interface NotificationError {
  code: string;
  message: string;
  details?: any;
}
