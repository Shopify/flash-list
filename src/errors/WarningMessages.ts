export const WarningMessages = {
  keyExtractorNotDefinedForAnimation:
    "keyExtractor is not defined. This might cause the animations to not work as expected.",
  exceededMaxRendersWithoutCommit:
    "Exceeded max renders without commit. This might mean that you have duplicate keys in your keyExtractor output or your list is nested in a ScrollView causing a lot of items to render at once. " +
    "If it's none of those and is causing a real issue or error, consider reporing this on FlashList Github",
};
