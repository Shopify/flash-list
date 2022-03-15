# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.2] - 2022-03-15

- Minor changes

## [0.3.1] - 2022-03-15

- Revert react-native-safe-area upgrade and minSdkVersion bump
  - https://github.com/Shopify/flash-list/pull/184

## [0.3.0] - 2022-03-15

- Fixed untranspiled library code by enforcing stricter TS rules.
  - https://github.com/Shopify/flash-list/pull/181

## [0.2.4] - 2022-03-14

- Added `onLoad` event that is called once the list has rendered items. This is required because FlashList doesn't render items in the first cycle.
  - https://github.com/Shopify/flash-list/pull/180

## [0.2.3] - 2022-03-10

- Fixing publish steps for transpiled code
  - https://github.com/Shopify/flash-list/pull/150

## [0.2.2] - 2022-03-10

- Fixing publish steps for transpiled code
  - https://github.com/Shopify/flash-list/pull/149

## [0.2.1] - 2022-03-09

- Bug fix for style and last separator
  - https://github.com/Shopify/flash-list/pull/141

## [0.2.0] - 2022-03-08

- Rename the component from `RecyclerFlatList` to `FlashList`
  - https://github.com/Shopify/flash-list/pull/140

## [0.1.0] - 2022-03-02

- Initial release
