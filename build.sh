#!/usr/bin/env bash
# MOVIEVERSE by Lokesh — Vercel serves the *public/* directory as static output.
# After upgrading anything under site/files/, refresh the served layout:
#
#   bash build.sh
set -euo pipefail
cd "$(dirname "$0")"

if command -v node >/dev/null 2>&1; then
  node tools/build.js
else
  rsync -a --exclude '_html' --exclude 'favicon.ico?*' --exclude '*.orig' --exclude '*.bak' site/files/ public/
  rm -rf public/next-assets
  mv public/_next public/next-assets
  echo "public/ static tree refreshed: $(find public/next-assets public/posters public/textures public/models -type f 2>/dev/null | wc -l | tr -d ' ') asset files"
fi
