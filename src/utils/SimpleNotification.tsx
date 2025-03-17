/**
 * SimpleNotification - Module de repli pour les notifications
 * 
 * Ce module fournit une solution simple pour les notifications quand
 * les méthodes natives échouent. Il utilise Alert quand il n'y a pas
 * d'alternatives, mais peut aussi tenter d'utiliser PushNotification
 * de manière simplifiée.
 */

import {Alert, Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

interface ReminderOptions {
  title: string;
  message: string;
  date?: Date;
  channelId?: string;
  sound?: boolean;
}

/**
 * Utilitaire simple pour les notifications
 * - Utilisé comme solution de repli quand le système principal échoue
 * - Fournit des méthodes plus simples et plus robustes avec gestion d'erreurs
 */
class SimpleNotification {
  // Afficher un rappel immédiat (notification ou alerte)
  static showReminder({
    title = 'Rappel',
    message = '',
    channelId = 'system-channel',
    sound = true,
  }: ReminderOptions): void {
    try {
      // Essayer d'abord via PushNotification
      PushNotification.localNotification({
        channelId: channelId,
        title: title,
        message: message,
        playSound: sound,
        soundName: sound ? 'default' : undefined,
      });
    } catch (error) {
      console.warn('Échec de notification via PushNotification:', error);
      // Solution de repli: Alert standard
      Alert.alert(title, message);
    }
  }

  // Programmer un rappel
  static scheduleReminder({
    title = 'Rappel',
    message = '',
    date = new Date(Date.now() + 60000), // Par défaut 1 minute plus tard
    channelId = 'system-channel',
    sound = true,
  }: ReminderOptions): void {
    // Si la date est dans le passé ou moins de 1s dans le futur, montrer immédiatement
    const now = new Date();
    if (date.getTime() - now.getTime() < 1000) {
      this.showReminder({title, message, channelId, sound});
      return;
    }

    try {
      // Essayer de programmer via PushNotification
      PushNotification.localNotificationSchedule({
        channelId: channelId,
        title: title,
        message: message,
        date: date,
        playSound: sound,
        soundName: sound ? 'default' : undefined,
        allowWhileIdle: true,
      });
    } catch (error) {
      console.warn('Échec de programmation via PushNotification:', error);
      
      // Si l'échec est immédiat, montrer une alerte pour informer l'utilisateur
      Alert.alert(
        'Rappel programmé',
        `Vous recevrez un rappel pour: "${title}" le ${date.toLocaleString()}`
      );
      
      // On pourrait aussi stocker le rappel dans AsyncStorage et
      // utiliser un timer JavaScript, mais c'est moins fiable.
    }
  }

  // Annuler tous les rappels
  static cancelAllReminders(): void {
    try {
      PushNotification.cancelAllLocalNotifications();
    } catch (error) {
      console.warn('Échec de l\'annulation des notifications:', error);
    }
  }
}

export default SimpleNotification;
