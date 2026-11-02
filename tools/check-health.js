#!/usr/bin/env node
// Comprehensive Health and Parity Verification Suite for MOVIEVERSE by Lokesh
// Tests local server synthesis, Vercel serverless renderer, route coverage,
// static assets, and template integrity.
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const {
  MOVIES,
  getMovie,
  getTheatreName,
  synthesizeBookPage,
  synthesizeMoviePage,
  extractRsc,
} = require("../server.js");
const renderHandler = require("../api/render-core.js");

let passed = 0;
let failed = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`  ✓ ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${title}:`, err.message);
    failed++;
  }
}

async function checkAsync(title, fn) {
  try {
    await fn();
    console.log(`  ✓ ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${title}:`, err.message);
    failed++;
  }
}

function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    body: "",
    writeHead(code, headers) {
      res.statusCode = code;
      Object.assign(res.headers, headers);
    },
    end(data) {
      res.body = data || "";
    },
  };
  return res;
}

async function runTests() {
  console.log("\n🎬 MOVIEVERSE — Running Production Health & Verification Suite...\n");

  // 1. Catalog Tests
  console.log("1. Movie Catalog & Metadata:");
  check("Catalog has 58 authentic movie entries", () => {
    const movieCount = Object.keys(MOVIES).length;
    assert(movieCount >= 58, `Expected at least 58 movies, found ${movieCount}`);
  });

  check("getMovie fallback produces valid object for arbitrary slug", () => {
    const m = getMovie("custom-future-film");
    assert.strictEqual(m.slug, "custom-future-film");
    assert.strictEqual(m.title, "Custom Future Film");
    assert(Array.isArray(m.genres) && m.genres.length > 0);
  });

  check("getTheatreName resolves predefined and custom theatre IDs", () => {
    assert.strictEqual(getTheatreName("chennai-t-nagar-0"), "Nova Cinemas: T. Nagar");
    const custom = getTheatreName("mumbai-bandra-west-1");
    assert(custom.includes("Bandra West") && custom.includes("Mumbai"), `Unexpected: ${custom}`);
  });

  // 2. Static Assets Integrity
  console.log("\n2. Static Assets & Brand Integrity:");
  check("Core brand icons and assets exist in public/", () => {
    for (const img of ["cinema.png", "movie-ticket.png", "logo.png", "icon.png", "favicon.ico"]) {
      assert(fs.existsSync(path.join(PUBLIC, img)), `Missing brand asset: ${img}`);
    }
  });

  check("3D model seat.glb exists and has non-zero size", () => {
    const glbPath = path.join(PUBLIC, "models", "seat.glb");
    assert(fs.existsSync(glbPath), "seat.glb missing");
    assert(fs.statSync(glbPath).size > 1000, "seat.glb is suspiciously small");
  });

  check("PBR theater textures exist in public/textures/", () => {
    const textures = [
      "hessian_230_diff.jpg",
      "hessian_230_nor.jpg",
      "velour_velvet_diff.jpg",
      "wooden_panels_diff.jpg",
    ];
    for (const t of textures) {
      assert(fs.existsSync(path.join(PUBLIC, "textures", t)), `Texture missing: ${t}`);
    }
  });

  check("Posters exist for all catalog movies", () => {
    let missingPosters = 0;
    for (const slug of Object.keys(MOVIES)) {
      const p = path.join(PUBLIC, "posters", `${slug}.webp`);
      if (!fs.existsSync(p)) missingPosters++;
    }
    assert.strictEqual(missingPosters, 0, `Missing ${missingPosters} posters`);
  });

  check("No leftover backup or temp files (.orig, .bak)", () => {
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === ".git" || entry.name === "node_modules") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else {
          assert(!entry.name.endsWith(".orig"), `Found leftover .orig: ${full}`);
          assert(!entry.name.endsWith(".bak"), `Found leftover .bak: ${full}`);
        }
      }
    };
    walk(ROOT);
  });

  // 3. Synthesis & RSC extraction
  console.log("\n3. Synthesis & RSC Payload Parity:");
  check("synthesizeBookPage produces valid personalized HTML and title", () => {
    const html = synthesizeBookPage("toxic", {
      city: "chennai",
      theatre: "chennai-t-nagar-0",
      time: "18:00",
      format: "IMAX 2D",
    });
    assert(html.includes("Pick your seats — Toxic · MOVIEVERSE by Lokesh"), "Title mismatch");
    assert(html.includes("18:00") || html.includes("6:00 PM"), "Time mismatch");
    const rsc = extractRsc(html);
    assert(rsc.length > 500, "RSC payload too short");
    assert(rsc.includes("toxic"), "RSC does not mention slug");
  });

  check("synthesizeMoviePage generates dynamic page for un-baked titles", () => {
    const html = synthesizeMoviePage("spider-verse");
    assert(html.includes("Spider-Man: Beyond Spider-Verse"), "Title not synthesized");
  });

  // 4. Serverless Renderer Simulation (api/render-core.js)
  console.log("\n4. Vercel Serverless Function Parity (api/render-core.js):");
  await checkAsync("Render root home (GET /)", async () => {
    const req = { url: "/", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.headers["content-type"].includes("text/html"));
    assert(res.body.includes("MOVIEVERSE"));
  });

  await checkAsync("Render root home RSC (GET /?_rsc=1)", async () => {
    const req = { url: "/?_rsc=1", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.headers["content-type"].includes("text/x-component"));
  });

  await checkAsync("Render bookings page (GET /bookings)", async () => {
    const req = { url: "/bookings", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.includes("My tickets"));
  });

  await checkAsync("Render login page (GET /login)", async () => {
    const req = { url: "/login", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
  });

  await checkAsync("Render _login prefetch route (GET /_login)", async () => {
    const req = { url: "/_login", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.includes("Sign in"), "Did not render login template");
  });

  await checkAsync("Render movie route (GET /movie/varanasi)", async () => {
    const req = { url: "/movie/varanasi", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.includes("Varanasi"));
  });

  await checkAsync("Render book route (GET /book/demon-slayer-castle?city=chennai)", async () => {
    const req = { url: "/book/demon-slayer-castle?city=chennai", headers: {} };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.includes("Demon Slayer: Infinity Castle"));
  });

  await checkAsync("Support Vercel rewrite with x-matched-path header", async () => {
    const req = {
      url: "/api/render/route",
      headers: { "x-matched-path": "/movie/toxic" },
    };
    const res = mockRes();
    await renderHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert(res.body.includes("Toxic"));
  });

  // Summary
  console.log(`\n======================================================`);
  console.log(`  Tests completed: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
