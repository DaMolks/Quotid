# Quotid

Une application mobile pour organiser et améliorer sa vie quotidienne.

## Description

Quotid est une application mobile "couteau suisse" qui aide les utilisateurs à suivre et améliorer leur vie quotidienne en combinant calendrier, notifications intelligentes et suivi de progression.

## Fonctionnalités principales

- Calendrier évolué avec catégorisation des événements
- Système de notifications intelligent et non invasif
- Suivi et adaptation des activités planifiées
- Écrans spécialisés par type d'activité (Sport, Tâches ménagères, etc.)

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer l'application sur Android
npm run android

# Démarrer l'application sur iOS
npm run ios
```

## Structure du projet

- `/src` : Code source de l'application
  - `/components` : Composants React réutilisables
  - `/screens` : Écrans principaux de l'application
  - `/navigation` : Configuration de la navigation
  - `/services` : Services (notifications, base de données, etc.)
  - `/utils` : Fonctions utilitaires
  - `/assets` : Ressources statiques (images, polices, etc.)
  - `/styles` : Styles globaux et thèmes
  - `/hooks` : Custom React hooks
  - `/context` : Contextes React
  - `/models` : Types et interfaces TypeScript

## Développé avec

- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/)
- [SQLite](https://www.sqlite.org/index.html)
