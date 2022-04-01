module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    "react-native-reanimated/plugin",
    [
      "module-resolver",
      {
        root: "./src",
        cwd: "babelrc",
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
          assets: "./src/assets",
        },
      },
    ],
  ],
};
