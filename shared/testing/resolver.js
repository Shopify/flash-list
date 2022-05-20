// This file exports a custom Jest resolver (https://jestjs.io/docs/configuration#resolver-string)
// that adds support for the package.json `exports` field (https://nodejs.org/docs/latest-v12.x/api/packages.html#packages_exports).
//
// This resolver is required to support packages that only use `exports` to define
// their entrypoints.
//
// See https://github.com/facebook/jest/issues/9771 for details on this approach.

const enhancedResolve = require("enhanced-resolve");

const resolve = enhancedResolve.create.sync({
  conditionNames: ["require", "default", "node"],
  mainFields: ["main"],
  extensions: [
    ".ts",
    ".tsx",
    ".js",
    ".ios.js",
    ".android.js",
    ".mjs",
    ".json",
    ".node",
  ],
});

module.exports = function resolver(request, options) {
  return resolve(options.basedir, request);
};
