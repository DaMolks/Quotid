# Quotid

<p align="center">
  <img src="https://github.com/DaMolks/Quotid/raw/main/assets/logo.png" alt="Quotid Logo" width="200" />
</p>

Quotid est une application mobile pour organiser et améliorer sa vie quotidienne. Elle aide les utilisateurs à suivre leurs activités quotidiennes et à progresser vers une meilleure version d'eux-mêmes.

## Fonctionnalités principales

- **Calendrier évolué** : Visualisation et gestion des événements par catégories (travail, sport, tâches ménagères, etc.)
- **Notifications intelligentes** : Rappels contextuels qui s'adaptent aux habitudes de l'utilisateur et disparaissent automatiquement quand ils ne sont plus pertinents
- **Suivi de progression** : Statistiques et visualisations pour suivre l'amélioration au fil du temps
- **Écrans spécialisés** : Interfaces adaptées selon le type d'activité (sport, tâches ménagères, etc.)

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

- [Node.js](https://nodejs.org/) (v14.0.0 ou plus)
- [npm](https://www.npmjs.com/) (v6.0.0 ou plus)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio) (pour le développement Android)
- [Xcode](https://developer.apple.com/xcode/) (pour le développement iOS, Mac uniquement)

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/DaMolks/Quotid.git
   cd Quotid
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Pour iOS, installez les pods (macOS uniquement) :
   ```bash
   cd ios && pod install && cd ..
   ```

## Démarrage

### Android

```bash
npm run android
```

### iOS (macOS uniquement)

```bash
npm run ios
```

## Structure du projet

```
Quotid/
├── src/                  # Code source de l'application
│   ├── components/       # Composants réutilisables
│   ├── context/          # Contextes React (thème, base de données, notifications)
│   ├── models/           # Types et interfaces
│   ├── navigation/       # Configuration de la navigation
│   ├── screens/          # Écrans de l'application
│   ├── services/         # Services (gestion des événements, catégories, statistiques)
│   ├── utils/            # Fonctions utilitaires
│   ├── App.tsx           # Composant racine de l'application
├── android/              # Configuration et code natif Android
├── ios/                 # Configuration et code natif iOS
├── index.js             # Point d'entrée de l'application
├── package.json         # Dépendances et scripts
├── README.md            # Ce fichier
```

## Fonctionnalités à venir

- **Synchronisation cloud** : Sauvegarde et synchronisation des données entre plusieurs appareils
- **Intégration avec d'autres services** : Connexion avec des applications de fitness, de sommeil, etc.
- **Fonctionnalités sociales** : Challenges et comparaisons entre amis
- **Système de gamification** : Points et récompenses pour maintenir la motivation

## Technologies utilisées

- [React Native](https://reactnative.dev/) - Framework pour le développement mobile cross-platform
- [TypeScript](https://www.typescriptlang.org/) - Typage statique pour JavaScript
- [React Navigation](https://reactnavigation.org/) - Navigation entre les écrans
- [SQLite](https://www.sqlite.org/) - Base de données locale
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) - Visualisations graphiques

## Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commitez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.
