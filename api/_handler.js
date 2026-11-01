// Vercel serverless renderer for MOVIEVERSE by Lokesh — logic ported 1:1 from server.js
const path = require("path");
const url = require("url");

// PAGES: embedded, AUTO-GENERATED page HTML maps (GET-instant, no fs at runtime)
const PAGES = require("./_pages.js");

const MOVIES = {
  "avengers-doomsday": {
    slug: "avengers-doomsday",
    title: "Avengers: Doomsday",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 45m",
    cert: "UA 13+",
    rating: "9.8",
    lang: "English",
    langs: ["English", "Hindi", "Tamil", "Telugu"],
    genres: ["Action", "Sci-Fi", "Superhero"],
    director: "Anthony Russo, Joe Russo",
    cast: ["Pedro Pascal", "Robert Downey Jr.", "Benedict Cumberbatch", "Vanessa Kirby"],
    accent: "#00e5ff",
  },
  "demon-slayer-castle": {
    slug: "demon-slayer-castle",
    title: "Demon Slayer: Infinity Castle",
    trailerId: "6MSY8_acauE",
    runtime: "2h 15m",
    cert: "UA 16+",
    rating: "9.7",
    lang: "Japanese",
    langs: ["Japanese", "English", "Hindi", "Tamil"],
    genres: ["Anime", "Action", "Dark Fantasy"],
    director: "Haruo Sotozaki",
    cast: ["Natsuki Hanae", "Akari Kito", "Hiro Shimono"],
    accent: "#ff3d00",
  },
  "toxic": {
    slug: "toxic",
    title: "Toxic",
    trailerId: "f5M1d7r2UNQ",
    runtime: "2h 41m",
    cert: "A",
    rating: "8.8",
    lang: "Kannada",
    langs: ["Kannada", "Tamil", "Telugu", "Hindi", "Malayalam"],
    genres: ["Gangster", "Period", "Action"],
    director: "Geetu Mohandas",
    cast: ["Yash", "Nayanthara", "Kiara Advani", "Huma Qureshi"],
    accent: "#2dd4bf",
  },
  "varanasi": {
    slug: "varanasi",
    title: "Varanasi",
    trailerId: "DMD2uthghWE",
    runtime: "3h 05m",
    cert: "UA",
    rating: "9.6",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Malayalam", "Kannada"],
    genres: ["Adventure", "Mythology", "Action"],
    director: "Prasanth Varma",
    cast: ["Teja Sajja", "Rana Daggubati"],
    accent: "#ffcf6b",
  },
  "spider-verse": {
    slug: "spider-verse",
    title: "Spider-Man: Beyond Spider-Verse",
    trailerId: "shW9i6k8cB0",
    runtime: "2h 20m",
    cert: "U",
    rating: "9.6",
    lang: "English",
    langs: ["English", "Hindi", "Tamil", "Telugu"],
    genres: ["Animation", "Action", "Sci-Fi"],
    director: "Joaquim Dos Santos, Kemp Powers",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Daniel Kaluuya"],
    accent: "#ff3366",
  },
  "ramayana": {
    slug: "ramayana",
    title: "Ramayana",
    trailerId: "K7zjRJ_0sgk",
    runtime: "2h 58m",
    cert: "UA",
    rating: "9.4",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"],
    genres: ["Mythology", "Epic", "Action"],
    director: "Nitesh Tiwari",
    cast: ["Ranbir Kapoor", "Sai Pallavi", "Yash", "Sunny Deol"],
    accent: "#f59e0b",
  },
  "love-and-war": {
    slug: "love-and-war",
    title: "Love & War",
    trailerId: "6b13K7o6P8U",
    runtime: "3h 10m",
    cert: "UA",
    rating: "9.4",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu"],
    genres: ["Romance", "Period", "Drama"],
    director: "Sanjay Leela Bhansali",
    cast: ["Ranbir Kapoor", "Alia Bhatt", "Vicky Kaushal"],
    accent: "#ec4899",
  },
  "the-conjuring-first-communion": {
    slug: "the-conjuring-first-communion",
    title: "The Conjuring: First Communion",
    trailerId: "FSAz556s0fM",
    runtime: "2h 08m",
    cert: "A",
    rating: "9.1",
    lang: "English",
    langs: ["English", "Hindi", "Tamil", "Telugu"],
    genres: ["Horror", "Mystery", "Thriller"],
    director: "Michael Chaves",
    cast: ["Patrick Wilson", "Vera Farmiga"],
    accent: "#64748b",
  },
  "hunt-for-gollum": {
    slug: "hunt-for-gollum",
    title: "The Hunt for Gollum",
    trailerId: "nVU1eXPPfGg",
    runtime: "2h 38m",
    cert: "UA 13+",
    rating: "9.5",
    lang: "English",
    langs: ["English", "Hindi", "Tamil", "Telugu"],
    genres: ["Fantasy", "Adventure", "Epic"],
    director: "Andy Serkis",
    cast: ["Andy Serkis", "Ian McKellen"],
    accent: "#84cc16",
  },
  "dune-3": {
    slug: "dune-3",
    title: "Dune: Part Three",
    trailerId: "Way9Dexny3w",
    runtime: "2h 52m",
    cert: "UA 16+",
    rating: "9.7",
    lang: "English",
    langs: ["English", "Hindi", "Tamil"],
    genres: ["Sci-Fi", "Epic", "Adventure"],
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Florence Pugh"],
    accent: "#eab308",
  },
  "avengers-secret-wars": {
    slug: "avengers-secret-wars",
    title: "Avengers: Secret Wars",
    trailerId: "irVNGjRFZGk",
    runtime: "3h 05m",
    cert: "UA 13+",
    rating: "9.9",
    lang: "English",
    langs: ["English", "Hindi", "Tamil", "Telugu"],
    genres: ["Action", "Sci-Fi", "Multiverse"],
    director: "Anthony Russo, Joe Russo",
    cast: ["Robert Downey Jr.", "Hugh Jackman", "Tobey Maguire", "Ryan Reynolds"],
    accent: "#a855f7",
  },
  "kantara-chapter-1": {
    slug: "kantara-chapter-1",
    title: "Kantara: Chapter 1",
    trailerId: "4fW5l49TjXg",
    runtime: "2h 35m",
    cert: "UA",
    rating: "9.6",
    lang: "Kannada",
    langs: ["Kannada", "Tamil", "Telugu", "Hindi", "Malayalam"],
    genres: ["Mythology", "Action", "Folklore"],
    director: "Rishab Shetty",
    cast: ["Rishab Shetty", "Rukmini Vasanth"],
    accent: "#f59e0b",
  },
  "jailer": {
    slug: "jailer",
    title: "Jailer",
    trailerId: "xenOE1Tma0A",
    runtime: "2h 48m",
    cert: "UA 16+",
    rating: "8.6",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Kannada"],
    genres: ["Action", "Comedy"],
    director: "Nelson Dilipkumar",
    cast: ["Rajinikanth", "Mohanlal", "Vinayakan", "Shiva Rajkumar"],
    accent: "#e63946",
  },
  "vettaiyan": {
    slug: "vettaiyan",
    title: "Vettaiyan",
    trailerId: "zPqMbwmGC1U",
    runtime: "2h 43m",
    cert: "UA",
    rating: "7.9",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Action", "Drama"],
    director: "T. J. Gnanavel",
    cast: ["Rajinikanth", "Amitabh Bachchan", "Fahadh Faasil", "Manju Warrier"],
    accent: "#4fc3f7",
  },
  "goat": {
    slug: "goat",
    title: "The Greatest of All Time",
    trailerId: "B5GAj5B6h2U",
    runtime: "3h 03m",
    cert: "UA 13+",
    rating: "7.6",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Sci-Fi", "Action"],
    director: "Venkat Prabhu",
    cast: ["Vijay", "Prashanth", "Prabhu Deva", "Sneha"],
    accent: "#ab47bc",
  },
  "good-bad-ugly": {
    slug: "good-bad-ugly",
    title: "Good Bad Ugly",
    trailerId: "v8xXwS01Z-Y",
    runtime: "2h 38m",
    cert: "UA 16+",
    rating: "7.8",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Action", "Comedy"],
    director: "Adhik Ravichandran",
    cast: ["Ajith Kumar", "Trisha", "Prasanna", "Sunil"],
    accent: "#ff7043",
  },
  "coolie": {
    slug: "coolie",
    title: "Coolie",
    trailerId: "qeVbL28q8qU",
    runtime: "2h 50m",
    cert: "A",
    rating: "8.4",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Kannada"],
    genres: ["Action", "Thriller"],
    director: "Lokesh Kanagaraj",
    cast: ["Rajinikanth", "Nagarjuna", "Soubin Shahir", "Shruti Haasan"],
    accent: "#f5c518",
  },
  "leo": {
    slug: "leo",
    title: "Leo",
    trailerId: "Po3jZXc0_XQ",
    runtime: "2h 44m",
    cert: "UA 16+",
    rating: "8.2",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Action", "Thriller"],
    director: "Lokesh Kanagaraj",
    cast: ["Vijay", "Trisha", "Sanjay Dutt", "Arjun Sarja"],
    accent: "#d64933",
  },
  "vikram": {
    slug: "vikram",
    title: "Vikram",
    trailerId: "OKBMCL-frPU",
    runtime: "2h 53m",
    cert: "UA 16+",
    rating: "9.0",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    genres: ["Action", "Thriller"],
    director: "Lokesh Kanagaraj",
    cast: ["Kamal Haasan", "Vijay Sethupathi", "Fahadh Faasil", "Suriya"],
    accent: "#ff6b35",
  },
};

function getMovie(slug) {
  if (MOVIES[slug]) return MOVIES[slug];
  // Auto-generate clean metadata from slug
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    slug,
    title,
    trailerId: "irVNGjRFZGk",
    runtime: "2h 30m",
    cert: "UA",
    rating: "8.8",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "English"],
    genres: ["Action", "Drama"],
    director: "Lokesh",
    cast: ["Cast Member 1", "Cast Member 2"],
    accent: "#f5b942",
  };
}

function extractRsc(html) {
  const matches = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)];
  let rsc = "";
  for (const m of matches) {
    try {
      rsc += JSON.parse('"' + m[1] + '"');
    } catch {
      rsc += m[1].replace(/\\\\/g, "\\").replace(/\\"/g, '"').replace(/\\n/g, "\n");
    }
  }
  return rsc;
}

function escapeForScript(obj) {
  return JSON.stringify(obj).replace(/"/g, '\\"');
}

function formatTime(t) {
  if (!t) return "2:20 PM";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr || "00"} ${ampm}`;
}

const THEATRE_NAMES = {
  "chennai-t-nagar-0": "Nova Cinemas: T. Nagar",
  "chennai-t-nagar-1": "PVR: Grand Galada, T. Nagar",
  "chennai-velachery-2": "INOX: Phoenix Marketcity, Velachery",
  "chennai-mylapore-0": "Sathyam Cinemas: Royapettah",
  "chennai-egmore-0": "Albert Theatre: Egmore",
  "chennai-vadapalani-0": "Palazzo: Nexus Vijaya Mall, Vadapalani",
  "chennai-anna-nagar-0": "VR Chennai: Anna Nagar",
  "chennai-koyambedu-0": "Rohini Silver Screens: Koyambedu",
};

// ------------------------------------------------------------- Synthesisers
function synthesizeBookPage(slug, query) {
  const movie = getMovie(slug);
  const city = query.city || "chennai";
  const theatre = query.theatre || "chennai-t-nagar-0";
  const time = query.time || "14:20";
  const format = query.format || "2D";
  const lang = query.lang || movie.lang || "Tamil";
  const dateNum = Number(query.date) || 0;

  const theatreLabel = THEATRE_NAMES[theatre] || "Nova Cinemas: T. Nagar";
  const timeFormatted = formatTime(time);

  const baseHtml = PAGES["book-ramayana.html"];

  const oldProps =
    '{\\"slug\\":\\"ramayana\\",\\"city\\":\\"chennai\\",\\"theatre\\":\\"chennai-t-nagar-0\\",\\"date\\":0,\\"time\\":\\"14:20\\",\\"format\\":\\"2D\\",\\"lang\\":\\"Hindi\\"}';
  const newProps = escapeForScript({
    slug,
    city,
    theatre,
    date: dateNum,
    time,
    format,
    lang,
  });

  let out = baseHtml
    .split(oldProps)
    .join(newProps)
    .split('{\\"n\\":\\"slug\\",\\"t\\":\\"d\\",\\"k\\":\\"ramayana\\"')
    .join(`{\\"n\\":\\"slug\\",\\"t\\":\\"d\\",\\"k\\":\\"${slug}\\"`)
    .split('\\"ramayana?city=')
    .join(`\\"${slug}?city=`)
    .split("Pick your seats — Ramayana · MOVIEVERSE by Lokesh")
    .join(`Pick your seats — ${movie.title} · MOVIEVERSE by Lokesh`)
    .split('href="/movie/ramayana"')
    .join(`href="/movie/${slug}"`)
    .split('<h1 class="truncate font-display text-xl uppercase tracking-wide md:text-2xl">Ramayana</h1>')
    .join(`<h1 class="truncate font-display text-xl uppercase tracking-wide md:text-2xl">${movie.title}</h1>`)
    .split("<p class=\"truncate text-xs text-muted\">Nova Cinemas: T. Nagar<!-- --> · <!-- -->…<!-- --> · <!-- -->2:20 PM<!-- --> · <!-- -->2D<!-- --> · Hindi</p>")
    .join(`<p class="truncate text-xs text-muted">${theatreLabel}<!-- --> · <!-- -->Today, 1 Nov<!-- --> · <!-- -->${timeFormatted}<!-- --> · <!-- -->${format}<!-- --> · ${lang}</p>`)
    .split('<span class="ml-auto hidden rounded-md border border-line px-2 py-1 text-[11px] text-white/60 sm:block">UA</span>')
    .join(`<span class="ml-auto hidden rounded-md border border-line px-2 py-1 text-[11px] text-white/60 sm:block">${movie.cert || "UA"}</span>`);

  return out;
}

function synthesizeMoviePage(slug) {
  const directPageKey = "movie-" + slug + ".html";
  if (PAGES["movie-" + slug + ".html"]) {
    return PAGES["movie-" + slug + ".html"];
  }

  const movie = getMovie(slug);
  const baseHtml = PAGES["movie-ramayana.html"];

  let out = baseHtml
    .split("K7zjRJ_0sgk")
    .join(movie.trailerId || "irVNGjRFZGk")
    .split("Ramayana")
    .join(movie.title)
    .split("ramayana")
    .join(movie.slug)
    .split("2h 58m")
    .join(movie.runtime || "2h 30m")
    .split("9.4")
    .join(movie.rating || "9.0")
    .split("Nitesh Tiwari")
    .join(movie.director || "Lokesh")
    .split("Ranbir Kapoor, Sai Pallavi, Yash")
    .join(movie.cast ? movie.cast.join(", ") : "Lead Cast")
    .split("Mythology")
    .join(movie.genres ? movie.genres[0] : "Action")
    .split("Hindi")
    .join(movie.lang || "Tamil");

  return out;
}



// Injected on every HTML response first paint so Vercel dashboards light up.
const DASHBOARD_SNIPPET =
  '<script defer src="/_vercel/speed-insights/script.js"></script>' +
  '<script defer src="/_vercel/insights/script.js"></script>';

function injectDashboard(html) {
  if (typeof html !== "string" || !/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, DASHBOARD_SNIPPET + "</head>");
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
  // The edge rewrites forward the visitor's ORIGINAL request path and merge
  // their query string with any rewrite-injected params (verified empirically
  // on the live edge with _debug=1). Route purely on the original path.
  const parsed = url.parse(req.url, true);
  let routePath = decodeURIComponent(parsed.pathname || "/");

  // Normalize: either a visitor path ("/movie/x") or the raw function path ("/api/render/<seg>")
  let seg = routePath.replace(/^\/api\/render\/?/, "").replace(/^\//, "");
  // drop any explicit destination marker segment ("route")
  const segRoot = seg.split("/")[0].toLowerCase();
  if (seg === "route") seg = "/";

  const isRsc = req.url.includes("_rsc=") || req.headers["rsc"] === "1";

  // Deployment-time context debugging (temporary)
  if (parsed.query["_debug"] === "1") {
    send(res, 200, "application/json; charset=utf-8", JSON.stringify({
      url: req.url,
      path: routePath,
      seg,
      matchedPath: req.headers["x-matched-path"],
      forwardedHost: req.headers["x-forwarded-host"],
      query: parsed.query,
      method: req.method,
    }, null, 2));
    return;
  }

  try {
    // Booking seat picker: /book/<slug>?city&theatre&time&format&lang&date
    if (segRoot === "book") {
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
