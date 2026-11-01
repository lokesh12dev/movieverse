#!/usr/bin/env bash
# MOVIEVERSE by Lokesh — the static edge layout is committed at the repository root.
# The Vercel deployment itself needs no build step: files are served as-is.
# Run this after you upgrade anything under site/files/ to refresh the root layout:
#
#   bash build.sh
set -euo pipefail
cd "$(dirname "$0")"

# Static tree mirrors the live URL paths: /_next, /posters, /textures, /models, /favicon…
rsync -a --exclude '_html' --exclude 'favicon.ico?*' site/files/ ./

echo "Root static tree refreshed: $(find _next posters textures models -type f 2>/dev/null | wc -l | tr -d ' ') asset files"
