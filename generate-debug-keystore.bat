@echo off
REM Script to generate debug.keystore for Android
REM Run this script from the project root

REM Ensure the directory exists
if not exist android\app mkdir android\app

REM Generate the debug keystore
keytool -genkeypair ^
  -v ^
  -keystore android\app\debug.keystore ^
  -storepass android ^
  -alias androiddebugkey ^
  -keypass android ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -dname "CN=Android Debug,O=Android,C=US"

echo Debug keystore created at android\app\debug.keystore
