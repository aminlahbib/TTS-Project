#!/bin/bash
# Fix for espeak-rs-sys build issue on macOS
# The build script's copy_folder function doesn't copy all files correctly
# This script ensures the espeak-ng source is properly copied

set -e

ESPEAK_CRATE_DIR="$HOME/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/espeak-rs-sys-0.1.9"
BUILD_DIRS=$(find target -type d -path "*/build/espeak-rs-sys-*/out/espeak-ng" 2>/dev/null || true)

if [ -z "$BUILD_DIRS" ]; then
    echo "No espeak-rs-sys build directories found. This is normal if you haven't built yet."
    exit 0
fi

for BUILD_DIR in $BUILD_DIRS; do
    ESPEAK_DST=$(dirname "$BUILD_DIR")
    if [ ! -f "$BUILD_DIR/CMakeLists.txt" ]; then
        echo "Fixing incomplete espeak-ng copy in $BUILD_DIR"
        rm -rf "$BUILD_DIR"
        cp -r "$ESPEAK_CRATE_DIR/espeak-ng" "$ESPEAK_DST/"
        echo "Fixed: $BUILD_DIR"
    fi
done

echo "espeak-rs-sys build fix complete"

