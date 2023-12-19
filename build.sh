#!/bin/bash

set -e

echo Build start
echo esbuild
node esbuild.mjs
if [[ -z "$1" || "$1" -ne spa ]]; then
	echo Full build
	cp -R app/server/ dist/server/
else
	echo SPA build
fi
cp app/client/* dist/client/ 2> /dev/null || :
cp -R app/client/images dist/client/
echo Build complete
