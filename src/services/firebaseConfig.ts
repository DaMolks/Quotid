import { firebase } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

/**
 * Fonction pour initialiser Firebase côté JavaScript
 */
export const initializeFirebase = async (): Promise<boolean> => {
  try {
    if (!firebase.apps.length) {
      // Firebase n'est pas encore initialisé
      await firebase.initializeApp();
      console.log('Firebase initialisé avec succès côté JS');
    } else {
      console.log('Firebase était déjà initialisé côté JS');
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase côté JS:', error);
    return false;
  }
};

// Exporter les instances firebase pour référence
export const firebaseApp = firebase;
export const firebaseMessaging = messaging;
