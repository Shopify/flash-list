const path = require("path");

const exclusionList = require("metro-config/src/defaults/exclusionList");
const escape = require("escape-string-regexp");

const package = require("../package.json");

const modules = Object.keys({
  ...package.peerDependencies,
});

const root = path.resolve(__dirname, "..");

let watchFolders = [root];
watchFolders = watchFolders.concat([path.join(__dirname, "./node_modules")]);
watchFolders = watchFolders.concat([path.join(__dirname, "../node_modules")]);

module.exports = (() => {
  const config = {
    projectRoot: __dirname,
    transformer: {
      getTransformOptions: () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      blockList: exclusionList(
        modules.map(
          (m) =>
            new RegExp(`^${escape(path.join(root, "node_modules", m))}\\/.*$`)
        )
      ),

      extraNodeModules: modules.reduce((acc, name) => {
        acc[name] = path.join(__dirname, "node_modules", name);
        return acc;
      }, {}),
    },
    watchFolders,
  };
  if (process.env.CI === "true") {
    config.maxWorkers = 1;
  }
  return config;
})();
