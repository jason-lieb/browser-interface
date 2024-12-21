#!/usr/bin/env bash

rm -rf ./service-worker/utils
mkdir ./service-worker/utils

find ./src/utils -type f -print0 | while IFS= read -r -d $'\0' file; do
    cp "$file" ./service-worker/utils
done
