---
id: manual-linking
title: Manual linking
---

## iOS

### Using 'Pods'

- Navigate to your iOS folder `cd ios`
- Add this line to your `Podfile` just below the last pod:

```ruby
pod 'RNFlashList', :path => '../node_modules/@shopify/flash-list'
```

- Run `pod install`

## Android

- Add project to `android/settings.gradle`:

```
include ':@shopify-flash-list'
project(':@shopify-flash-list').projectDir = new File(rootProject.projectDir, '../node_modules/@shopify/flash-list/android')
```

- In `android/app/build.gradle`, add to dependencies:

```diff
...
dependencies {
    ...
+   implementation project(':@shopify-flash-list')
}
```

- Finally, in `android/app/src/main/java/your/package/MainApplication.kt`:

```diff
package com.myapp;

+ import com.shopify.reactnative.flash_list.ReactNativeFlashListPackage

...

override fun getPackages(): List<ReactPackage> {
    val packages = PackageList(this).packages
    packages.add(ReactNativeFlashListPackage());
    return packages
}
```
