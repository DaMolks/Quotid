/**
 * SimpleNotification - Une alternative très basique aux notifications natives
 * 
 * Ce module simule des notifications en utilisant des alertes. Il est destiné
 * à être utilisé quand les notifications natives posent problème.
 */
import { Alert, Vibration, Platform } from 'react-native';

// Cache pour les rappels déjà prévus
const reminderCache = new Set();

/**
 * Créer un rappel utilisateur sans utiliser le système de notification natif
 * 
 * @param {Object} options Options du rappel
 * @param {string} options.title Titre du rappel
 * @param {string} options.message Message du rappel
 * @param {Date} options.date Date et heure du rappel
 * @param {Function} options.onPress Fonction à appeler quand l'utilisateur appuie sur le rappel
 * @param {string} options.id Identifiant unique du rappel
 * @returns {string} Identifiant du rappel
 */
export const scheduleReminder = (options) => {
  const { title, message, date, onPress, id = Date.now().toString() } = options;
  
  console.log(`📢 Rappel programmé: ${id} - ${title}`);
  
  // Si la date est dans le passé, on ignore
  if (date < new Date()) {
    console.log(`⏰ Date dans le passé, rappel ignoré: ${date}`);
    return id;
  }
  
  // Calcul du délai en millisecondes
  const delay = date.getTime() - Date.now();
  console.log(`⏰ Rappel programmé dans: ${delay}ms`);
  
  // Supprimer tout rappel existant avec le même ID
  cancelReminder(id);
  
  // Programmer un nouveau rappel
  const timerId = setTimeout(() => {
    // Vibrer pour attirer l'attention (si disponible)
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 500, 200, 500]);
    }
    
    // Afficher une alerte
    Alert.alert(
      `📢 ${title}`,
      message,
      [
        { 
          text: 'OK',
          onPress: onPress || (() => console.log(`Rappel ${id} confirmé`))
        }
      ],
      { cancelable: false }
    );
    
    // Supprimer du cache
    reminderCache.delete(id);
    
    console.log(`📢 Rappel affiché: ${id} - ${title}`);
  }, delay);
  
  // Stocker le rappel dans le cache
  reminderCache.add(id);
  
  return id;
};

/**
 * Annuler un rappel programmé
 * 
 * @param {string} id Identifiant du rappel à annuler
 */
export const cancelReminder = (id) => {
  if (reminderCache.has(id)) {
    console.log(`❌ Rappel annulé: ${id}`);
    clearTimeout(id);
    reminderCache.delete(id);
  }
};

/**
 * Annuler tous les rappels programmés
 */
export const cancelAllReminders = () => {
  console.log(`❌ Tous les rappels annulés (${reminderCache.size})`);
  reminderCache.forEach(id => clearTimeout(id));
  reminderCache.clear();
};

/**
 * Afficher immédiatement un rappel (sans délai)
 * 
 * @param {Object} options Options du rappel
 * @param {string} options.title Titre du rappel
 * @param {string} options.message Message du rappel
 * @param {Function} options.onPress Fonction à appeler quand l'utilisateur appuie sur le rappel 
 */
export const showReminder = (options) => {
  const { title, message, onPress } = options;
  
  console.log(`📢 Affichage immédiat d'un rappel: ${title}`);
  
  // Vibrer pour attirer l'attention (si disponible)
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 500, 200, 500]);
  }
  
  // Afficher une alerte
  Alert.alert(
    `📢 ${title}`,
    message,
    [
      { 
        text: 'OK',
        onPress: onPress || (() => console.log(`Rappel confirmé`))
      }
    ],
    { cancelable: false }
  );
};

export default {
  scheduleReminder,
  cancelReminder,
  cancelAllReminders,
  showReminder
};
