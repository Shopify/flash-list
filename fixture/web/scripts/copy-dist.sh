#!/bin/bash

# Define source and destination paths
SRC_DIST="$(pwd)/dist"
NODE_MODULES_DIST="$(pwd)/fixture/web/node_modules/@shopify/flash-list/dist"
WEB_FIXTURE_DIST="$(pwd)/fixture/web/dist"

# Function to copy dist directory
copy_dist() {
    echo "Copying dist folder to node_modules..."
    mkdir -p "$NODE_MODULES_DIST"
    rsync -av --delete "$SRC_DIST/" "$NODE_MODULES_DIST/"

    echo "Copy completed at $(date)"
}

# Initial copy
echo "Initial copy of dist folder"
copy_dist

# Watch for changes in the source dist directory
echo "Watching for changes in $SRC_DIST"
echo "Press Ctrl+C to stop watching"

fswatch -o "$SRC_DIST" | while read -r; do
    echo "Change detected in dist folder"
    copy_dist
done
