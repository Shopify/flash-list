---
name: upgrade-react-native
description: Upgrade the React Native fixture app to a new version. Covers JS deps, Android (Gradle, Kotlin, SDK), iOS (Podfile, pbxproj), Metro config, and third-party libraries.
---

# Upgrade React Native Fixture App

## Overview

The fixture app lives in `fixture/react-native/`. It is the primary test vehicle for FlashList on iOS and Android. The web fixture (`fixture/web/`) uses Expo and is independent — check it builds after the upgrade but it does not need the same dependency changes.

## Step 1 — Research the Target Version

1. Check the latest stable RN version:
   ```bash
   npm view react-native@latest version
   ```

2. Use the **rn-diff-purge** repo to see the exact template diff between your current and target version:
   ```
   https://raw.githubusercontent.com/react-native-community/rn-diff-purge/release/<version>/RnDiffApp/<file>
   ```
   Key files to fetch:
   - `package.json` — React version, CLI versions, dev dep versions
   - `android/build.gradle` — SDK versions, Kotlin version
   - `android/app/build.gradle` — plugin names, dependency patterns
   - `android/gradle.properties` — feature flags (newArch, hermes, edgeToEdge)
   - `android/gradle/wrapper/gradle-wrapper.properties` — Gradle version
   - `android/settings.gradle` — plugin management pattern
   - `android/app/src/main/java/com/rndiffapp/MainApplication.kt` — app initialization pattern
   - `ios/Podfile` — pod configuration, post_install hooks
   - `ios/RnDiffApp/AppDelegate.swift` — app delegate pattern
   - `metro.config.js` — Metro config API changes

3. Check **third-party library compatibility** with the target RN version:
   - `react-native-reanimated` — check [compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)
   - `react-native-gesture-handler` — supports 3 latest RN minors
   - `react-native-screens`, `react-native-safe-area-context` — usually latest works
   - `@react-navigation/*` — check for breaking changes
   - Any image library (`@d11/react-native-fast-image`, etc.)

## Step 2 — Update Dependencies

### `fixture/react-native/package.json`

Update in this order:
1. `react` and `react-native` — match the template
2. `@react-native/*` dev packages — must match the RN minor (e.g., `@react-native/babel-preset@0.84.1` for RN 0.84.1)
3. `@react-native-community/cli*` — match the template
4. Third-party native libraries — bump to versions compatible with the target RN
5. Any new peer dependencies (e.g., reanimated 4 requires `react-native-worklets`)

### Babel config

Check if any Babel plugins moved packages. Example: reanimated 4 moved `react-native-reanimated/plugin` to `react-native-worklets/plugin`.

### Metro config

Metro's internal module paths change between versions. Common breakage:
- `metro-config/src/defaults/exclusionList` — in newer Metro this moved to `metro-config/private/defaults/exclusionList` and exports a `.default` instead of a direct function
- Always verify the import works: `node -e "console.log(typeof require('<path>'))"`

## Step 3 — Update Android

### `android/build.gradle`
- `buildToolsVersion`, `compileSdkVersion`, `targetSdkVersion` — match template
- `kotlinVersion` — match template
- `ndkVersion` — match template (usually unchanged between minors)

### `android/gradle/wrapper/gradle-wrapper.properties`
- Update Gradle distribution URL to match template

### `android/gradle.properties`
- Remove deprecated flags (e.g., `android.enableJetifier`, `FLIPPER_VERSION`)
- Add new flags (e.g., `edgeToEdgeEnabled`)
- Update JVM args if template changed them

### `android/app/build.gradle`
- Update plugin names if changed (e.g., `kotlin-android` → `org.jetbrains.kotlin.android`)
- Remove unused imports (e.g., `import com.android.build.OutputFile`)
- Check `autolinkLibrariesWithApp()` is present

### `android/settings.gradle`
- Match template structure
- Remove manual project includes for pure-JS libraries (flash-list has no native Android code)

### `MainApplication.kt`
- **This changes significantly between major RN versions.** Always diff against the template.
- Preserve custom code: `AppPackage()` registration and `I18nUtil.allowRTL()` for RTL support.
- Key pattern changes across versions:
  - 0.79: `SoLoader.init()` + `DefaultNewArchitectureEntryPoint.load()` + `ReactNativeHost`
  - 0.84: `loadReactNative(this)` + `getDefaultReactHost()` with lazy delegate (no ReactNativeHost)

## Step 4 — Update iOS

### `ios/Podfile`
- Match template structure
- Remove deprecated env vars (e.g., `ENV['RCT_NEW_ARCH_ENABLED']` when new arch is the default)
- Remove deprecated helper calls (e.g., `get_default_flags()`)
- Keep project-specific customizations (`use_frameworks! :linkage => :static` if needed)

### `ios/FlatListPro.xcodeproj/project.pbxproj`
- Update `IPHONEOS_DEPLOYMENT_TARGET` to match the RN minimum (e.g., 15.1 for RN 0.76+)
- Pod install will update header search paths and build settings automatically

### `ios/FlatListPro/Info.plist`
- Add any new required plist keys (e.g., `RCTNewArchEnabled`)

### Clean install
```bash
cd fixture/react-native
rm -rf node_modules yarn.lock
yarn install
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

## Step 5 — Build and Verify

### Build the flash-list library first
```bash
yarn build   # from repo root — compiles src/ → dist/
```

### iOS
```bash
cd fixture/react-native
xcodebuild -workspace ios/FlatListPro.xcworkspace -scheme FlatListPro \
  -configuration Debug -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' build
```

### Android
```bash
cd fixture/react-native
yarn react-native run-android
```

### Web
```bash
cd fixture/web && yarn install && npx expo export --platform web
```

## Step 6 — Run Tests

### Unit tests
```bash
yarn test   # from repo root — 181+ tests must pass
```

### E2E tests (iOS)
```bash
cd fixture/react-native
yarn e2e:build:ios
yarn e2e:test:ios
```

**Screenshot reference updates**: Visual diff tests (e.g., Carousel orientation) will fail after an RN upgrade because rendering changes slightly. To regenerate references:
1. Delete the old reference directory (e.g., `e2e/artifacts/ios/Carousel_landscape/`)
2. Run the test — it creates a new reference and fails with "no reference present"
3. Run again — it passes using the new reference
4. Repeat for each failing screenshot (the test stops at the first missing reference per run)

## Common Pitfalls

- **Metro `exclusionList` import** — Metro's internal API paths change between versions. Always verify the import resolves before starting Metro.
- **Stale Metro on wrong port** — Kill ALL Metro instances before testing. Another project's Metro on a different port can cause "version mismatch" errors if the app connects to it.
- **`react-native-reanimated` major version** — Major bumps (3→4) require Babel plugin changes and may add new peer dependencies (`react-native-worklets`).
- **Gradle version jumps** — RN upgrades often bump Gradle (e.g., 8.x→9.x). This can break custom Gradle scripts. Check build warnings for deprecations.
- **`IPHONEOS_DEPLOYMENT_TARGET`** — Must match or exceed the RN minimum. Pod install updates most settings, but the project-level target in pbxproj must be set manually.
- **`Info.plist` new keys** — Some RN versions require new plist entries (e.g., `RCTNewArchEnabled`). Check the template's Info.plist diff.
- **Legacy arch removal** — Starting with RN 0.82+, legacy architecture code is being removed. Ensure all dependencies support new arch.
