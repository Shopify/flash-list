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
    // Reanimated plugin has to be listed last
    "react-native-reanimated/plugin",
  ],
  overrides: [
    {
      plugins: [
        [
          "@babel/plugin-transform-private-methods",
          {
            loose: true,
          },
        ],
      ],
    },
  ],
};
