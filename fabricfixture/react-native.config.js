const path = require("path");

const root = path.resolve(__dirname, "../");

module.exports = {
  dependencies: {
    "@shopify/flash-list": {
      root,
      platforms: {
        ios: null,
      },
    },
  },
};
