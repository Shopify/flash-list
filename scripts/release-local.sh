#!/usr/bin/env bash
set -e

TARGET=$"/Users/talhanaqvi/src/github.com/Shopify/web-expo-flash/node_modules/@shopify/flash-list/dist" #target-path

npm run build

echo "copying build..."
echo "copying to $TARGET.."
rm -rf "$TARGET"
cp -r dist "$TARGET"

echo "copy complete."
