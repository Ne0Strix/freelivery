#!/bin/sh
set -e

cd /usr/src/app

# Install dependencies if node_modules is missing or stale
if [ ! -d node_modules ] || [ ! -f node_modules/.install-stamp ] || [ package.json -nt node_modules/.install-stamp ] || { [ -f package-lock.json ] && [ package-lock.json -nt node_modules/.install-stamp ]; }; then
    echo "[entrypoint] Installing dependencies..."
    npm install --silent
    date > node_modules/.install-stamp
fi

exec "$@"
