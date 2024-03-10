#!/usr/bin/env bash

rm -rf ~/obsidian-browser-interface-extension/service-worker/utils
mkdir ~/obsidian-browser-interface-extension/service-worker/utils

find ~/obsidian-browser-interface-extension/src/utils -type f -print0 | while IFS= read -r -d $'\0' file; do
    cp "$file" ~/obsidian-browser-interface-extension/service-worker/utils
done
