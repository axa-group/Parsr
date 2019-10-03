#!/bin/sh

set -e

cd demo/vue-viewer

echo "Installing modules"
npm install

echo

echo "Building UI"
npm run build