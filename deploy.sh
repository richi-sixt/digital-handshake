#!/bin/bash
set -e

echo "Building static export..."
npm run build

echo "Preparing deploy package..."
rm -rf deploy
mkdir -p deploy

# Copy static export output
cp -r out/* deploy/

# Copy .htaccess for Apache (404 page, gzip, caching) if it exists
if [ -f .htaccess ]; then
  cp .htaccess deploy/.htaccess
fi

# Create zip
cd deploy
zip -r ../handshake-deploy.zip . -x "*.DS_Store"
cd ..

SIZE=$(du -sh handshake-deploy.zip | cut -f1)
FILES=$(unzip -l handshake-deploy.zip | tail -1 | awk '{print $2}')

echo ""
echo "Done! Created handshake-deploy.zip ($SIZE, $FILES files)"
echo ""
echo "To deploy:"
echo "  1. Upload handshake-deploy.zip contents to the server"
echo "  2. Apache serves the static files directly"
