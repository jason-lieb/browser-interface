#!/usr/bin/env bash

if [ $# -ne 1 ] || [[ ! "$1" =~ ^(major|minor|patch)$ ]]; then
    echo "Usage: $0 <major|minor|patch>"
    exit 1
fi

CURRENT_VERSION=$(grep '"version":' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"

MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

case "$1" in
    "major")
        NEW_VERSION="$((MAJOR + 1)).0.0"
        ;;
    "minor")
        NEW_VERSION="$MAJOR.$((MINOR + 1)).0"
        ;;
    "patch")
        NEW_VERSION="$MAJOR.$MINOR.$((PATCH + 1))"
        ;;
esac

sed -i "s/version = \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/version = \"$NEW_VERSION\"/" flake.nix
sed -i "s/\"version\": \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/\"version\": \"$NEW_VERSION\"/" package.json
sed -i "s/\"version\": \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/\"version\": \"$NEW_VERSION\"/" manifest.json

npm install
