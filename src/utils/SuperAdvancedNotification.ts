/**
 * SuperAdvancedNotification - Module pour des notifications ultra-riches et interactives
 * 
 * Ce module fournit une interface pour créer des notifications avancées avec
 * des éléments interactifs complexes comme des listes cochables, des boutons d'action
 * contextuels, et des notifications progressives.
 */

import {Platform, NativeModules, Alert} from 'react-native';
import AdvancedNotification, {ChecklistItem} from './AdvancedNotification';
import PushNotification from 'react-native-push-notification';

// Type pour la tâche ménagère
export interface HousekeepingTask {
  id: number;
  name: string;
  completed: boolean;
  estimatedTime: number; // minutes
  priority: 'high' | 'medium' | 'low';
  area: string; // cuisine, salle de bain, etc.
}

// Type pour l'événement de journée
export interface DayEvent {
  time: string;
  title: string;
  description?: string;
  type: 'work' | 'personal' | 'housekeeping' | 'sport' | 'meal';
  completed: boolean;
}

// Type pour la configuration de la notification
export interface SuperNotificationConfig {
  title: string;
  message: string;
  tasks?: HousekeepingTask[];
  events?: DayEvent[];
  progressValue?: number;
  progressMax?: number;
  channelId?: string;
  actions?: string[];
  autoCancel?: boolean;
  data?: any;
}

/**
 * Classe pour la création de notifications super avancées
 */
class SuperAdvancedNotification {
  /**
   * Affiche une notification de planning quotidien avec tâches et événements
   */
  async showDailyPlanNotification(config: SuperNotificationConfig): Promise<any> {
    console.log("Préparation de la notification de planning quotidien...");
    
    try {
      // 1. Préparer les données des tâches ménagères pour la liste cochable
      const checklistItems: ChecklistItem[] = config.tasks?.map(task => ({
        text: `${task.name} (${task.estimatedTime} min)`,
        checked: task.completed
      })) || [];
      
      // 2. Envoyer une notification principale avec les tâches
      if (Platform.OS === 'android' && checklistItems.length > 0) {
        // Utiliser le module natif pour Android
        const mainNotifResult = await AdvancedNotification.showChecklistNotification(
          config.title,
          config.message,
          checklistItems
        );
        
        console.log("Notification avec liste cochable envoyée avec succès, ID:", mainNotifResult.id);
        
        // 3. Maintenant, envoyer une notification standard qui présente les événements
        if (config.events && config.events.length > 0) {
          const eventsText = config.events
            .map(event => `${event.time} - ${event.title}${event.completed ? ' ✓' : ''}`)
            .join('\\n');
          
          setTimeout(() => {
            PushNotification.localNotification({
              channelId: config.channelId || 'events-channel',
              id: String(mainNotifResult.id + 1),
              title: '📅 Votre journée',
              message: eventsText,
              actions: ['Voir détails', 'Tout marquer'],
              priority: "high",
              importance: "high",
              vibrate: true,
              vibration: 300,
              playSound: true,
              soundName: 'default',
              userInfo: {
                relatedTo: mainNotifResult.id,
                type: 'daily-events',
                ...config.data
              }
            });
          }, 500);
        }
        
        return mainNotifResult;
      } else {
        // Fallback pour iOS ou si pas de tâches
        Alert.alert(
          "Notification non disponible",
          "Cette fonctionnalité n'est disponible que sur Android avec des tâches."
        );
        return {id: -1};
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification super avancée:", error);
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer la notification enrichie: " + 
        (error instanceof Error ? error.message : String(error))
      );
      return {id: -1};
    }
  }
  
  /**
   * Affiche une notification riche pour le suivi du ménage
   */
  async showHousekeepingNotification(): Promise<any> {
    console.log("Préparation de la notification de ménage...");
    
    // Exemple de tâches ménagères prédéfinies
    const housekeepingTasks: HousekeepingTask[] = [
      { id: 1, name: "Nettoyer la cuisine", completed: false, estimatedTime: 20, priority: "high", area: "cuisine" },
      { id: 2, name: "Passer l'aspirateur dans le salon", completed: false, estimatedTime: 15, priority: "medium", area: "salon" },
      { id: 3, name: "Faire la vaisselle", completed: true, estimatedTime: 10, priority: "high", area: "cuisine" },
      { id: 4, name: "Changer la litière des chats", completed: false, estimatedTime: 5, priority: "high", area: "salle de bain" },
      { id: 5, name: "Ranger les vêtements", completed: false, estimatedTime: 10, priority: "low", area: "chambre" }
    ];
    
    // Configuration de la notification
    const notificationConfig: SuperNotificationConfig = {
      title: "🧹 Tâches ménagères du jour",
      message: "Voici les tâches à accomplir aujourd'hui",
      tasks: housekeepingTasks,
      progressValue: 1, // Une tâche déjà accomplie
      progressMax: 5,   // Sur 5 tâches au total
      channelId: "reminders-channel",
      actions: ["Tout terminer", "Reporter"],
      data: {
        category: "housekeeping",
        importance: "medium"
      }
    };
    
    return this.showDailyPlanNotification(notificationConfig);
  }
  
  /**
   * Affiche une notification riche pour le planning de la journée
   */
  async showDailyScheduleNotification(): Promise<any> {
    console.log("Préparation de la notification de planning quotidien...");
    
    // Exemple de tâches et d'événements pour une journée
    const housekeepingTasks: HousekeepingTask[] = [
      { id: 1, name: "Nettoyer la cuisine", completed: false, estimatedTime: 20, priority: "high", area: "cuisine" },
      { id: 2, name: "Faire la lessive", completed: false, estimatedTime: 15, priority: "medium", area: "buanderie" },
      { id: 3, name: "Litière des chats", completed: false, estimatedTime: 5, priority: "high", area: "salle de bain" }
    ];
    
    const dayEvents: DayEvent[] = [
      { time: "08:00", title: "Réveil", type: "personal", completed: true },
      { time: "08:30-16:30", title: "Travail", type: "work", completed: false },
      { time: "17:00", title: "Sport: 30 min exercices", type: "sport", completed: false },
      { time: "19:00", title: "Dîner", type: "meal", completed: false },
      { time: "22:00", title: "Coucher", type: "personal", completed: false }
    ];
    
    // Configuration de la notification
    const notificationConfig: SuperNotificationConfig = {
      title: "📅 Votre journée",
      message: "Voici votre planning pour aujourd'hui",
      tasks: housekeepingTasks,
      events: dayEvents,
      progressValue: 1, // Un événement déjà accompli
      progressMax: 8,   // Sur 8 événements/tâches au total
      channelId: "events-channel",
      actions: ["Voir détails", "Modifier"],
      data: {
        category: "daily-schedule",
        importance: "high"
      }
    };
    
    return this.showDailyPlanNotification(notificationConfig);
  }
}

export default new SuperAdvancedNotification();
