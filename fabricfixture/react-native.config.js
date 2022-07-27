// TODO: figure out why adding flash-list to dependecies causes autolinking to freak out
module.exports = {
  dependencies: {
    '@shopify/flash-list': {
      platforms: {
        android: {
          libraryName: null,
          componentDescriptors: null,
          androidMkPath: null,
        },
      },
    },
  },
};
