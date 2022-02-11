#!/usr/bin/env node

import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";
import readline from "readline";

import chalk from "chalk";
import glob from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_PATH = path.resolve(__dirname, "..");
const results = [];

const artifactsLocation = path.resolve(ROOT_PATH, "tmp/detox_artifacts/");

const buildiOSRelease = () => {
  console.log(chalk.bold("🔁 Building iOS release app for e2e tests"));

  execSync(`detox build -c ios.sim.release`, {
    stdio: "inherit",
    cwd: ROOT_PATH,
  });
};

const runTestOnTwitterTimeline = () => {
  console.log(chalk.bold("🔁 Running e2e tests to generate logs"));

  execSync(
    `detox test -c ios.sim.release --artifacts-location ${artifactsLocation} `,
    { stdio: "inherit", cwd: ROOT_PATH }
  );
};

const readPostTestLogs = () => {
  return new Promise((resolve, reject) => {
    console.log(chalk.bold("🔁 Reading logs to collect the metrics"));

    const files = glob.sync(`${artifactsLocation}/**/**/device.log`);

    if (files.length === 0) {
      reject(Error("There is no log file present"));
    }

    const fileStream = fs.createReadStream(files[0]);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    rl.on("line", function (line) {
      const blankAreaKey = "Blank area: ";
      const blankAreaKeyLineIndex = line.indexOf(blankAreaKey);
      if (blankAreaKeyLineIndex > 0) {
        const result = Number(
          line.substring(blankAreaKeyLineIndex + blankAreaKey.length)
        );
        results.push(result);
      }
    });

    rl.on("close", function (line) {
      return resolve(results);
    });
  });
};

const cleanArtifacts = () => {
  console.log(chalk.bold("🧹 Cleaning artifacts.."));

  fs.rmSync(artifactsLocation, { recursive: true, force: true });
};

const runiOSBlankAreaMeasurements = async (runsCount) => {
  buildiOSRelease();

  let run = 0;
  do {
    run += 1;

    console.log(chalk.bold(`🧪 Test number: ${run}`));

    runTestOnTwitterTimeline();

    const measurememnts = await readPostTestLogs();

    const averageSum = measurememnts.reduce(
      (first, second) => first + second,
      0
    );
    const result = averageSum / measurememnts.length;

    console.log(chalk.bold(`✅ Average blank area for test number: ${result}`));

    cleanArtifacts();
  } while (run < runsCount);
};

runiOSBlankAreaMeasurements(5);
