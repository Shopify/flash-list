const path = require("path");

module.exports = {
  verbose: true,
  preset: "react-native",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js)"],
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)",
  ],
  resolver: path.join(__dirname, "./shared/testing/resolver.js"),
};
