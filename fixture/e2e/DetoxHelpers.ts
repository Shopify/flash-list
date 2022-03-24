import * as path from "path";
import * as fs from "fs";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const ROOT_PATH = path.resolve(__dirname, "..");

export function pixelDifference(
  referencePath: string,
  toMatchPath: string
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

export function ensureArtifactsLocation(
  name: string,
  platform: string
): string {
  const location = path.resolve(ROOT_PATH, `e2e/artifacts/${platform}`, name);
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
  }

  return location;
}

export function wipeArtifactsLocation(name: string, platform: string) {
  const location = path.resolve(ROOT_PATH, `e2e/artifacts/${platform}`, name);

  if (fs.existsSync(location)) {
    fs.rmdirSync(location, { recursive: true });
  }
}

export function saveDiff(diff: PNG, testName: string, platform: string) {
  const diffsLocation = ensureArtifactsLocation(`diffs`, platform);
  const diffPath = path.resolve(diffsLocation, testName);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
}
