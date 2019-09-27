#!/bin/sh

set -e

export PATH=$PATH:$PWD/node_modules/.bin

echo "Installing packages : npm install"
npm install

echo 

echo "Building typescript : npm run build:ts"
npm run build:ts

echo

echo "Installing packages for api/server : npm install --prefix  api/server"
npm install --prefix  api/server

echo 

echo "Building parsr API"
npm run --prefix api/server build