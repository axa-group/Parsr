#!/bin/sh

set -e

export PATH=$PATH:$PWD/node_modules/.bin

echo "Installing node packages : npm install"
npm install

echo 

echo "Installing python packages : pipenv install"
pipenv install

echo

echo "Building typescript : npm run build:ts"
npm run build:ts

echo

echo "Installing packages for api/server : npm install --prefix  api/server"
npm install --prefix  api/server

echo 

echo "Building parsr API"
npm run --prefix api/server build

echo

echo "Creating directory api/server/dist/output"
mkdir -p api/server/dist/output
chmod g+w api/server/dist/output