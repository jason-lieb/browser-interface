#!/usr/bin/env bash

rm -rf ~/obsidian-browser-interface-extension/js/utils/background
mkdir ~/obsidian-browser-interface-extension/js/utils/background

# for file in $(find ~/obsidian-browser-interface-extension/js/utils -type f -print0); do
find ~/obsidian-browser-interface-extension/js/utils -type f -print0 | while IFS= read -r -d $'\0' file; do
    cp "$file" ~/obsidian-browser-interface-extension/js/utils/background
done
