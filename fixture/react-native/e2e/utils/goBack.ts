const goBack = async () => {
  await element(by.traits(["button"]))
    .atIndex(0)
    .tap();
};

export default goBack;
