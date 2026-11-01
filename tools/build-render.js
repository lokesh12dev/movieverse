#!/usr/bin/env node
// One-shot generator: derives api/_pages.js + api/render.js from server.js + site/
// so the Vercel function stays in 1:1 sync with the local server.
const fs = require("fs");
const path = require("path");
const EXEC_DIR = path.join(__dirname, "..");

const SITE = path.join(EXEC_DIR, "site");

// ---------------------------------------------------------------- pages map
const pagePaths = [];
for (const f of fs.readdirSync(SITE)) {
  if (f.endsWith(".html")) pagePaths.push(f);
}
const LOGIN_DIR = path.join(SITE, "files", "_html");

const pages = {};
for (const rel of pagePaths) {
  const full = path.join(SITE, rel);
  pages[rel] = fs.readFileSync(full, "utf8");
}

// Login payloads captured under site/files/_html/ (keys match api/render.js)
pages["_html____login"] = fs.readFileSync(path.join(LOGIN_DIR, "_login"), "utf8");
pages["_html____login__rsc_5CB68i4pnAekjehf"] = fs.readFileSync(
  path.join(LOGIN_DIR, "_login?_rsc=5CB68i4pnAekjehf"),
  "utf8"
);

const pagesOut =
  "// AUTO-GENERATED from site/ by tools/build-render.js — do not edit by hand.\n" +
  "module.exports = " + JSON.stringify(pages) + ";\n";
fs.writeFileSync(path.join(EXEC_DIR, "api", "_pages.js"), pagesOut);
console.log("api/_pages.js written:", Object.keys(pages).length, "pages,", (pagesOut.length / 1024 / 1024).toFixed(2), "MB");

// ---------------------------------------------------------------- render.js
const serverSource = fs.readFileSync(path.join(EXEC_DIR, "server.js"), "utf8");

// Catalog + helpers: from the first line to the end of synthesizePageBlock (right before "// 1. Booking Routes" handler section started by "// ------------- Server")
const markerSynthStart = "const MOVIES = {";
const markerServer = "// ------------------------------------------------------------- Server";
const idxStart = serverSource.indexOf(markerSynthStart);
const idxEnd = serverSource.indexOf(markerServer);
if (idxStart < 0 || idxEnd < 0) throw new Error("markers not found");
let logic = serverSource.slice(idxStart, idxEnd);

// Replace the synchronous file reads inside synthesizers with page-map lookups
logic = logic
  .split('fs.readFileSync(path.join(PAGES, "book-ramayana.html"), "utf8")')
  .join('PAGES["book-ramayana.html"]')
  .split('fs.readFileSync(path.join(PAGES, "movie-ramayana.html"), "utf8")')
  .join('PAGES["movie-ramayana.html"]');

// synthesizeMoviePage's direct file existence check
logic = logic.replace(
  /if \(fs\.existsSync\(directPath\)\) \{\s*\n\s*return fs\.readFileSync\(directPath, "utf8"\);\s*\n\s*\}/,
  'if (PAGES["movie-" + slug + ".html"]) {\n    return PAGES["movie-" + slug + ".html"];\n  }'
);
logic = logic.replace(
  'const directPath = path.join(PAGES, `movie-${slug}.html`);',
  'const directPageKey = "movie-" + slug + ".html";'
);

// drop the plain send() defined inside the upstream logic; we bind header logic below
logic = logic.replace(
  /function send\(res, status, type, body\) \{\s*\n\s*res\.writeHead\(status, \{[^}]*\}\);\s*\n\s*res\.end\(body\);\s*\n\s*\}\s*\n/,
  ""
);
if (/^function send\(/m.test(logic) === false) {
  // sanity: ensure the removal happened only when a duplicate remains below
}
if ((logic.match(/function send\(/g) || []).length > 0) {
  throw new Error("send() removal failed upstream");
}

const handler = `// Vercel serverless renderer for MOVIEVERSE by Lokesh — logic ported 1:1 from server.js
const path = require("path");
const url = require("url");

// PAGES: embedded, AUTO-GENERATED page HTML maps (GET-instant, no fs at runtime)
const PAGES = require("./_pages.js");

${logic}

// Injected on every HTML response first paint so Vercel dashboards light up.
const DASHBOARD_SNIPPET =
  '<script defer src="/_vercel/speed-insights/script.js"></script>' +
  '<script defer src="/_vercel/insights/script.js"></script>';

function injectDashboard(html) {
  if (typeof html !== "string" || !/<\\/head>/i.test(html)) return html;
  return html.replace(/<\\/head>/i, DASHBOARD_SNIPPET + "</head>");
}

function send(res, status, type, body, cacheControl) {
  const headers = {
    "content-type": type,
    "access-control-allow-origin": "*",
  };
  if (cacheControl) headers["cache-control"] = cacheControl;
  res.writeHead(status, headers);
  res.end(body);
}

const HTML = "text/html; charset=utf-8";
const RSC = "text/x-component; charset=utf-8";

// Edge-cached bucket for path-stable pages, no-store for query-personalized pages
const CACHE_HTML_EDGE = "public, s-maxage=3600, stale-while-revalidate=86400";
const CACHE_HTML_FRESH = "no-store";

module.exports = async (req, res) => {
  // The v_route rewrites land us on /api/render[/<route>..<slug>] with the
  // visitor's original query string merged, and x-matched-path preserving the
  // source pattern. Resolve route from whichever context the edge provides.
  const parsed = url.parse(req.url, true);
  let routePath = decodeURIComponent(parsed.pathname || "/");
  const matched = req.headers["x-matched-path"] ? decodeURIComponent(req.headers["x-matched-path"]) : "";
  const routeFromMatched = matched && matched !== routePath ? matched : routePath;
  const pathForRouting = routePath.startsWith("/api/render")
    ? routePath
    : routeFromMatched.startsWith("/api/render")
      ? routeFromMatched
      : routePath;

  // strip the function prefix and expose the visiting segment
  let seg = pathForRouting.replace(/^\\/api\\/render\\/?/, "");
  if (seg === "") seg = "/";
  const isRsc = req.url.includes("_rsc=") || req.headers["rsc"] === "1" || req.headers["rsc"] === "1";

  try {
    // Home
    if (seg.startsWith("book/")) {
      const slug = seg.split("/")[1] || "ramayana";
      const pageHtml = synthesizeBookPage(slug, parsed.query);
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_FRESH);
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_FRESH);
      return;
    }

    if (seg.startsWith("movie/")) {
      const slug = seg.split("/")[1] || "ramayana";
      const pageHtml = synthesizeMoviePage(slug);
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_EDGE + ", Vary: Rsc");
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_EDGE);
      return;
    }

    if (seg.startsWith("bookings")) {
      const pageHtml = PAGES["bookings.html"];
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_EDGE + ", Vary: Rsc");
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_EDGE);
      return;
    }

    if (seg.startsWith("login")) {
      if (isRsc) send(res, 200, RSC, PAGES["_html____login__rsc_5CB68i4pnAekjehf"], CACHE_HTML_FRESH);
      else send(res, 200, HTML, injectDashboard(PAGES["_html____login"]), CACHE_HTML_FRESH);
      return;
    }

    // Home (root)
    const pageHtml = PAGES["index.html"];
    if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_EDGE + ", Vary: Rsc");
    else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_EDGE);
  } catch (err) {
    console.error("MOVIEVERSE render error:", err && err.message, err && err.stack);
    send(res, 500, "text/plain; charset=utf-8", "Internal Render Error: " + (err && err.message));
  }
};
`;

fs.mkdirSync(path.join(EXEC_DIR, "api"), { recursive: true });
fs.writeFileSync(path.join(EXEC_DIR, "api", "render.js"), handler);
console.log("api/render.js written");
