# Guide de dépannage React Native pour Android

Ce document fournit un guide complet pour résoudre les problèmes courants lors de la configuration et de la compilation de projets React Native pour Android.

## Problèmes de compilation courants et leurs solutions

### 1. Erreur de keystore manquant

**Erreur :**
```
Execution failed for task ':app:validateSigningDebug'.
> Keystore file 'debug.keystore' not found for signing config 'debug'.
```

**Solutions :**

1. **Créer le keystore manuellement** :
```bash
keytool -genkeypair -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

2. **Utiliser un keystore existant** :
   - Cherchez dans `C:\Users\[username]\.android\debug.keystore`
   - Copiez-le dans le dossier `android/app` de votre projet

3. **Contourner la vérification du keystore** :
   - Modifiez `android/app/build.gradle` :
```gradle
signingConfigs {
    debug {
        storeType 'insecure'
    }
}
```

### 2. Incompatibilités de version React Native et ses dépendances

**Erreur :**
```
Execution failed for task ':react-native-reanimated:assertMinimalReactNativeVersionTask'.
> [Reanimated] Unsupported React Native version. Please use 75. or newer.
```

**Solutions :**

1. **Downgrader la dépendance problématique** :
```bash
npm install react-native-reanimated@3.5.4 --save
```

2. **Mettre à jour React Native** (si possible) :
```bash
npx react-native upgrade
```

3. **Vérifier la matrice de compatibilité** :
   - React Native 0.73.x → react-native-reanimated 3.5.x
   - React Native 0.71-0.72.x → react-native-reanimated 3.3.x
   - React Native 0.70.x → react-native-reanimated 2.14.x

### 3. Erreurs de compilation Kotlin

**Erreur :**
```
e: Unresolved reference: BaseReactPackage
```

**Solutions :**

1. **Vérifier la version de Kotlin** dans `android/build.gradle` :
```gradle
ext {
    kotlinVersion = "1.8.0" // Assurez la compatibilité
}
```

2. **Downgrader les bibliothèques problématiques** :
```bash
npm install react-native-screens@3.27.0 --save
```

### 4. Problèmes avec JDK et Gradle

**Erreur :**
```
Unsupported class file major version 65
Error while executing process jlink.exe
```

**Solutions :**

1. **Utiliser JDK 17 au lieu de JDK 21** (plus compatible avec React Native) :
   - Téléchargez et installez JDK 17 depuis Oracle
   - Configurez JAVA_HOME pour pointer vers JDK 17

2. **Configurer le SDK Android Studio** :
   - File > Project Structure > SDK Location
   - Définir JDK Location sur le JDK compatible (17)

3. **Optimiser la configuration Gradle** dans `android/gradle.properties` :
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.parallel=false
org.gradle.daemon=false
android.enableR8.fullMode=false
```

## Scripts utiles pour le dépannage

### Script de nettoyage complet (reset-build.bat)

```batch
@echo off
echo ========================================
echo NETTOYAGE COMPLET DU PROJET
echo ========================================

echo === Nettoyage des caches Gradle ===
rmdir /S /Q %USERPROFILE%\.gradle\caches\modules-2
rmdir /S /Q %USERPROFILE%\.gradle\caches\transforms-3
rmdir /S /Q %USERPROFILE%\.gradle\caches\build-cache-1

echo === Nettoyage des dossiers build ===
rmdir /S /Q android\.gradle
rmdir /S /Q android\app\build
rmdir /S /Q android\build

echo === Nettoyage du cache npm ===
rmdir /S /Q node_modules\.cache

echo === Construction avec options simplifiées ===
cd android
call gradlew clean --no-daemon --no-parallel --max-workers=1 assembleDebug
```

### Script de réinstallation des dépendances (reinstall-dependencies.bat)

```batch
@echo off
echo ========================================
echo RÉINSTALLATION DES DÉPENDANCES
echo ========================================

echo === Suppression des node_modules existants ===
rmdir /S /Q node_modules
del package-lock.json

echo === Installation des dépendances React Native ===
call npm install --legacy-peer-deps

echo === Installation explicite des versions compatibles ===
call npm install react-native-reanimated@3.5.4 --save --legacy-peer-deps
call npm install react-native-screens@3.27.0 --save --legacy-peer-deps
```

## Bonnes pratiques pour éviter les problèmes

1. **Utilisez des versions LTS de Node.js** (16, 18, 20)
2. **Utilisez JDK 17** au lieu de versions plus récentes pour une meilleure compatibilité
3. **Vérifiez la matrice de compatibilité** entre React Native et ses dépendances
4. **Évitez de mettre à jour une seule dépendance** à la fois, préférez les mises à jour complètes
5. **Nettoyez régulièrement les caches** de Gradle et npm
6. **Utilisez `--legacy-peer-deps`** avec npm pour éviter les erreurs de dépendances
7. **Conservez un fichier debug.keystore** fonctionnel entre projets

## Configuration système recommandée

- **Node.js** : v18.x LTS
- **JDK** : v17 (Oracle ou OpenJDK)
- **Android Studio** : Dernière version stable
- **React Native CLI** : Dernière version
- **Gradle** : Version compatible avec votre version de React Native
- **Variables d'environnement** :
  - JAVA_HOME → Pointant vers JDK 17
  - ANDROID_HOME → Pointant vers votre SDK Android
  - PATH → Incluant les répertoires bin de Node, JDK, et outils Android

## Utilisation du mode Debug

Si tous les autres dépannages échouent, vous pouvez exécuter Gradle en mode verbose pour identifier les problèmes spécifiques :

```bash
cd android
gradlew assembleDebug --info > build_log.txt
```

Examinez le fichier `build_log.txt` pour identifier les erreurs spécifiques qui peuvent ne pas être évidentes dans les messages d'erreur standard.

## Réinitialisation complète du projet

En dernier recours, si aucune solution ne fonctionne, vous pouvez essayer une réinitialisation complète :

1. Sauvegardez votre code source (dossiers `src` et fichiers importants)
2. Supprimez tout le reste
3. Recréez un projet React Native avec la même version :
   ```bash
   npx react-native init MonProjet --version 0.73.4
   ```
4. Restaurez votre code source dans le nouveau projet
5. Réinstallez vos dépendances une par une

---

Ce document est une compilation des solutions courantes aux problèmes de React Native. Si vous rencontrez d'autres problèmes, consultez la documentation officielle et les forums de la communauté.
