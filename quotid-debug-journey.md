# Débogage et Reconstruction de l'Application Quotid

## Résumé des problèmes rencontrés et solutions appliquées

Ce document récapitule la démarche de débogage et de reconstruction de l'application Quotid, suite à des problèmes de compilation et d'affichage.

## Contexte initial

L'application Quotid (anciennement "Life Organizer") rencontrait des difficultés de compilation et d'exécution. Malgré plusieurs tentatives, l'application n'affichait qu'un écran blanc lors de son lancement.

## Phase 1 : Refondation du projet

### Problèmes identifiés
- Impossibilité de compiler le projet original
- Conflits de dépendances et problèmes de configuration Gradle

### Solution appliquée
Création d'un nouveau projet React Native en conservant uniquement le dossier `src` :
- Utilisation de la commande `npx react-native init` pour générer un nouveau projet propre
- Migration du dossier `src` contenant la logique métier et les composants

## Phase 2 : Configuration de l'environnement de développement

### Problèmes identifiés
- Variables d'environnement manquantes (ANDROID_HOME)
- SDK Android non configuré correctement

### Solutions appliquées
- Configuration de la variable d'environnement ANDROID_HOME
- Ajout des sous-dossiers pertinents du SDK Android au PATH :
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\emulator`
  - `%ANDROID_HOME%\build-tools`

## Phase 3 : Résolution des conflits de dépendances

### Problèmes identifiés
- Erreurs `checkDebugDuplicateClasses` lors de la compilation
- Conflit entre AndroidX et les anciennes bibliothèques de support Android

### Solutions appliquées
- Modification du fichier `android/app/build.gradle` pour :
  - Exclure les bibliothèques en conflit
  - Configurer `packagingOptions` pour gérer les fichiers dupliqués
  - Forcer l'utilisation des versions AndroidX

```gradle
// Configuration pour éviter les erreurs de lint liées à AndroidX
lintOptions {
    abortOnError false
}

// Configuration pour la migration vers AndroidX
configurations.all {
    resolutionStrategy {
        force 'androidx.core:core:1.13.1'
        // Exclusion des anciennes bibliothèques de support
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-core-utils'
        exclude group: 'com.android.support', module: 'support-core-ui'
        exclude group: 'com.android.support', module: 'support-v4'
        exclude group: 'com.android.support', module: 'support-fragment'
        exclude group: 'com.android.support', module: 'support-media-compat'
    }
}
```

## Phase 4 : Installation des dépendances manquantes

### Problèmes identifiés
- Erreurs de modules non trouvés lors de l'exécution

### Solutions appliquées
Installation de toutes les dépendances nécessaires identifiées dans le code source :
```bash
npm install --save react-native-chart-kit @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-calendars @react-native-community/datetimepicker
```

## Phase 5 : Approche progressive pour identifier la source de l'écran blanc

Une approche méthodique de débogage a été mise en place pour identifier la source exacte de l'écran blanc :

### Étape 1 : Application minimaliste
- Création d'une version simplifiée de l'App pour vérifier le fonctionnement de base
- Confirmation que la structure de base fonctionne correctement

### Étape 2 : Ajout du ThemeProvider
- Intégration du contexte de thème
- Test avec basculement entre thème clair et sombre
- Fonctionnement validé

### Étape 3 : Ajout du SafeAreaProvider
- Intégration du SafeAreaProvider et SafeAreaView
- Adaptation de l'interface pour respecter les zones de sécurité
- Fonctionnement validé

### Étape 4 : Ajout du DatabaseProvider
- Intégration du contexte de base de données SQLite
- Test d'initialisation de la base de données
- Requête pour vérifier le nombre de catégories
- Fonctionnement validé

### Étape 5 : Identification du problème avec NotificationProvider
- Ajout du NotificationProvider provoquant l'écran blanc
- Identification du conflit dans les bibliothèques de notification

### Étape 6 : Solution pour NotificationProvider
- Création d'une version "factice" du NotificationProvider
- Remplacement des vraies notifications par des alertes simples
- Préservation de l'interface du fournisseur pour maintenir la compatibilité
- Fonctionnement validé

### Étape 7 : Intégration de la navigation complète
- Mise en place du NavigationContainer
- Configuration du système de navigation (onglets et pile)
- Application complète fonctionnelle

## Problèmes identifiés et solutions

| Problème | Solution |
|----------|----------|
| Compilation impossible du projet original | Création d'un nouveau projet propre en conservant uniquement le code source |
| Variables d'environnement manquantes | Configuration correcte d'ANDROID_HOME et du PATH |
| Conflits de classes dupliquées | Configuration spécifique dans build.gradle pour gérer les exclusions |
| Dépendances manquantes | Installation des packages npm requis |
| Écran blanc au démarrage | Approche progressive pour isoler les composants problématiques |
| NotificationProvider problématique | Création d'une version factice compatible mais sans les intégrations natives problématiques |

## Apprentissages et bonnes pratiques

1. **Approche progressive** : Commencer avec une application minimaliste et ajouter les fonctionnalités une par une permet d'identifier précisément la source des problèmes.

2. **Isolation des problèmes** : En isolant chaque provider et fonctionnalité, il devient plus facile de déterminer exactement ce qui cause un problème.

3. **Versions factices** : Créer des versions factices des fonctionnalités problématiques permet de continuer le développement sans bloquer l'ensemble du projet.

4. **Logs et débogage** : L'utilisation de logs clairs et stratégiquement placés aide énormément à comprendre le flux d'exécution et à identifier les erreurs silencieuses.

## Prochaines étapes

1. **Amélioration des notifications** : Investiguer pourquoi les notifications natives ne fonctionnent pas et chercher une solution permanente.

2. **Tests approfondis** : Tester systématiquement chaque fonctionnalité de l'application pour s'assurer que tout fonctionne comme prévu.

3. **Optimisation de la performance** : Maintenant que l'application fonctionne, des optimisations peuvent être appliquées pour améliorer les performances.

4. **Mise à jour des dépendances** : Envisager de mettre à jour les dépendances problématiques vers des versions plus récentes et compatibles.

Ce document peut servir de référence pour résoudre des problèmes similaires à l'avenir et pour comprendre l'architecture et les décisions prises lors de la reconstruction de l'application Quotid.
