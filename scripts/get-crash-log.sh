#!/bin/bash
# Navigate to native recycler test and capture crash log
adb shell logcat -c
adb shell am start -n com.flatlistpro/.MainActivity
sleep 10

# Clear logcat then trigger the crash
adb shell logcat -c
# We'll capture logcat in background, trigger the test, then read
adb shell logcat -d -t 2000 2>/dev/null | grep -iE "FATAL|AndroidRuntime|NativeFlashList|flash_list|ViewManager|requireNativeComponent" | tail -50
