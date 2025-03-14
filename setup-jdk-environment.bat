@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo    INSTALLATION ET CONFIGURATION AUTOMATIQUE DU JDK
echo ========================================================
echo.

REM Vérifier si nous sommes en mode administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Ce script nécessite des privilèges administrateur.
    echo Veuillez l'exécuter en tant qu'administrateur.
    echo Clic droit sur le fichier -^> Exécuter en tant qu'administrateur
    pause
    exit /b 1
)

REM Création du répertoire de téléchargement
if not exist "%TEMP%\jdk_setup" mkdir "%TEMP%\jdk_setup"
cd /d "%TEMP%\jdk_setup"

REM Définition de variables
set JDK_VERSION=17.0.9
set JDK_DOWNLOAD_URL=https://download.oracle.com/java/17/archive/jdk-17.0.9_windows-x64_bin.zip
set JDK_FILENAME=jdk-17.0.9_windows-x64_bin.zip
set INSTALL_DIR=C:\Java\jdk-17

echo Étape 1: Téléchargement du JDK %JDK_VERSION%...
echo.
echo Téléchargement de %JDK_DOWNLOAD_URL%
echo vers %TEMP%\jdk_setup\%JDK_FILENAME%
echo.
echo Cela peut prendre quelques minutes, veuillez patienter...
echo.

REM Téléchargement du JDK
powershell -Command "(New-Object Net.WebClient).DownloadFile('%JDK_DOWNLOAD_URL%', '%JDK_FILENAME%')"

if not exist "%JDK_FILENAME%" (
    echo Échec du téléchargement automatique.
    echo.
    echo Veuillez télécharger manuellement le JDK 17 depuis:
    echo https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
    echo.
    echo Ou utiliser le JDK intégré à Android Studio:
    echo 1. Ouvrez Android Studio
    echo 2. Allez dans File ^> Project Structure
    echo 3. Sous SDK Location, configurez JDK Location pour utiliser le JDK embarqué
    echo    (généralement C:\Program Files\Android\Android Studio\jbr)
    echo.
    pause
    exit /b 1
)

echo Étape 2: Extraction du JDK...
echo.

REM Création du répertoire d'installation
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Extraction du zip
powershell -Command "Expand-Archive -Path '%JDK_FILENAME%' -DestinationPath '%TEMP%\jdk_setup\extracted' -Force"

REM Déplacement du contenu vers le répertoire d'installation
xcopy /E /I /Y "%TEMP%\jdk_setup\extracted\jdk-*" "%INSTALL_DIR%\"

echo Étape 3: Configuration des variables d'environnement...
echo.

REM Configuration de JAVA_HOME
setx JAVA_HOME "%INSTALL_DIR%" /M
if %errorlevel% neq 0 (
    echo Erreur lors de la définition de JAVA_HOME.
    goto error
)

REM Ajout au PATH
for /F "tokens=2* delims= " %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path ^| findstr /i "PATH"') do set CURRENT_PATH=%%B
setx PATH "%CURRENT_PATH%;%INSTALL_DIR%\bin" /M
if %errorlevel% neq 0 (
    echo Erreur lors de la mise à jour du PATH.
    goto error
)

echo Étape 4: Vérification de l'installation...
echo.

REM Mettre à jour les variables d'environnement pour la session actuelle
set "JAVA_HOME=%INSTALL_DIR%"
set "PATH=%PATH%;%INSTALL_DIR%\bin"

REM Vérification de l'installation
java -version
if %errorlevel% neq 0 (
    echo Erreur: Java n'est pas correctement installé.
    goto error
)

REM Vérification de keytool
keytool -help > nul 2>&1
if %errorlevel% neq 0 (
    echo Avertissement: keytool n'est pas accessible. Vérifiez votre PATH.
    echo Vous devrez peut-être redémarrer votre ordinateur pour que les changements prennent effet.
) else (
    echo keytool est correctement configuré.
)

echo Étape 5: Génération du debug.keystore...
echo.

REM Retour au répertoire du projet
cd /d "%~dp0"

REM Création du répertoire android/app s'il n'existe pas
if not exist "android\app" mkdir "android\app"

REM Génération du keystore
"%INSTALL_DIR%\bin\keytool" -genkeypair -v -keystore android\app\debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"

if %errorlevel% neq 0 (
    echo Erreur lors de la génération du keystore.
    goto error
) else (
    echo Le fichier debug.keystore a été généré avec succès dans android\app\debug.keystore
)

echo Étape 6: Nettoyage des fichiers temporaires...
echo.

REM Nettoyage
cd /d "%~dp0"
rmdir /S /Q "%TEMP%\jdk_setup"

echo ========================================================
echo    INSTALLATION TERMINÉE AVEC SUCCÈS
echo ========================================================
echo.
echo Le JDK %JDK_VERSION% a été installé dans %INSTALL_DIR%
echo JAVA_HOME est défini comme %INSTALL_DIR%
echo Le PATH a été mis à jour pour inclure le bin du JDK
echo.
echo Pour que les modifications prennent pleinement effet:
echo 1. Redémarrez votre ordinateur
echo 2. Redémarrez Android Studio
echo 3. Dans Android Studio, allez dans:
echo    File ^> Project Structure ^> SDK Location
echo    Et définissez JDK Location à: %INSTALL_DIR%
echo.
echo Après redémarrage, vous pouvez exécuter 'java -version' et 'keytool -help' 
echo pour vérifier que tout fonctionne correctement.
echo.
pause
exit /b 0

:error
echo.
echo Une erreur s'est produite lors de l'installation.
echo Vous pouvez essayer d'installer manuellement le JDK depuis:
echo https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
echo.
pause
exit /b 1
