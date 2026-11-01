#!/usr/bin/env node
// One-shot generator: derives api/_pages_*.js + api/render.js supports from server.js + site/
// so the Vercel function stays in 1:1 sync with the local server.
// Bundles are split per route so lambda cold starts only parse the HTML they render.
const fs = require("fs");
const path = require("path");
const EXEC_DIR = path.join(__dirname, "..");

const SITE = path.join(EXEC_DIR, "site");
const API = path.join(EXEC_DIR, "api");

function emitBundle(name, map) {
  const out =
    "// AUTO-GENERATED from site/ by tools/build-render.js — do not edit by hand.\n" +
    "module.exports = " + JSON.stringify(map) + ";\n";
  fs.writeFileSync(path.join(API, name), out);
  console.log(
    "api/" + name + ": " + Object.keys(map).length + " pages, " + (out.length / 1024 / 1024).toFixed(2) + " MB"
  );
}

const all = {};
for (const f of fs.readdirSync(SITE)) {
  if (f.endsWith(".html")) all[f] = fs.readFileSync(path.join(SITE, f), "utf8");
}

// Home speed pass: the captured HTML preloads 51 posters at once — every hint
// races the LCP image/critical JS for first-paint bandwidth. Keep the first
// POSTER_PRELOADS (above-the-fold carousel + first strip slots); the rest load
// naturally as React mounts their <img> (eager/lazy already encoded in capture).
const POSTER_PRELOADS = 6;
const homeRaw = all["index.html"];
{
  const cliff = new RegExp('[ ]{2,}||$');
  let n = 0;
  const trimmed = homeRaw.replace(/<link rel="preload" as="image" href="\/posters\/[^"]*"[^>]*>/g, (m) => {
    if (n++ < POSTER_PRELOADS) return m;
    return "";
  });
  if (n > POSTER_PRELOADS) {
    all["index.html"] = trimmed;
    console.log("home preloads trimmed:", n, "->", POSTER_PRELOADS);
  }
}

// Capture-time faithful hero: Vercel's deployment screenshot bot shoots "/" in a
// headless, GPU-less browser before the 3D hall mounts, producing a black frame.
// In headless contexts ONLY (navigator.webdriver / HeadlessChrome), this paints
// an instant 2D preview mirroring the live hero. Real visitors are untouched.
const CAPTURE_PREVIEW_SNIPPET = "<script>(function(){try{if(!(navigator.webdriver||/Headless/i.test(navigator.userAgent)))return;var run=function(){if(document.querySelector('[data-capture-preview]'))return;var d=document.createElement('div');d.setAttribute('data-capture-preview','');d.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#0a0b10;overflow:hidden';d.innerHTML='<img src=\"/posters/avengers-doomsday.webp\" alt=\"\" style=\"position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05) brightness(.92)\"><div style=\"position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 6%,rgba(0,0,0,.05),rgba(5,6,10,.92) 78%)\"></div><div style=\"position:absolute;left:0;right:0;top:6.5%;text-align:center;z-index:2\"><div style=\"color:#fff;font-weight:800;font-size:clamp(30px,6vw,64px);letter-spacing:.01em;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-shadow:0 2px 24px rgba(0,0,0,.6)\">MOVIE<span style=\"color:#f5c84c\">VERSE</span></div><div style=\"color:rgba(255,255,255,.75);letter-spacing:.45em;font-size:11px;font-weight:700;margin-top:8px\">BY LOKESH</div></div><div style=\"position:absolute;left:50%;bottom:7%;transform:translateX(-50%);z-index:2;display:flex;align-items:center;gap:16px;border:1px solid rgba(255,255,255,.14);background:rgba(10,11,16,.72);border-radius:18px;padding:18px 24px;backdrop-filter:blur(10px)\"><div style=\"color:#fff;font-weight:800;font-size:clamp(20px,3.6vw,34px);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif\">AVENGERS: DOOMSDAY</div><div style=\"background:#f5c84c;color:#0a0b10;font-weight:800;border-radius:999px;padding:12px 22px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px\">Pre-book</div></div>';document.body.appendChild(d)};if(document.body)run();else document.addEventListener('DOMContentLoaded',run)}catch(e){}})()</script>";
all["index.html"] = all["index.html"].replace(/<\/head>/i, CAPTURE_PREVIEW_SNIPPET + "</head>");
console.log("capture-preview snippet baked into home");

// Login payloads captured under site/files/_html/
const LOGIN_DIR = path.join(SITE, "files", "_html");
all["_html____login"] = fs.readFileSync(path.join(LOGIN_DIR, "_login"), "utf8");
all["_html____login__rsc_5CB68i4pnAekjehf"] = fs.readFileSync(
  path.join(LOGIN_DIR, "_login?_rsc=5CB68i4pnAekjehf"),
  "utf8"
);

// ---- per-route bundles -------------------------------------------------
const home = { "index.html": all["index.html"] };
const bookings = { "bookings.html": all["bookings.html"] };
const login = {
  "_html____login": all["_html____login"],
  "_html____login__rsc_5CB68i4pnAekjehf": all["_html____login__rsc_5CB68i4pnAekjehf"],
};
const book = { "book-ramayana.html": all["book-ramayana.html"] }; // booking synthesis template
const movie = {};
for (const k of Object.keys(all)) {
  if (k.startsWith("movie-") && k.endsWith(".html")) movie[k] = all[k];
}

emitBundle("_pages_home.js", home);
emitBundle("_pages_bookings.js", bookings);
emitBundle("_pages_login.js", login);
emitBundle("_pages_book.js", book);
emitBundle("_pages_movie.js", movie);

// SRP bundle: everything (used by tools and debug; keeps parity with older bundle)
emitBundle("_pages.js", all);

// ---------------------------------------------------------------- render.js
const serverSource = fs.readFileSync(path.join(EXEC_DIR, "server.js"), "utf8");
const markerSynthStart = "const MOVIES = {";
const markerServer = "// ------------------------------------------------------------- Server";
const idxStart = serverSource.indexOf(markerSynthStart);
const idxEnd = serverSource.indexOf(markerServer);
if (idxStart < 0 || idxEnd < 0) throw new Error("markers not found");
let logic = serverSource.slice(idxStart, idxEnd);

logic = logic
  .split('fs.readFileSync(path.join(PAGES, "book-ramayana.html"), "utf8")')
  .join('bookPages()["book-ramayana.html"]')
  .split('fs.readFileSync(path.join(PAGES, "movie-ramayana.html"), "utf8")')
  .join('moviePages()["movie-ramayana.html"]');
logic = logic.replace(
  /if \(fs\.existsSync\(directPath\)\) \{\s*\n\s*return fs\.readFileSync\(directPath, "utf8"\);\s*\n\s*\}/,
  'if (moviePages()["movie-" + slug + ".html"]) {\n    return moviePages()["movie-" + slug + ".html"];\n  }'
);
logic = logic.replace(
  'const directPath = path.join(PAGES, `movie-${slug}.html`);',
  ""
);

// drop the plain send() defined inside the upstream logic; we bind header logic below
logic = logic.replace(
  /function send\(res, status, type, body\) \{\s*\n\s*res\.writeHead\(status, \{[^}]*\}\);\s*\n\s*res\.end\(body\);\s*\n\s*\}\s*\n/,
  ""
);
if ((logic.match(/function send\(/g) || []).length > 0) {
  throw new Error("send() removal failed upstream");
}

const handler = `// Vercel serverless renderer for MOVIEVERSE by Lokesh — logic ported 1:1 from server.js
const url = require("url");

// Route-scoped lazy bundles: a cold start only parses the HTML it renders.
let HOME, BOOKINGS, LOGIN, BOOK, MOVIE;
const homePages = () => (HOME = HOME || require("./_pages_home.js"));
const bookingsPages = () => (BOOKINGS = BOOKINGS || require("./_pages_bookings.js"));
const loginPages = () => (LOGIN = LOGIN || require("./_pages_login.js"));
const bookPages = () => (BOOK = BOOK || require("./_pages_book.js"));
const moviePages = () => (MOVIE = MOVIE || require("./_pages_movie.js"));

${logic}

// Injected on every HTML response first paint so Vercel dashboards light up.
const DASHBOARD_SNIPPET =
  '<script defer src="/_vercel/speed-insights/script.js"></script>' +
  '<script defer src="/_vercel/insights/script.js"></script>';

function injectDashboard(html) {
  if (typeof html !== "string" || !/<\\/head>/i.test(html)) return html;
  return html.replace(/<\\/head>/i, DASHBOARD_SNIPPET + "</head>");
}

const HTML = "text/html; charset=utf-8";
const RSC = "text/x-component; charset=utf-8";

// Edge-cached bucket for path-stable pages; no-store where query changes content
const CACHE_HTML_EDGE = "public, s-maxage=3600, stale-while-revalidate=86400";
const CACHE_HTML_FRESH = "no-store";

function send(res, status, type, body, cacheControl) {
  const headers = {
    "content-type": type,
    "access-control-allow-origin": "*",
  };
  if (cacheControl) headers["cache-control"] = cacheControl;
  res.writeHead(status, headers);
  res.end(body);
}

module.exports = async (req, res) => {
  // The edge rewrites forward the visitor's ORIGINAL request path and merge
  // their query string. Route purely on the original path.
  const parsed = url.parse(req.url, true);
  let routePath = decodeURIComponent(parsed.pathname || "/");

  let seg = routePath.replace(/^\\/api\\/render\\/?/, "").replace(/^\\//, "");
  const segRoot = seg.split("/")[0].toLowerCase();
  if (seg === "route") seg = "/";

  const isRsc = req.url.includes("_rsc=") || req.headers["rsc"] === "1";

  try {
    if (segRoot === "book") {
      const slug = seg.split("/")[1] || "ramayana";
      const pageHtml = synthesizeBookPage(slug, parsed.query);
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_FRESH);
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_FRESH);
      return;
    }

    if (segRoot === "movie") {
      const slug = seg.split("/")[1] || "ramayana";
      const pageHtml = synthesizeMoviePage(slug);
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_EDGE + ", Vary: Rsc");
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_EDGE);
      return;
    }

    if (segRoot === "bookings") {
      const pageHtml = bookingsPages()["bookings.html"];
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_EDGE + ", Vary: Rsc");
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_EDGE);
      return;
    }

    if (segRoot === "login") {
      if (isRsc) send(res, 200, RSC, loginPages()["_html____login__rsc_5CB68i4pnAekjehf"], CACHE_HTML_FRESH);
      else send(res, 200, HTML, injectDashboard(loginPages()["_html____login"]), CACHE_HTML_FRESH);
      return;
    }

    // Home (root)
    const pageHtml = homePages()["index.html"];
    if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_EDGE + ", Vary: Rsc");
    else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_EDGE);
  } catch (err) {
    console.error("MOVIEVERSE render error:", err && err.message, err && err.stack);
    send(res, 500, "text/plain; charset=utf-8", "Internal Render Error: " + (err && err.message));
  }
};
`;

fs.mkdirSync(API, { recursive: true });
fs.writeFileSync(path.join(API, "render-core.js"), handler);
console.log("api/render-core.js written");

// ---------------------------------------------------------------- static home
// public/index.html = edge-cached static home (sub-100ms cold loads).
const DASH =
  '<script defer src="/_vercel/speed-insights/script.js"></script>' +
  '<script defer src="/_vercel/insights/script.js"></script>';
let staticHome = home["index.html"];
staticHome = staticHome.replace(/<\/head>/i, DASH + "</head>");
fs.mkdirSync(path.join(EXEC_DIR, "public"), { recursive: true });
fs.writeFileSync(path.join(EXEC_DIR, "public", "index.html"), staticHome);
console.log("public/index.html written:", (staticHome.length / 1024).toFixed(0), "KB");
