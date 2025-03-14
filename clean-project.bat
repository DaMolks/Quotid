@echo off
echo Cleaning Android build...

REM Navigate to android directory
cd android

REM Clean the Gradle project
call gradlew clean

REM Delete Gradle cache directories if needed
REM Uncomment the next lines if you want to perform a deeper clean
REM echo Deleting Gradle cache...
REM rmdir /S /Q %USERPROFILE%\.gradle\caches\transforms-3
REM rmdir /S /Q %USERPROFILE%\.gradle\caches\modules-2\files-2.1

REM Return to project root
cd ..

echo Cleaning Node modules...
REM Remove node_modules directory (optional, uncomment if needed)
REM rmdir /S /Q node_modules

REM Clean metro bundler cache
echo Cleaning Metro bundler cache...
if exist node_modules\.cache rmdir /S /Q node_modules\.cache
if exist %TEMP%\metro-* del /S /Q %TEMP%\metro-*

echo Clean completed. You may now run:
echo npm install
echo cd android ^&^& gradlew build
