# Firebase Notifications pour Quotid

Cette branche (`feature/firebase-notifications`) ajoute un système de notifications complet basé sur Firebase Cloud Messaging (FCM) à l'application Quotid. Cette solution remplace l'implémentation précédente qui rencontrait des problèmes.

## 🌟 Fonctionnalités ajoutées

### Service de notification robuste
- Intégration de Firebase Cloud Messaging (FCM) pour les notifications
- Support des notifications locales et à distance
- Gestion intelligente des permissions selon la plateforme (Android/iOS)
- Support de différents canaux de notification pour Android

### Paramètres de notification complets
- Nouvel écran de paramètres de notification
- Activation/désactivation par catégorie
- Configuration des sons et vibrations
- Délais de rappel configurables

### Types de notifications
- Notifications simples
- Notifications interactives avec boutons d'action
- Notifications spécifiques par catégorie (sport, repas, tâches ménagères, etc.)
- Support du style de notification "chinois" (pour les tests)

## 🛠️ Structure de code

### Nouveaux modules

1. **Services**
   - `firebaseService.ts`: Interface avec Firebase
   - `notificationService.ts`: Gestion des notifications

2. **Modèles**
   - `Notification.ts`: Types pour les notifications

3. **Écrans**
   - `NotificationSettingsScreen.tsx`: Écran de paramètres de notification

### Mises à jour
- Refonte complète du contexte de notification (`NotificationContext.tsx`)
- Mise à jour de l'écran de paramètres pour accéder aux paramètres de notification
- Ajout de la nouvelle route dans le navigateur principal

## 🔧 Comment l'utiliser

### Pour les développeurs

1. Installez les dépendances:
   ```bash
   npm install
   # ou
   yarn install
   ```

2. Configuration Firebase:
   - Vous devez créer un projet Firebase et configurer les fichiers natifs:
     - Android: `google-services.json` dans `android/app/`
     - iOS: `GoogleService-Info.plist` dans `ios/[ProjectName]/`

3. Test des fonctionnalités:
   - Utilisez l'écran des paramètres pour tester différents types de notifications
   - Consultez les logs pour le débogage (`console.log`)

### Pour les utilisateurs

1. Accédez aux paramètres de notification depuis l'écran Paramètres
2. Activez/désactivez les notifications selon vos préférences
3. Configurez les paramètres pour chaque catégorie (son, vibration)
4. Testez les notifications pour vérifier leur bon fonctionnement

## 📋 Architecture technique

### 1. Couche service
Le système de notification est conçu selon le modèle en couches:

```
UI (NotificationSettingsScreen)
 ↓
Context (NotificationContext)
 ↓
Service (notificationService)
 ↓
Firebase (firebaseService) + Local Notifications
```

### 2. Cycle de vie des notifications

1. **Demande des permissions**:
   - Utilisation de la gestion de permissions spécifique à la plateforme
   - Android: PermissionsAndroid pour Android 13+
   - iOS: Demande via Firebase Messaging

2. **Programmation des notifications**:
   - Détermination du canal approprié
   - Création des notifications locales via PushNotification
   - Enregistrement optionnel dans Firebase pour les notifications à distance

3. **Gestion des notifications reçues**:
   - Interception via les gestionnaires d'événements
   - Traitement des actions de l'utilisateur
   - Mise à jour de l'état de l'application si nécessaire

### 3. Stockage des préférences
Les préférences de notification sont stockées localement via AsyncStorage:
- Persistance des choix de l'utilisateur
- Chargement automatique au démarrage
- Mises à jour en temps réel

## 🚀 Avantages du nouveau système

1. **Fiabilité**: Utilisation de Firebase, une solution robuste et éprouvée
2. **Flexibilité**: Support des notifications locales et distantes
3. **Personnalisation**: Interface utilisateur complète pour la configuration
4. **Performance**: Optimisation pour réduire l'impact sur la batterie
5. **Maintenance**: Code bien structuré et documenté pour faciliter les évolutions futures

## 🔮 Évolutions futures possibles

1. **Analytiques**: Suivi de l'engagement des notifications
2. **Topics**: Abonnement à des sujets spécifiques pour les notifications
3. **Modèles de notification**: Création de modèles réutilisables
4. **Programmation avancée**: Notifications récurrentes basées sur des règles complexes
5. **Synchronisation cloud**: Sauvegarde des préférences sur le cloud

## 🧪 Tests réalisés

- Notifications simples sur Android et iOS
- Notifications interactives sur Android
- Permissions sur Android 13+
- Tests de limite de bande passante
- Tests de comportement en arrière-plan

## 📝 Notes d'implémentation

### Android
- Utilisation des canaux de notification pour Android 8.0+ (API 26+)
- Icônes personnalisées pour les notifications
- Support complet des actions interactives

### iOS
- Gestion correcte des autorisations
- Support des badges
- Limitations connues sur les actions interactives

## 🔒 Sécurité

- Aucune donnée sensible n'est transmise dans les notifications
- Authentification sécurisée via Firebase
- Validation des données reçues

## 📚 Documentation

Pour plus d'informations sur l'utilisation de Firebase avec React Native, consultez:
- [Documentation Firebase](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Documentation FCM](https://firebase.google.com/docs/cloud-messaging)

## 🤝 Contribuer

Les contributions à l'amélioration du système de notification sont les bienvenues. N'hésitez pas à créer des issues ou des pull requests.
