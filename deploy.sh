#!/bin/bash
git pull origin main
git submodule sync
git submodule update --remote
export PLAYGROUND_ROOT=/var/www/playground.sixt.services
npm run build
echo "✅ Deploy fertig!"
