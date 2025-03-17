/**
 * ChineseStyleNotification - Module pour créer des notifications dans le style des apps chinoises
 * 
 * Ces notifications sont très visuelles, avec beaucoup d'éléments interactifs, 
 * des animations, et une mise en page distinctive.
 */

import {Platform, NativeModules, Alert} from 'react-native';
import AdvancedNotification from './AdvancedNotification';
import PushNotification from 'react-native-push-notification';

// Types pour les différentes options de boutons
export type ButtonStyle = 'primary' | 'secondary' | 'special' | 'animated';

export interface CustomButton {
  id: string;
  text: string;
  style: ButtonStyle;
  icon?: string; // Nom de l'icône
  highlightColor?: string; // Couleur de surbrillance
  action?: string; // Action à effectuer
}

// Type pour les éléments visuels
export interface VisualElement {
  type: 'progress' | 'countdown' | 'animation' | 'reward';
  value?: number;
  maxValue?: number;
  icon?: string;
  color?: string;
}

// Type pour la configuration de la notification style chinois
export interface ChineseStyleConfig {
  title: string;
  message: string;
  subMessage?: string;
  banner?: string; // URL de la bannière
  profileIcon?: string; // Icône de profil
  badges?: Array<string>; // Badges à afficher
  buttons?: Array<CustomButton>; // Boutons personnalisés
  visualElements?: Array<VisualElement>; // Éléments visuels
  promotion?: { // Élément promotionnel
    text: string;
    icon: string;
    highlight: string;
  };
  channelId?: string;
  actionText?: string; // Texte principal d'action
  rewardAmount?: number; // Pour les récompenses
  rewardType?: string; // Type de récompense
}

/**
 * Classe pour créer des notifications de style chinois très élaborées
 */
class ChineseStyleNotification {
  /**
   * Vérifie si le SDK requis est disponible
   */
  private isSupported(): boolean {
    return Platform.OS === 'android' && NativeModules.AdvancedNotification != null;
  }
  
  /**
   * Crée une notification de style chinois avec beaucoup d'éléments visuels et interactifs
   */
  async showChineseStyleNotification(config: ChineseStyleConfig): Promise<any> {
    console.log("Préparation de notification style chinois...");
    
    if (!this.isSupported()) {
      Alert.alert(
        "Non supporté",
        "Cette fonctionnalité nécessite Android et des modules natifs spécifiques"
      );
      return { id: -1 };
    }
    
    try {
      // Ici nous allons utiliser les capacités natives avancées pour créer
      // une notification qui ressemble aux applications chinoises populaires
      
      // Convertir les boutons personnalisés en éléments cochables pour la démo
      // (Dans un cas réel, vous utiliseriez un module natif spécifique pour ces boutons)
      const checkItems = [];
      
      // Ajouter des éléments visuels comme des items interactifs
      if (config.visualElements) {
        config.visualElements.forEach((element, index) => {
          checkItems.push({
            text: `${element.type === 'progress' ? '📈' : 
                  element.type === 'countdown' ? '⏱️' : 
                  element.type === 'animation' ? '✨' : '🎁'} ${
                  element.type.charAt(0).toUpperCase() + element.type.slice(1)
                } ${element.value || ''}`,
            checked: false
          });
        });
      }
      
      // Ajouter les boutons d'action comme items interactifs
      if (config.buttons) {
        config.buttons.forEach((button) => {
          let iconPrefix = '';
          
          // Ajouter un emoji basé sur le style du bouton
          switch(button.style) {
            case 'primary':
              iconPrefix = '🔴';
              break;
            case 'secondary':
              iconPrefix = '🔵';
              break;
            case 'special':
              iconPrefix = '⭐';
              break;
            case 'animated':
              iconPrefix = '✨';
              break;
          }
          
          checkItems.push({
            text: `${iconPrefix} ${button.text}`,
            checked: false
          });
        });
      }
      
      // Ajouter un élément promotionnel si défini
      if (config.promotion) {
        checkItems.push({
          text: `🎯 ${config.promotion.text} 🎯`,
          checked: false
        });
      }
      
      // Ajouter une récompense si définie
      if (config.rewardAmount && config.rewardType) {
        checkItems.push({
          text: `🎁 Gagnez ${config.rewardAmount} ${config.rewardType}!`,
          checked: false
        });
      }
      
      // Utiliser l'interface de notification avec liste cochable pour la démo
      // Dans une implémentation réelle, vous auriez un module natif spécifique
      // qui prendrait en charge tous ces éléments personnalisés
      const result = await AdvancedNotification.showChecklistNotification(
        `${config.title} 🌟`,  // Ajouter une étoile au titre pour le style
        config.message + (config.subMessage ? `\n${config.subMessage}` : ''),
        checkItems
      );
      
      // Envoyer une notification standard complémentaire pour simuler le style visuel
      setTimeout(() => {
        try {
          PushNotification.localNotification({
            channelId: config.channelId || 'special-channel',
            title: `✨ ${config.actionText || 'Cliquez pour interagir'} ✨`,
            message: `${config.promotion?.text || 'Offre spéciale disponible'} ${config.rewardAmount ? `- Gagnez ${config.rewardAmount} ${config.rewardType}!` : ''}`,
            largeIcon: "ic_launcher", // Utilise l'icône de l'application
            color: "#FF5722", // Couleur d'accent orange vif
            vibrate: true,
            vibration: 300,
            priority: 'high',
            importance: 'high',
          });
        } catch (e) {
          console.error("Erreur lors de l'envoi de la notification complémentaire", e);
        }
      }, 800);
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la création de la notification style chinois:", error);
      Alert.alert(
        "Erreur",
        "Impossible de créer la notification style chinois: " + 
        (error instanceof Error ? error.message : String(error))
      );
      return { id: -1 };
    }
  }
  
  /**
   * Affiche une notification de jeu dans le style des jeux mobiles chinois
   */
  async showGameNotification(): Promise<any> {
    const config: ChineseStyleConfig = {
      title: "🎮 Votre énergie est pleine!",
      message: "Revenez jouer maintenant pour obtenir des récompenses bonus!",
      subMessage: "Offre limitée: 2x XP pendant 1 heure",
      channelId: "game-channel",
      actionText: "JOUER MAINTENANT",
      rewardAmount: 500,
      rewardType: "Pièces",
      buttons: [
        { id: "play", text: "JOUER", style: "primary", action: "launch" },
        { id: "share", text: "INVITER", style: "secondary", action: "share" },
        { id: "bonus", text: "BONUS QUOTIDIEN", style: "special", action: "claim" },
        { id: "spin", text: "ROUE DE LA FORTUNE", style: "animated", action: "spin" }
      ],
      visualElements: [
        { type: "progress", value: 100, maxValue: 100, color: "#FF5722" },
        { type: "countdown", value: 3600, color: "#2196F3" },
        { type: "reward", value: 500, color: "#FFC107" }
      ],
      promotion: {
        text: "Pack PREMIUM à -80% aujourd'hui seulement!",
        icon: "crown",
        highlight: "#FFD700"
      }
    };
    
    return this.showChineseStyleNotification(config);
  }
  
  /**
   * Affiche une notification de fitness dans le style des apps chinoises
   */
  async showFitnessNotification(): Promise<any> {
    const config: ChineseStyleConfig = {
      title: "🏃 Activité Quotidienne",
      message: "Vous avez atteint 5000 pas aujourd'hui!",
      subMessage: "Encore 3000 pas pour votre objectif quotidien",
      channelId: "health-channel",
      actionText: "VOIR DÉTAILS",
      buttons: [
        { id: "stats", text: "STATISTIQUES", style: "primary", action: "stats" },
        { id: "share", text: "PARTAGER", style: "secondary", action: "share" },
        { id: "challenge", text: "DÉFIS AMIS", style: "special", action: "challenge" }
      ],
      visualElements: [
        { type: "progress", value: 62, maxValue: 100, color: "#4CAF50" },
        { type: "animation", color: "#2196F3" }
      ],
      promotion: {
        text: "Rejoignez le défi du printemps!",
        icon: "trophy",
        highlight: "#9C27B0"
      }
    };
    
    return this.showChineseStyleNotification(config);
  }
  
  /**
   * Affiche une notification de e-commerce dans le style chinois
   */
  async showEcommerceNotification(): Promise<any> {
    const config: ChineseStyleConfig = {
      title: "🛍️ Ventes Flash 24H",
      message: "Profitez de -70% sur les articles sélectionnés!",
      subMessage: "⏰ Se termine dans 4h 23min",
      channelId: "ecommerce-channel",
      actionText: "VOIR LES OFFRES",
      buttons: [
        { id: "shop", text: "ACHETER", style: "primary", action: "shop" },
        { id: "save", text: "FAVORIS", style: "secondary", action: "save" },
        { id: "scan", text: "SCANNER", style: "special", action: "scan" },
        { id: "coupon", text: "COUPONS", style: "animated", action: "coupon" }
      ],
      visualElements: [
        { type: "countdown", value: 15780, color: "#F44336" }
      ],
      promotion: {
        text: "Nouveau client? -10€ avec le code BIENVENUE",
        icon: "gift",
        highlight: "#E91E63"
      },
      rewardAmount: 100,
      rewardType: "Points de fidélité"
    };
    
    return this.showChineseStyleNotification(config);
  }
}

export default new ChineseStyleNotification();
