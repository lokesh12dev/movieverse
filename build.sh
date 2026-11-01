#!/usr/bin/env bash
# MOVIEVERSE by Lokesh — Vercel build step.
# Materializes the static edge output (dist/) from the captured site assets.
set -euo pipefail
cd "$(dirname "$0")"

rm -rf dist
mkdir -p dist

# Static 3D/asset tree mirrors its live URL paths: /_next, /posters, /textures, /models, /favicon…
cp -R site/files/. dist/

# The login RSC artifacts are handled by the renderer function; skip them.
rm -rf dist/_html

echo "dist/ ready: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1)"
