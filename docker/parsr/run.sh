#!/bin/sh

set -e


echo "Starting par.sr API : node api/server/dist/index.js"
#exec node api/server/dist/index.js
cd api/server
exec node dist/index.js