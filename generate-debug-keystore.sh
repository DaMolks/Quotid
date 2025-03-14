#!/bin/bash
# Script to generate debug.keystore for Android
# Run this script from the project root

# Ensure the directory exists
mkdir -p android/app

# Generate the debug keystore
keytool -genkeypair \
  -v \
  -keystore android/app/debug.keystore \
  -storepass android \
  -alias androiddebugkey \
  -keypass android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Android Debug,O=Android,C=US"

echo "Debug keystore created at android/app/debug.keystore"
