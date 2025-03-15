@echo off
echo ========================================
echo APPLICATION DES CORRECTIFS AUX BIBLIOTHEQUES
echo ========================================

echo === Correction de react-native-screens ===
set SCREENS_FILE=node_modules\react-native-screens\android\src\main\java\com\swmansion\rnscreens\RNScreensPackage.kt
echo package com.swmansion.rnscreens> %SCREENS_FILE%
echo.>> %SCREENS_FILE%
echo import android.view.View>> %SCREENS_FILE%
echo import com.facebook.react.ReactPackage>> %SCREENS_FILE%
echo import com.facebook.react.bridge.NativeModule>> %SCREENS_FILE%
echo import com.facebook.react.bridge.ReactApplicationContext>> %SCREENS_FILE%
echo import com.facebook.react.uimanager.ReactShadowNode>> %SCREENS_FILE%
echo import com.facebook.react.uimanager.ViewManager>> %SCREENS_FILE%
echo.>> %SCREENS_FILE%
echo class RNScreensPackage : ReactPackage {>> %SCREENS_FILE%
echo   override fun createNativeModules(reactContext: ReactApplicationContext): List^<NativeModule^> {>> %SCREENS_FILE%
echo     return listOf(ScreensModule(reactContext))>> %SCREENS_FILE%
echo   }>> %SCREENS_FILE%
echo.>> %SCREENS_FILE%
echo   override fun createViewManagers(reactContext: ReactApplicationContext): List^<ViewManager^<out View, out ReactShadowNode^<*^>^>^> {>> %SCREENS_FILE%
echo     return listOf(>> %SCREENS_FILE%
echo       ScreenContainerViewManager(),>> %SCREENS_FILE%
echo       ScreenViewManager(),>> %SCREENS_FILE%
echo       ScreenStackViewManager(),>> %SCREENS_FILE%
echo       ScreenStackHeaderConfigViewManager(),>> %SCREENS_FILE%
echo       ScreenStackHeaderSubviewManager(),>> %SCREENS_FILE%
echo       SearchBarManager()>> %SCREENS_FILE%
echo     )>> %SCREENS_FILE%
echo   }>> %SCREENS_FILE%
echo }>> %SCREENS_FILE%

echo === Correction de react-native-reanimated ===
set REANIMATED_FILE=node_modules\react-native-reanimated\android\build.gradle
echo Ouvrez le fichier %REANIMATED_FILE% manuellement et:
echo 1. Recherchez la ligne: "if (reactNativeMajor ^< 75) {"
echo 2. Remplacez-la par:   "if (reactNativeMajor ^< 70) {"
echo.
echo Cela réduira la version minimale requise de React Native de 75 à 70.

echo ========================================
echo INSTRUCTIONS COMPLÈTES
echo ========================================
echo.
echo La correction automatique pour react-native-screens a été appliquée.
echo.
echo Pour react-native-reanimated, vous devez modifier manuellement le fichier:
echo %REANIMATED_FILE%
echo.
echo Une fois les correctifs appliqués, exécutez:
echo reset-build.bat
echo.
echo pour nettoyer et reconstruire le projet.
echo.
pause
