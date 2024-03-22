import * as path from "path";
import * as fs from "fs";

import detox from "detox";
import { PNG } from "pngjs";

const ROOT_PATH = path.resolve(__dirname, "..");

const artifactsLocation = (testCaseName: string): string => {
  const platform = detox.device.getPlatform();
  const location = path.resolve(
    ROOT_PATH,
    `../e2e/artifacts/${platform}`,
    testCaseName
  );

  return location;
};

export const ensureArtifactsLocation = (name: string): string => {
  const location = artifactsLocation(name);

  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
  }

  return location;
};

export const wipeArtifactsLocation = (name: string) => {
  const location = artifactsLocation(name);

  if (fs.existsSync(location)) {
    fs.rmdirSync(location, { recursive: true });
  }
};

export const saveDiff = (diff: PNG, testName: string): string => {
  const diffsLocation = ensureArtifactsLocation("diff");
  const diffPath = path.resolve(diffsLocation, testName);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return diffPath;
};

export const saveReference = (referencePath: string, testName: string) => {
  const testArtifactsLocation = ensureArtifactsLocation(testName);
  const referenceName = path.resolve(testArtifactsLocation, `${testName}.png`);

  fs.renameSync(referencePath, referenceName);

  console.log(`Reference screenshot for test name "${testName}" was created`);
};

export const reference = (testName: string): string | null => {
  const testArtifactsLocation = ensureArtifactsLocation(testName);
  const referenceName = path.resolve(testArtifactsLocation, `${testName}.png`);
  return fs.existsSync(referenceName) ? referenceName : null;
};
