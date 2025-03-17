/**
 * Module d'aide aux notifications utilisant l'API native Android.
 * Cette approche contourne react-native-push-notification pour tester si 
 * le problème vient de la bibliothèque ou du système.
 */
import { NativeModules, Platform } from 'react-native';

const { ToastModule } = NativeModules;

/**
 * Affiche un toast sur Android (message temporaire)
 * Ne fait rien sur iOS
 */
export const showToast = (message) => {
  if (Platform.OS === 'android' && ToastModule) {
    ToastModule.show(message, ToastModule.SHORT);
    console.log('Toast affiché:', message);
    return true;
  } else {
    console.log('Toast non disponible sur cette plateforme');
    return false;
  }
};

/**
 * Vérifie si les notifications sont actives pour l'application.
 * C'est une fonction de diagnostic.
 */
export const checkNotificationStatus = () => {
  if (Platform.OS === 'android' && NativeModules.RNPushNotification) {
    const status = {
      areNotificationsEnabled: false,
      errors: []
    };
    
    try {
      status.areNotificationsEnabled = NativeModules.RNPushNotification.areNotificationsEnabled();
    } catch (e) {
      status.errors.push(`Erreur lors de la vérification des notifications: ${e.message}`);
    }
    
    console.log('Statut des notifications:', status);
    return status;
  } else {
    return { available: false, message: 'Non disponible sur cette plateforme' };
  }
};

export default {
  showToast,
  checkNotificationStatus
};
