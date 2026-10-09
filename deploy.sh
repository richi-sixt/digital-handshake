#!/bin/bash
git pull origin main
git submodule sync
git submodule update --remote
npm ci
npm run build
echo "✅ Deploy fertig!"
