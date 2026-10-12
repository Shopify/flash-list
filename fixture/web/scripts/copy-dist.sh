#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "$0")/../../.." && pwd -P)"
SRC_DIST="$REPO_ROOT/dist"
NODE_MODULES_DIST="$REPO_ROOT/fixture/web/node_modules/@shopify/flash-list/dist"

if [[ ! -d "$SRC_DIST" || ! -d "$(dirname "$NODE_MODULES_DIST")" ]]; then
    echo "Build FlashList and install the web fixture before copying dist." >&2
    exit 1
fi

if [[ "${1:-}" != "--once" ]]; then
    command -v fswatch >/dev/null || {
        echo "Install fswatch to watch changes, or use --once for a single copy." >&2
        exit 1
    }
fi

# Function to copy dist directory
copy_dist() {
    echo "Copying dist folder to node_modules..."
    mkdir -p "$NODE_MODULES_DIST"
    if [[ "$(cd "$SRC_DIST" && pwd -P)" == "$(cd "$NODE_MODULES_DIST" && pwd -P)" ]]; then
        echo "The web fixture already links to the source dist; refusing to copy onto itself." >&2
        exit 1
    fi
    rsync -av --delete "$SRC_DIST/" "$NODE_MODULES_DIST/"

    echo "Copy completed at $(date)"
}

# Initial copy
echo "Initial copy of dist folder"
copy_dist

if [[ "${1:-}" == "--once" ]]; then
    exit 0
fi

# Watch for changes in the source dist directory
echo "Watching for changes in $SRC_DIST"
echo "Press Ctrl+C to stop watching"

fswatch -o "$SRC_DIST" | while read -r; do
    echo "Change detected in dist folder"
    copy_dist
done
