#!/usr/bin/env node
// Pure Node.js cross-platform static asset synchronization.
// Synchronizes site/files/ to public/ and renames _next to next-assets,
// ensuring zero dependency on host-level rsync.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_FILES = path.join(ROOT, "site", "files");
const PUBLIC = path.join(ROOT, "public");

function isExcluded(name) {
  if (name === "_html" || name === ".DS_Store" || name === "Thumbs.db") return true;
  if (name.startsWith("favicon.ico?")) return true;
  if (name.endsWith(".orig") || name.endsWith(".bak") || name.endsWith(".tmp")) return true;
  return false;
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (isExcluded(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  // 1. Synchronize site/files into public/
  copyRecursive(SITE_FILES, PUBLIC);

  // 2. Ensure public/_next is safely moved to public/next-assets
  const publicNext = path.join(PUBLIC, "_next");
  const publicNextAssets = path.join(PUBLIC, "next-assets");

  if (fs.existsSync(publicNext)) {
    fs.rmSync(publicNextAssets, { recursive: true, force: true });
    fs.renameSync(publicNext, publicNextAssets);
  }

  // 3. Count assets for diagnostic output
  let assetCount = 0;
  for (const sub of ["next-assets", "posters", "textures", "models", "snacks"]) {
    const targetDir = path.join(PUBLIC, sub);
    if (!fs.existsSync(targetDir)) continue;

    const countFiles = (dir) => {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.isDirectory()) {
          countFiles(path.join(dir, item.name));
        } else if (!isExcluded(item.name)) {
          assetCount++;
        }
      }
    };
    countFiles(targetDir);
  }

  console.log(`public/ static tree refreshed: ${assetCount} asset files`);
}

if (require.main === module) {
  main();
}

module.exports = { copyRecursive, isExcluded, main };
