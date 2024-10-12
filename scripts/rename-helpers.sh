#!/usr/bin/env bash

filename=$(ls dist | grep -E '^_commonjsHelpers\.[^.]+\.js$' | awk '{print $1}')
new_filename=$(echo "$filename" | sed 's/^_//')
mv "dist/$filename" "dist/$new_filename"
sed -i "s|$filename|$new_filename|g" dist/src/main.js
