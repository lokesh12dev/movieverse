// Localhost mirror + cache proxy for MOVIEVERSE by Lokesh.
// Serves mirrored assets, synthesizes the added movie pages, handles client
// (RSC) navigation for them, and proxies anything else from the live
// deployment while caching it to disk.
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4300;
const UPSTREAM = "https://cineverse-blond-nine.vercel.app";
const FILES = path.join(__dirname, "site", "files");
const PAGES = path.join(__dirname, "site");
const CACHE = path.join(__dirname, "cache");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
};

function applyBranding(str) {
  if (!str) return str;
  return str
    .split("Cineverse — Book the experience").join("MOVIEVERSE by Lokesh — Book the experience")
    .split("· Cineverse").join("· MOVIEVERSE by Lokesh")
    .split("CINEVERSE").join("MOVIEVERSE")
    .split("Cineverse").join("MOVIEVERSE")
    .split("cineverse.com").join("movieverse.com")
    .split("demo@cineverse.in").join("lokesh@movieverse.in");
}

// ---------------------------------------------------------------- added movie
const ADDED_MOVIES = [
  {
    slug: "godzilla-minus-zero",
    title: "Godzilla Minus Zero",
    trailer: "pWJjYoqVSjQ",
    rating: "8.9",
    runtime: "2h 05m",
    genres: "Kaiju · Sci-Fi",
    cast: "Ryūnosuke Kamiki, Minami Hamabe",
    director: "Takashi Yamazaki",
    langs: "Japanese · English",
    accent: "#19c8b0",
    // mirrored template page
    sourceMoviePage: "movie-amaran.html",
    // upstream route the synthesized pages are rendered from
    sourceSlug: "amaran",
    sourceTitle: "Amaran",
    sourceTrailer: "hylIXfZeB4c",
    sourceRating: "9.2",
    sourceRuntime: "2h 46m",
    sourceGenres: "War · Biopic",
    sourceCast: "Sivakarthikeyan, Sai Pallavi",
    sourceDirector: "Rajkumar Periasamy",
    sourceLangs: "Tamil · Telugu",
    sourceAccent: "#7cb342",
    sourceBookPage: "book-amaran.html",
  },
  {
    slug: "doomsday",
    title: "Doomsday",
    trailer: "irVNGjRFZGk",
    rating: "8.5",
    runtime: "2h 30m",
    genres: "Superhero · Action",
    cast: "Pedro Pascal, Elizabeth Olsen, Robert Downey Jr.",
    director: "Anthony Russo, Joe Russo",
    langs: "English",
    accent: "#b91c1c",
    // mirrored template page
    sourceMoviePage: "movie-amaran.html",
    // upstream route the synthesized pages are rendered from
    sourceSlug: "amaran",
    sourceTitle: "Amaran",
    sourceTrailer: "hylIXfZeB4c",
    sourceRating: "9.2",
    sourceRuntime: "2h 46m",
    sourceGenres: "War · Biopic",
    sourceCast: "Sivakarthikeyan, Sai Pallavi",
    sourceDirector: "Rajkumar Periasamy",
    sourceLangs: "Tamil · Telugu",
    sourceAccent: "#7cb342",
    sourceBookPage: "book-amaran.html",
  },
];

const ADDED_SLUGS = ADDED_MOVIES.map((m) => m.slug);
const ADDED_RE = new RegExp(
  "^\\/(movie|book)\\/(" + ADDED_SLUGS.map((s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|") + ")(?:\\/|$)"
);

function findAddedMovie(slug) {
  return ADDED_MOVIES.find((m) => m.slug === slug);
}

function transformText(text, movie, deep) {
  let out = text.split(movie.sourceSlug).join(movie.slug);
  out = out.split(movie.sourceTrailer).join(movie.trailer);
  out = out.split(movie.sourceTitle).join(movie.title);
  if (deep) {
    out = out.split(movie.sourceRating).join(movie.rating);
    out = out.split(movie.sourceRuntime).join(movie.runtime);
    out = out.split(movie.sourceGenres).join(movie.genres);
    out = out.split(movie.sourceCast).join(movie.cast);
    out = out.split(movie.sourceDirector).join(movie.director);
    out = out.split(movie.sourceLangs).join(movie.langs);
    out = out.split(movie.sourceAccent).join(movie.accent);
  }
  return out;
}

// ---------------------------------------------------------------- upstream
function fetchUpstream(urlPath, reqHeaders) {
  return new Promise((resolve, reject) => {
    const headers = { "user-agent": "movieverse-local-mirror" };
    for (const key of ["rsc", "next-router-prefetch", "next-router-state-tree", "next-url"]) {
      if (reqHeaders[key]) headers[key] = reqHeaders[key];
    }
    https
      .get(UPSTREAM + urlPath, { headers }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) })
        );
      })
      .on("error", reject);
  });
}

function cachePath(prefix, key, ext) {
  const hash = crypto.createHash("sha1").update(key).digest("hex").slice(0, 20);
  return path.join(CACHE, prefix, hash + ext);
}

function cacheWrite(filePath, buf) {
  fs.mkdir(path.dirname(filePath), { recursive: true }, () => fs.writeFile(filePath, buf, () => {}));
}

function mirroredPageFor(urlPath) {
  const clean = urlPath.split("?")[0];
  if (clean === "/" || clean === "") return path.join(PAGES, "index.html");
  if (clean === "/bookings") return path.join(PAGES, "bookings.html");
  if (clean.startsWith("/movie/")) return path.join(PAGES, `movie-${clean.split("/")[2]}.html`);
  if (clean.startsWith("/book/")) return path.join(PAGES, `book-${clean.split("/")[2]}.html`);
  return null;
}

function send(res, status, type, body) {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store, max-age=0",
  });
  res.end(body);
}

// ------------------------------------------------- booked-page rendering
// The booking page bakes its showtime details into the server render, so build
// it from the live app's Amaran page with the caller's exact query string and
// then swap in the added movie's identity. Falls back to the mirrored template
// when the network is unavailable.
async function renderedBookPage(rawUrl, reqHeaders, movie) {
  const qs = rawUrl.includes("?") ? rawUrl.slice(rawUrl.indexOf("?")) : "";
  const sourceUrl = `/book/${movie.sourceSlug}${qs}`;
  const cached = cachePath("book", sourceUrl, ".html");
  try {
    if (fs.existsSync(cached)) {
      return transformText(fs.readFileSync(cached, "utf8"), movie, false);
    }
    const up = await fetchUpstream(sourceUrl, reqHeaders);
    if (up.status === 200) {
      cacheWrite(cached, up.body);
      return transformText(up.body.toString("utf8"), movie, false);
    }
  } catch {}
  const src = path.join(PAGES, movie.sourceBookPage);
  return transformText(fs.readFileSync(src, "utf8"), movie, true);
}

const server = http.createServer(async (req, res) => {
  const rawUrl = req.url.split("#")[0];
  const urlPath = decodeURIComponent(rawUrl.split("?")[0]);
  const isRsc = rawUrl.includes("_rsc=") || req.headers["rsc"] === "1";
  const added = urlPath.match(ADDED_RE);

  // 1. Client navigation (RSC) for the added movie
  if (added && isRsc) {
    const movie = findAddedMovie(added[2]);
    const sourceUrl = rawUrl.replace(`/${added[1]}/${added[2]}`, `/${added[1]}/${movie.sourceSlug}`);
    const cached = cachePath("rsc", sourceUrl, ".txt");
    let body = null;
    try {
      if (fs.existsSync(cached)) {
        body = fs.readFileSync(cached, "utf8");
      } else {
        const headers = { ...req.headers };
        if (headers["next-router-state-tree"]) {
          headers["next-router-state-tree"] = headers["next-router-state-tree"]
            .split(encodeURIComponent(added[2]))
            .join(encodeURIComponent(movie.sourceSlug))
            .split(added[2])
            .join(movie.sourceSlug);
        }
        const up = await fetchUpstream(sourceUrl, headers);
        if (up.status === 200) {
          body = up.body.toString("utf8");
          cacheWrite(cached, up.body);
        } else {
          send(res, up.status, up.headers["content-type"] || "text/plain", up.body);
          return;
        }
      }
    } catch (err) {
      send(res, 502, "text/plain", "Upstream fetch failed: " + err.message);
      return;
    }
    send(res, 200, "text/x-component; charset=utf-8", transformText(body, movie, false));
    return;
  }

  // 2. Added movie pages (rendered from the source movie with its identity swapped)
  if (added) {
    const movie = findAddedMovie(added[2]);
    if (added[1] === "book") {
      send(res, 200, MIME[".html"], await renderedBookPage(rawUrl, req.headers, movie));
      return;
    }
    const src = path.join(PAGES, movie.sourceMoviePage);
    if (fs.existsSync(src)) {
      send(res, 200, MIME[".html"], transformText(fs.readFileSync(src, "utf8"), movie, true));
      return;
    }
  }

  // 3. Static assets already mirrored
  const assetPath = path.join(FILES, urlPath);
  if (
    urlPath !== "/" &&
    !urlPath.endsWith("/") &&
    fs.existsSync(assetPath) &&
    fs.statSync(assetPath).isFile()
  ) {
    send(res, 200, MIME[path.extname(assetPath)] || "application/octet-stream", fs.readFileSync(assetPath));
    return;
  }

  // 4. Prerendered HTML pages (cached mirror)
  const pageFile = mirroredPageFor(urlPath);
  if (pageFile && fs.existsSync(pageFile) && !isRsc) {
    send(res, 200, MIME[".html"], fs.readFileSync(pageFile));
    return;
  }

  // 5. Cache proxy for everything else (other movies, RSC payloads, assets)
  try {
    const up = await fetchUpstream(rawUrl, req.headers);
    const ct = up.headers["content-type"] || "text/html";
    let body = up.body;
    if (ct.includes("text/html") || ct.includes("text/x-component")) {
      body = Buffer.from(applyBranding(body.toString("utf8")));
    }
    send(res, up.status, ct, body);
    if (up.status === 200) {
      if (urlPath.startsWith("/_next/") || urlPath.startsWith("/posters/")) {
        cacheWrite(path.join(FILES, urlPath), up.body);
      } else if (ct.includes("text/html") && !isRsc) {
        const target = mirroredPageFor(urlPath);
        if (target && !fs.existsSync(target)) cacheWrite(target, up.body);
      }
    }
  } catch (err) {
    send(res, 502, "text/plain", "Upstream fetch failed: " + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`MOVIEVERSE by Lokesh local mirror: http://localhost:${PORT}`);
});
