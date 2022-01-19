const path = require("path");
const root = path.resolve(__dirname, "../");

module.exports = {
  dependencies: {
    "@shopify/recycler-flat-list": {
      root,
      platforms: {
        ios: null
      }
    },
  },
};
