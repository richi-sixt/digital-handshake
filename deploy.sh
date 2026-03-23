#!/bin/bash
git pull origin main
git submodule sync
git submodule update --remote
npm run build
echo "✅ Deploy fertig!"
