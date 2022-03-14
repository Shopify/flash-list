# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Added `onLoadComplete` event that is called once the list has rendered items. This is required because FlashList doesn't render items in the first cycle.
  - https://github.com/Shopify/flash-list/pull/180

## [0.2.0] - 2022-03-08

- Rename the component from `RecyclerFlatList` to `FlashList`
  - https://github.com/Shopify/flash-list/pull/140

## [0.1.0] - 2022-03-02

- Initial release
