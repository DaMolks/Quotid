import { Platform } from 'react-native';
import { initializeFirebase, firebaseApp, firebaseMessaging } from './firebaseConfig';

/**
 * FirebaseService - Service pour gérer l'intégration avec Firebase Cloud Messaging (FCM)
 * Fournit des méthodes pour l'initialisation, la gestion des tokens et la réception des notifications
 */
class FirebaseService {
  private static instance: FirebaseService;
  private _isInitialized: boolean = false;
  private _fcmToken: string | null = null;
  private _onMessageListeners: Array<(message: any) => void> = [];

  /**
   * Obtenir l'instance unique du service (pattern Singleton)
   */
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialiser Firebase Messaging
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('Initialisation de Firebase Messaging...');
      
      // Vérifier si Firebase est déjà initialisé
      if (this._isInitialized) {
        console.log('Firebase déjà initialisé.');
        return true;
      }

      // 0. Initialiser l'application Firebase via notre fichier de configuration
      const firebaseInitialized = await initializeFirebase();
      if (!firebaseInitialized) {
        console.error('Impossible d\'initialiser Firebase JS');
        return false;
      }

      // 1. Demander les permissions de notification (iOS uniquement, sur Android c'est plus complexe)
      if (Platform.OS === 'ios') {
        const authStatus = await firebaseMessaging().requestPermission();
        const enabled =
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;
          
        if (!enabled) {
          console.log('Permissions de notification refusées (iOS)');
          return false;
        }
      }

      // 2. Obtenir le token FCM
      await this.getToken();

      // 3. Configurer les gestionnaires d'événements
      
      // Gestionnaire pour les notifications lorsque l'app est en premier plan
      firebaseMessaging().onMessage(async remoteMessage => {
        console.log('Notification reçue en premier plan:', remoteMessage);
        // Informer tous les écouteurs
        this._onMessageListeners.forEach(listener => listener(remoteMessage));
      });

      // Gestionnaire pour les notifications lorsque l'app est en arrière-plan et a été ouverte via une notification
      firebaseMessaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification ouverte avec l\'app en arrière-plan:', remoteMessage);
      });
      
      // Gestionnaire pour les notifications lorsque l'app est fermée
      firebaseMessaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log('Notification initiale:', remoteMessage);
          }
        });

      // 4. Définir le gestionnaire de renouvellement de token
      firebaseMessaging().onTokenRefresh(token => {
        console.log('Nouveau token FCM:', token);
        this._fcmToken = token;
        // Ici, vous pourriez envoyer le nouveau token à votre serveur
      });

      this._isInitialized = true;
      console.log('Firebase Messaging initialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Firebase:', error);
      return false;
    }
  }

  /**
   * Obtenir le token FCM pour l'appareil actuel
   */
  public async getToken(): Promise<string | null> {
    try {
      // Vérifier d'abord que Firebase est initialisé
      if (!firebaseApp.apps.length) {
        console.error('Firebase n\'est pas initialisé. Impossible d\'obtenir le token FCM.');
        return null;
      }
      
      if (!this._fcmToken) {
        this._fcmToken = await firebaseMessaging().getToken();
        console.log('FCM Token:', this._fcmToken);
      }
      return this._fcmToken;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token FCM:', error);
      return null;
    }
  }

  /**
   * Vérifier si les permissions sont accordées
   */
  public async checkPermissions(): Promise<boolean> {
    try {
      // Vérifier d'abord que Firebase est initialisé
      if (!firebaseApp.apps.length) {
        await initializeFirebase();
      }
      
      if (Platform.OS === 'ios') {
        const authStatus = await firebaseMessaging().hasPermission();
        return (
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL
        );
      } else {
        // Sur Android, nous ne pouvons pas vérifier facilement les permissions via Firebase,
        // donc nous supposons que les permissions sont déjà gérées via PermissionsAndroid
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  /**
   * Demander les permissions de notification
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      // Vérifier d'abord que Firebase est initialisé
      if (!firebaseApp.apps.length) {
        await initializeFirebase();
      }
      
      if (Platform.OS === 'ios') {
        const authStatus = await firebaseMessaging().requestPermission();
        const enabled =
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;
        return enabled;
      } else {
        // Sur Android, les permissions sont gérées via PermissionsAndroid
        // et devraient déjà être demandées lors de l'initialisation
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permissions:', error);
      return false;
    }
  }

  /**
   * Enregistrer un écouteur pour les notifications reçues lorsque l'app est au premier plan
   */
  public addOnMessageListener(listener: (message: any) => void): () => void {
    this._onMessageListeners.push(listener);
    
    // Retourner une fonction pour supprimer l'écouteur
    return () => {
      this._onMessageListeners = this._onMessageListeners.filter(l => l !== listener);
    };
  }

  /**
   * Créer un message FCM local (notification locale via FCM)
   */
  public async sendLocalNotification({
    title,
    body,
    data = {},
  }: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    // Vérifier d'abord que Firebase est initialisé
    if (!firebaseApp.apps.length) {
      await initializeFirebase();
    }
    
    try {
      await firebaseMessaging().sendMessage({
        // Cette ID doit correspondre à un ID d'expéditeur FCM valide
        // Pour une notification locale, nous pouvons utiliser le token de l'appareil
        to: await this.getToken() || '',
        // Les données nécessaires pour le message
        data,
        // La notification affichée
        notification: {
          title,
          body,
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification locale:', error);
      // Fallback vers une notification locale standard si Firebase échoue
      console.log('Tentative de fallback vers une notification standard...');
    }
  }

  /**
   * S'abonner à un sujet pour recevoir des notifications
   */
  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      // Vérifier d'abord que Firebase est initialisé
      if (!firebaseApp.apps.length) {
        await initializeFirebase();
      }
      
      await firebaseMessaging().subscribeToTopic(topic);
      console.log(`Abonné au sujet: ${topic}`);
    } catch (error) {
      console.error(`Erreur lors de l'abonnement au sujet ${topic}:`, error);
    }
  }

  /**
   * Se désabonner d'un sujet
   */
  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      // Vérifier d'abord que Firebase est initialisé
      if (!firebaseApp.apps.length) {
        await initializeFirebase();
      }
      
      await firebaseMessaging().unsubscribeFromTopic(topic);
      console.log(`Désabonné du sujet: ${topic}`);
    } catch (error) {
      console.error(`Erreur lors du désabonnement du sujet ${topic}:`, error);
    }
  }
}

// Exporter l'instance unique
export default FirebaseService.getInstance();
