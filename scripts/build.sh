#!/usr/bin/env bash

rm -rf ~/obsidian-browser-interface-extension/src/utils/background
mkdir ~/obsidian-browser-interface-extension/src/utils/background

find ~/obsidian-browser-interface-extension/src/utils -type f -print0 | while IFS= read -r -d $'\0' file; do
    cp "$file" ~/obsidian-browser-interface-extension/src/utils/background
done
