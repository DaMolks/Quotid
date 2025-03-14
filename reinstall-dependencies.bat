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

echo ========================================
echo TERMINÉ
echo ========================================

echo Pour finaliser, exécutez reset-build.bat
pause
