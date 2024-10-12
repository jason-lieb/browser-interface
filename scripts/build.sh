#!/usr/bin/env bash

rm -rf ~/browser-interface/service-worker/utils
mkdir ~/browser-interface/service-worker/utils

find ~/browser-interface/src/utils -type f -print0 | while IFS= read -r -d $'\0' file; do
    cp "$file" ~/browser-interface/service-worker/utils
done
