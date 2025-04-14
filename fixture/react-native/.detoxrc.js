/**
 * Detox configuration
 * https://wix.github.io/Detox/docs/introduction/project-setup
 *
 * @type {import('detox').DetoxConfig}
 */
module.exports = {
  testRunner: {
    $0: "jest",
    args: {
      config: "e2e/jest.config.js",
    },
  },
  apps: {
    "ios.release": {
      type: "ios.app",
      binaryPath:
        "ios/build/Build/Products/Release-iphonesimulator/FlatListPro.app",
      build:
        "export CODE_SIGNING_REQUIRED=NO && export RCT_NO_LAUNCH_PACKAGER=true && xcodebuild -workspace ios/FlatListPro.xcworkspace -scheme FlatListPro -configuration Release -sdk iphonesimulator -derivedDataPath ios/build -quiet -destination 'generic/platform=iOS Simulator'",
    },
    "android.release": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/release/app-release.apk",
      build:
        "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 15",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "React-Native-Phone",
      },
    },
  },
  configurations: {
    "ios.sim.release": {
      device: "simulator",
      app: "ios.release",
    },
    "android.emu.release": {
      device: "emulator",
      app: "android.release",
    },
  },
};
