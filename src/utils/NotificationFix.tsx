/**
 * NotificationFix - Module de diagnostic et correctifs pour les notifications
 * 
 * Ce module tente de résoudre les problèmes courants avec les notifications
 * sur les appareils Android et les émulateurs.
 */

import {Platform, PermissionsAndroid} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';

class NotificationFix {
  /**
   * Diagnostic complet du système de notification
   */
  static async diagnose() {
    console.log('=== DIAGNOSTIC DES NOTIFICATIONS ===');

    // 1. Vérifier les permissions
    console.log('1. Vérification des permissions...');
    let permissionsOK = false;
    
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          console.log('- Permission POST_NOTIFICATIONS:', granted ? 'OK' : 'MANQUANTE');
          permissionsOK = granted;
        } catch (err) {
          console.log('- Erreur vérification permission:', err);
        }
      } else {
        // Avant Android 13, les permissions sont implicites
        console.log('- Android < 13, permissions implicites supposées OK');
        permissionsOK = true;
      }
    } else {
      // iOS a une approche différente des permissions
      console.log('- Appareil iOS, vérification manuelle requise');
      permissionsOK = true; // Suppose que si l'utilisateur a accepté, c'est OK
    }

    // 2. Vérifier les canaux de notification (Android uniquement)
    if (Platform.OS === 'android') {
      console.log('2. Vérification des canaux de notification (Android)...');
      try {
        PushNotification.getChannels(channels => {
          console.log('- Canaux existants:', channels);
          if (channels.length === 0) {
            console.log('- ALERTE: Aucun canal de notification trouvé!');
          }
        });
      } catch (error) {
        console.log('- Erreur vérification canaux:', error);
      }
    }

    // 3. Test direct avec notification immédiate
    console.log('3. Test de notification via méthode alternative...');
    this.forceDirectNotification();
    
    return permissionsOK;
  }

  /**
   * Réinitialisation complète du système de notification
   */
  static async reset() {
    console.log('=== RÉINITIALISATION DU SYSTÈME DE NOTIFICATION ===');
    
    // 1. Annuler toutes les notifications
    try {
      PushNotification.cancelAllLocalNotifications();
      console.log('- Toutes les notifications annulées');
    } catch (error) {
      console.log('- Erreur annulation notifications:', error);
    }
    
    // 2. Supprimer et recréer tous les canaux de notification (Android uniquement)
    if (Platform.OS === 'android') {
      this.deleteAllChannels();
    }
    
    // 3. Demander à nouveau les permissions si nécessaire
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('- Nouvelle demande de permission:', granted);
      } catch (error) {
        console.log('- Erreur demande permission:', error);
      }
    }
    
    return true;
  }

  /**
   * Force une notification directe en contournant la plupart des couches d'abstraction
   */
  static forceDirectNotification() {
    try {
      // Cette approche contourne certaines couches qui pourraient poser problème
      // et utilise l'API de base la plus directe possible
      if (Platform.OS === 'android') {
        PushNotification.localNotification({
          channelId: 'default', // Utilise le canal par défaut pour éviter les problèmes de canal
          title: '🔧 Test Diagnostic',
          message: 'Si vous voyez cette notification, le problème n\'est pas dans le code',
          importance: "max",
          priority: "max",
          smallIcon: "ic_notification", // Icône par défaut
          largeIcon: "",
          vibrate: true,
          vibration: 300,
          playSound: true,
          soundName: 'default',
        });
        console.log('- Notification directe envoyée (Android)');
      } else {
        // iOS
        PushNotification.localNotification({
          title: '🔧 Test Diagnostic',
          message: 'Si vous voyez cette notification, le problème n\'est pas dans le code',
          playSound: true,
          soundName: 'default',
        });
        console.log('- Notification directe envoyée (iOS)');
      }
    } catch (error) {
      console.log('- Erreur notification directe:', error);
    }
  }
  
  /**
   * Supprimer tous les canaux existants puis les recréer
   */
  static deleteAllChannels() {
    if (Platform.OS !== 'android') return;
    
    console.log('- Suppression de tous les canaux de notification...');
    
    PushNotification.getChannels(channels => {
      channels.forEach(channelId => {
        console.log(`- Suppression du canal: ${channelId}`);
        PushNotification.deleteChannel(channelId);
      });
      
      // Après suppression, recréer les canaux
      setTimeout(() => {
        console.log('- Canaux supprimés, recréation...');
        this.recreateAllChannels();
      }, 1000);
    });
  }
  
  /**
   * Recréer tous les canaux de notification avec paramètres maximaux (Android uniquement)
   */
  static recreateAllChannels() {
    if (Platform.OS !== 'android') return;
    
    console.log('- Recréation des canaux de notification...');
    
    try {
      // Canal par défaut (toujours avoir celui-ci)
      PushNotification.createChannel(
        {
          channelId: 'default',
          channelName: 'Canal par défaut',
          channelDescription: 'Canal par défaut pour toutes les notifications',
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        created => console.log('- Canal default:', created ? 'Créé' : 'Échec')
      );
      
      // Canal pour les événements réguliers
      PushNotification.createChannel(
        {
          channelId: 'events-channel',
          channelName: 'Événements',
          channelDescription: 'Notifications pour les événements du calendrier',
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        created => console.log('- Canal events:', created ? 'Créé' : 'Échec')
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
        created => console.log('- Canal reminders:', created ? 'Créé' : 'Échec')
      );

      // Canal pour les notifications système
      PushNotification.createChannel(
        {
          channelId: 'system-channel',
          channelName: 'Système',
          channelDescription: 'Notifications système de l\'application',
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        created => console.log('- Canal system:', created ? 'Créé' : 'Échec')
      );
      
      // Canal pour les notifications interactives
      PushNotification.createChannel(
        {
          channelId: 'interactive-channel',
          channelName: 'Notifications Interactives',
          channelDescription: 'Notifications avec boutons d\'action',
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        created => console.log('- Canal interactive:', created ? 'Créé' : 'Échec')
      );
    } catch (error) {
      console.log('- Erreur création canaux:', error);
    }
  }
  
  /**
   * Force un rafraîchissement complet du système de notification
   * Cette méthode est une solution brutale, mais efficace pour résoudre les problèmes
   */
  static forceRefresh() {
    console.log('=== FORCE REFRESH DU SYSTÈME DE NOTIFICATION ===');
    
    // 1. Supprimer tous les canaux
    if (Platform.OS === 'android') {
      this.deleteAllChannels();
    }
    
    // 2. Envoyer une notification de test immédiate
    setTimeout(() => {
      // Utiliser un canal par défaut au cas où
      this.forceDirectNotification();
      
      // Tester également avec un canal spécifique
      setTimeout(() => {
        if (Platform.OS === 'android') {
          try {
            PushNotification.localNotification({
              channelId: 'system-channel',
              title: '✅ Test Canal Système',
              message: 'Notification sur le canal système nouvellement créé',
              importance: "max",
              priority: "max",
              smallIcon: "ic_notification",
              largeIcon: "",
              vibrate: true,
              vibration: 300,
              playSound: true,
              soundName: 'default',
            });
            console.log('- Test sur canal système envoyé');
          } catch (error) {
            console.log('- Erreur test canal système:', error);
          }
        }
      }, 2000);
    }, 2000);
    
    return true;
  }
}

export default NotificationFix;
