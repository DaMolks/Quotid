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

echo ========================================
echo TERMINÉ
echo ========================================
pause
