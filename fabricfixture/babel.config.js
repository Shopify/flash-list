module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
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
