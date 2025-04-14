import * as fs from "fs";

import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export const pixelDifference = (
  referencePath: string,
  toMatchPath: string
): PNG | null => {
  const reference = PNG.sync.read(fs.readFileSync(referencePath));
  const toMatch = PNG.sync.read(fs.readFileSync(toMatchPath));
  const { width, height } = reference;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    reference.data,
    toMatch.data,
    diff.data,
    width,
    height,
    { threshold: 0.2 }
  );

  return numDiffPixels > 0 ? diff : null;
};
