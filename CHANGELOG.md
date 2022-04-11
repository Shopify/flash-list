# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Add viewability callbacks
  - https://github.com/Shopify/flash-list/pull/301

- Calculate average item sizes automatically
  - https://github.com/Shopify/flash-list/pull/296

## [0.4.4] - 2022-04-06

- Fix `FlashList` mock when no data is provided
  - https://github.com/Shopify/flash-list/pull/295

## [0.4.3] - 2022-04-04

- Reduce number of render item calls

  - https://github.com/Shopify/flash-list/pull/253

- Upgrade recyclerlistview to v3.2.0-beta.2
  - https://github.com/Shopify/flash-list/pull/284

## [0.4.2] - 2022-04-04

- Minor changes

## [0.4.1] - 2022-03-29

- Crash fix for android activity switching (#256)

  - https://github.com/Shopify/flash-list/pull/257

- initialScrollIndex, scrollTo methods will now account for size of header

  - https://github.com/Shopify/flash-list/pull/194

- Added a new mock for easier testing of components with `FlashList`
  - https://github.com/Shopify/flash-list/pull/236

## [0.4.0] - 2022-03-23

- Add support for layout animations

  - https://github.com/Shopify/flash-list/pull/183

- Suppress recyclerlistview's bounded size exception for some missing cases.

  - https://github.com/Shopify/flash-list/pull/192

- Expose reference to recyclerlistview and firstItemOffset

  - https://github.com/Shopify/flash-list/pull/217

- recyclerlistview upgraded to v3.1.0-alpha.9
  - https://github.com/Shopify/flash-list/pull/227

## [0.3.3] - 2022-03-16

- Prevent implicit scroll to top on device orientation change
- Change recyclerlistview's bounded size exception to a warning
  - https://github.com/Shopify/flash-list/pull/187

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
