const { execSync } = require('child_process');
process.chdir('/home/runner/work/flash-list/flash-list/fixture/react-native');
process.env.ANDROID_HOME = '/usr/local/lib/android/sdk';
process.env.JAVA_HOME = '/opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/17.0.18-8/x64';
try {
  execSync('./android/gradlew -p android app:assembleDebug', {
    stdio: 'inherit',
    timeout: 600000,
  });
  console.log('BUILD SUCCEEDED');
} catch (e) {
  console.error('BUILD FAILED:', e.message);
  process.exit(1);
}
