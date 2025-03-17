/**
 * AdvancedNotification - Module pour des notifications avancées Android
 * 
 * Ce module fournit une interface JavaScript pour le module natif AdvancedNotificationModule
 * qui permet de créer des notifications plus avancées, notamment avec des listes cochables.
 */

import {NativeModules, Platform} from 'react-native';

const {AdvancedNotification: NativeAdvancedNotification} = NativeModules;

// Interface pour les éléments de liste cochable
export interface ChecklistItem {
  text: string;
  checked?: boolean;
}

// Interface pour le résultat d'une notification
export interface NotificationResult {
  id: number;
}

/**
 * Module pour les notifications avancées
 */
class AdvancedNotification {
  /**
   * Vérifie si le module natif est disponible
   */
  private isAvailable(): boolean {
    return Platform.OS === 'android' && NativeAdvancedNotification != null;
  }

  /**
   * Affiche une notification avec une liste cochable
   * 
   * @param title Le titre de la notification
   * @param content Le contenu de la notification
   * @param items Les éléments de la liste
   * @returns Une promesse qui se résout avec l'ID de la notification
   */
  async showChecklistNotification(
    title: string, 
    content: string, 
    items: ChecklistItem[]
  ): Promise<NotificationResult> {
    if (!this.isAvailable()) {
      console.warn('AdvancedNotification: Module natif non disponible');
      return {id: -1};
    }

    try {
      return await NativeAdvancedNotification.showChecklistNotification(title, content, items);
    } catch (error) {
      console.error('AdvancedNotification: Erreur lors de l\'affichage de la notification', error);
      throw error;
    }
  }

  /**
   * Annule une notification par son ID
   * 
   * @param notificationId L'ID de la notification à annuler
   * @returns Une promesse qui se résout quand la notification est annulée
   */
  async cancelNotification(notificationId: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('AdvancedNotification: Module natif non disponible');
      return false;
    }

    try {
      return await NativeAdvancedNotification.cancelNotification(notificationId);
    } catch (error) {
      console.error('AdvancedNotification: Erreur lors de l\'annulation de la notification', error);
      throw error;
    }
  }
}

export default new AdvancedNotification();
