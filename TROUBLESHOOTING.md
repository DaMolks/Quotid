# Guide de dépannage pour Quotid

Ce document fournit des instructions pour résoudre les problèmes courants rencontrés lors de la configuration et de la compilation du projet Quotid sur Android.

## Problèmes connus et leurs solutions

### 1. Incompatibilité de react-native-reanimated

**Symptôme :** Erreur lors de la compilation avec le message `[Reanimated] Unsupported React Native version. Please use 75. or newer.`

**Solution :** Nous avons mis à jour le fichier `package.json` pour utiliser une version compatible de react-native-reanimated (3.5.4) avec React Native 0.73.4. Exécutez :

```bash
npm install
```

### 2. Fichier keystore manquant

**Symptôme :** Erreur `Keystore file not found for signing config 'debug'`

**Solution :** Nous avons fourni deux scripts pour générer le keystore :
- Pour Windows : exécutez `generate-debug-keystore.bat`
- Pour Linux/Mac : exécutez `./generate-debug-keystore.sh` (assurez-vous qu'il est exécutable avec `chmod +x generate-debug-keystore.sh`)

### 3. Problèmes avec jlink.exe et JDK

**Symptôme :** Erreurs liées à `jlink.exe` ou JDK lors de la compilation

**Solution :** Configurez correctement votre JDK dans Android Studio :
1. Ouvrez Android Studio
2. Allez dans File > Project Structure
3. Sous SDK Location, vérifiez JDK Location
4. Utilisez le JDK intégré d'Android Studio ou un JDK compatible (17 est recommandé)

### 4. Erreurs de compilation avec react-native-screens

**Symptôme :** Erreurs de compilation Kotlin pour le module react-native-screens

**Solution :** Nous avons mis à jour le package.json pour utiliser une version compatible avec React Native 0.73.4.

### 5. Nettoyage du projet

Si vous continuez à rencontrer des problèmes, essayez de nettoyer complètement le projet :

1. Exécutez `clean-project.bat` pour nettoyer les builds et caches
2. Réinstallez les dépendances avec `npm install`
3. Reconstruisez le projet avec `cd android && gradlew build`

## Configuration recommandée pour Android Studio

1. **JDK** : Utilisez JDK 17 (Quotid n'est pas compatible avec Java 21 pour le moment)
2. **Gradle** : Utilisez le Gradle wrapper fourni avec le projet
3. **SDK Android** : Utilisez SDK API 33 (comme configuré dans le projet)

## Problèmes persistants

Si vous rencontrez toujours des problèmes :

1. Vérifiez que toutes les variables d'environnement sont correctement configurées (JAVA_HOME, ANDROID_HOME)
2. Assurez-vous que le SDK Android est correctement installé avec les Build Tools 33.0.1 ou plus
3. Essayez d'invalider les caches et de redémarrer Android Studio
4. Si nécessaire, envisagez de réinitialiser complètement l'environnement de développement
