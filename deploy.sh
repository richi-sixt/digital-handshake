#!/bin/bash
# Pull, install and build. Restarting the server process is done separately.
set -euo pipefail
cd "$(dirname "$0")"

git pull --ff-only origin main
git submodule sync --recursive
git submodule update --init --recursive --remote
npm ci
npm run build
echo "✅ Build fertig!"
