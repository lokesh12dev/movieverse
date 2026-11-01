#!/usr/bin/env bash
# MOVIEVERSE by Lokesh — Vercel serves the *public/* directory as static output.
# After upgrading anything under site/files/, refresh the served layout:
#
#   bash build.sh
set -euo pipefail
cd "$(dirname "$0")"

rsync -a --exclude '_html' --exclude 'favicon.ico?*' site/files/ public/
mv public/_next public/next-assets

echo "public/ static tree refreshed: $(find public/next-assets public/posters public/textures public/models -type f 2>/dev/null | wc -l | tr -d ' ') asset files"
