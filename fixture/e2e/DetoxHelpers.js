const path = require("path");
const fs = require("fs");
const pixelmatch = require("pixelmatch");
const { PNG } = require("pngjs");
const { execSync } = require("child_process");

const ROOT_PATH = path.resolve(__dirname, "..");

export function pixelDifference(
  referencePath: String,
  toMatchPath: String
): PNG | null {
  const reference = PNG.sync.read(fs.readFileSync(referencePath));
  const toMatch = PNG.sync.read(fs.readFileSync(toMatchPath));
  const { width, height } = reference;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    reference.data,
    toMatch.data,
    diff.data,
    width,
    height
  );

  return numDiffPixels > 0 ? diff : null;
}

export async function setDemoMode() {
  if (device.getPlatform() === "ios") {
    await device.setStatusBar({
      time: "12:34",
      dataNetwork: "wifi",
      wifiBars: "3",
      batteryState: "charging",
      batteryLevel: "100",
    });
  } else {
    // enter demo mode
    execSync("adb shell settings put global sysui_demo_allowed 1");
    // display time 12:00
    execSync(
      "adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200"
    );
    // Display full mobile data with 4g type and no wifi
    execSync(
      "adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile show -e level 4 -e datatype 4g -e wifi false"
    );
    // Hide notifications
    execSync(
      "adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false"
    );
    // Show full battery but not in charging state
    execSync(
      "adb shell am broadcast -a com.android.systemui.demo -e command battery -e plugged false -e level 100"
    );
  }
}

export function ensureArtifactsLocation(
  name: String,
  platform: String
): String {
  const location = path.resolve(ROOT_PATH, `e2e/artifacts/${platform}`, name);
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
  }

  return location;
}

export function wipeArtifactsLocation(name: String, platform: String): String {
  const location = path.resolve(ROOT_PATH, `e2e/artifacts/${platform}`, name);

  if (fs.existsSync(location)) {
    fs.rmdirSync(location, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}

export function saveDiff(diff: PNG, testName: String, platform: String) {
  const diffsLocation = ensureArtifactsLocation(`diffs`, platform);
  const diffPath = path.resolve(diffsLocation, testName);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
}
