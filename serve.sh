#!/bin/bash
# auto-reloading development server

set -e
set -a
. .env
set +a
APPPORT=3000

./node_modules/.bin/browser-sync start --port 9000 --proxy localhost:$APPPORT --no-open -f dist/client &
BSPID=$!
echo BrowserSync PID $BSPID
if [[ -z "$1" || "$1" -ne spa ]]; then
	(fswatch -ol 1 app | xargs -n1 -I{} ./build.sh) &
	npm run nodemon
else
	echo Server in SPA mode
	(fswatch -ol 1 app/client | xargs -n1 -I{} ./build.sh spa) &
	npx http-server dist/client/ -p $APPPORT
fi
trap "kill $BSPID $ESPID" INT HUP TERM QUIT ABRT EXIT
