module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "@react-native-community",
    "plugin:@shopify/typescript",
    "plugin:@shopify/react",
    "plugin:@shopify/prettier",
  ],
  parserOptions: {
    ecmaVersion: 6,
  },
  rules: {
    "@shopify/images-no-direct-imports": "off",
    "@shopify/jest/no-snapshots": "off",
    "@shopify/jsx-no-hardcoded-content": "off",
    "@shopify/jest/no-vague-titles": "off",
    "@shopify/jsx-no-complex-expressions": "off",
    "@shopify/react-prefer-private-members": "off",
    "eslint-comments/disable-enable-pair": "off",
    "import/no-cycle": "off",
    "import/no-named-as-default": "off",
    "max-params": "off",
    "max-len": [
      "error",
      {
        code: 200,
      },
    ],
    "no-console": "off",
    "no-extend-native": "off",
    "no-process-env": "off",
    "no-warning-comments": "off",
    "react/jsx-no-bind": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-native/no-inline-styles": "off",
    "react-native/no-unused-styles": "error",
    "require-atomic-updates": "off",
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/consistent-indexed-object-style": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "jsx-a11y/no-autofocus": "off",
  },
  overrides: [
    {
      files: ["*.test.ts", "*.test.tsx"],
      rules: {
        "dot-notation": "off",
      },
    },
  ],
  ignorePatterns: ["node_modules", "coverage", "dist", "build", "lib"],
  env: {
    jest: true,
  },
};
