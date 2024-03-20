const path = require("path");

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
// eslint-disable-next-line import/no-extraneous-dependencies
const exclusionList = require("metro-config/src/defaults/exclusionList");
// eslint-disable-next-line import/no-extraneous-dependencies
const escape = require("escape-string-regexp");

const root = path.resolve(__dirname, "../..");
const packageJSON = require(path.join(root, "package.json"));
const modules = Object.keys({ ...packageJSON.peerDependencies });

const watchFolders = [
  root,
  // Local node_modules
  path.join(__dirname, "node_modules"),
  // Root node_modules
  path.join(root, "node_modules"),
];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

config.resolver.blockList = exclusionList(
  modules.map(
    (module) =>
      new RegExp(`^${escape(path.join(root, "node_modules", module))}\\/.*$`)
  )
);

config.resolver.extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, "node_modules", name);
  return acc;
}, {});

config.watchFolders = watchFolders;

module.exports = config;
