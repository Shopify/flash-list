#!/bin/bash
set -e
cd /home/runner/work/flash-list/flash-list/fixture/react-native
export ANDROID_HOME=/usr/local/lib/android/sdk
export JAVA_HOME=/opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/17.0.18-8/x64
./android/gradlew -p android app:assembleDebug 2>&1
