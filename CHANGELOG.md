# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2022-10-11

- Expose `columnIndex` and `columnSpan` to `MasonryFlashList.renderItem`
  - https://github.com/Shopify/flash-list/pull/625

## [1.3.0] - 2022-09-26

- Added `MasonryFlashList` which adds support for rendering masonry layouts
  - https://github.com/Shopify/flash-list/pull/587

## [1.2.2] - 2022-09-06

- Fixes type checking error in `AutoLayoutView` due to `children` not being an explicit type
  - https://github.com/Shopify/flash-list/pull/567

## [1.2.1] - 2022-08-03

- Fixed crash when `estimatedListSize` is used in an empty list
  - https://github.com/Shopify/flash-list/pull/546

## [1.2.0] - 2022-07-18

- Fixed out of bound read from data
  - https://github.com/Shopify/flash-list/pull/523
- Added JS only fallbacks for unsupported platforms
  - https://github.com/Shopify/flash-list/pull/518
- Added footer correction in AutoLayoutView
  - https://github.com/Shopify/flash-list/pull/519
- Added `viewPosition` and `viewOffset` support scrollTo methods
  - https://github.com/Shopify/flash-list/pull/521
- Fix inverted mode while being horizontal
  - https://github.com/Shopify/flash-list/pull/520
- Upgrade recyclerlistview to v4.1.1
  - https://github.com/Shopify/flash-list/pull/526

## [1.1.0] - 2022-07-06

- Added render target info to `renderItem` callback
  - https://github.com/Shopify/flash-list/pull/454
- Add Apple TV support
  - https://github.com/Shopify/flash-list/pull/511
- Clarify installation instructions in Expo projects
  - https://github.com/Shopify/flash-list/pull/497
- Upgrade recyclerlistview to v4.0.1
  - https://github.com/Shopify/flash-list/pull/507
- Add tslib as a dependency
  - https://github.com/Shopify/flash-list/pull/514

## [1.0.4] - 2022-07-02

- Build fix for Android projects having `kotlinVersion` defined in `build.gradle`.
- Allow providing an external scrollview.
  - https://github.com/Shopify/flash-list/pull/502

## [1.0.3] - 2022-07-01

- Add kotlin-gradle-plugin to buildscript in project build.gradle
  - https://github.com/Shopify/flash-list/pull/481

## [1.0.2] - 2022-06-30

- Minor changes

## [1.0.1] - 2022-06-30

- `data` prop change will force update items only if `renderItem` is also updated
  - https://github.com/Shopify/flash-list/pull/453

## [1.0.0] - 2022-06-17

- Upgrade recyclerlistview to v3.3.0-beta.2
  - https://github.com/Shopify/flash-list/pull/445
- Added web support
  - https://github.com/Shopify/flash-list/pull/444
- Added `disableAutoLayout` prop to prevent conflicts with custom `CellRendererComponent`
  - https://github.com/Shopify/flash-list/pull/452

## [0.6.1] - 2022-05-26

- Fix amending layout on iOS
  - https://github.com/Shopify/flash-list/pull/412
- Define `FlashList` props previously inherited from `VirtualizedList` and `FlatList` explicitly
  - https://github.com/Shopify/flash-list/pull/386
- Make `estimatedItemSize` optional
  - https://github.com/Shopify/flash-list/pull/378
- Change `overrideItemType` prop name to `getItemType`
  - https://github.com/Shopify/flash-list/pull/369
- Added `useBlankAreaTracker` hook for tracking blank area in production
  - https://github.com/Shopify/flash-list/pull/411
- Added `CellRendererComponent` prop
  - https://github.com/Shopify/flash-list/pull/362
- Added automatic height measurement for horizontal lists even when parent isn't deterministic
  - https://github.com/Shopify/flash-list/pull/409

## [0.5.0] - 2022-04-29

- Fix finding props with testId
  - https://github.com/Shopify/flash-list/pull/357
- Reuse cached layouts on orientation change
  - https://github.com/Shopify/flash-list/pull/319

## [0.4.6] - 2022-04-13

- Match FlashList's empty list behavior with FlatList
  - https://github.com/Shopify/flash-list/pull/312

## [0.4.5] - 2022-04-13

- Upgrade recyclerlistview to v3.2.0-beta.4

  - https://github.com/Shopify/flash-list/pull/315

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
