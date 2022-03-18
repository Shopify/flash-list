const path = require("path");

module.exports = {
  verbose: true,
  preset: "react-native",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx|js)"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)",
  ],
};
