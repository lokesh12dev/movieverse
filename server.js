// MOVIEVERSE by Lokesh — 100% Self-Contained High-Performance Local Server
// Created and crafted solely by Lokesh (lokesh12dev).
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const zlib = require("zlib");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4300;
const PAGES = path.join(__dirname, "site");
const FILES = path.join(__dirname, "site", "files");

// Extensions that benefit from gzip compression
const COMPRESSIBLE = new Set([".html", ".js", ".css", ".json", ".svg", ".txt", ".xml", ".wasm"]);

function maybeCompress(req, body, type) {
  // Extract media type from content-type header (e.g., "text/html; charset=utf-8" -> "text/html")
  const mediaType = type.split(";")[0].trim().toLowerCase();
  // Map media type to extension
  const typeToExt = {
    "text/html": ".html",
    "text/javascript": ".js",
    "text/css": ".css",
    "application/json": ".json",
    "image/svg+xml": ".svg",
    "text/plain": ".txt",
    "application/wasm": ".wasm",
  };
  const ext = typeToExt[mediaType];
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (!ext || !COMPRESSIBLE.has(ext)) return { body, encoding: null };
  if (acceptEncoding.includes("gzip")) {
    return { body: zlib.gzipSync(body), encoding: "gzip" };
  }
  return { body, encoding: null };
}

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
  ".md": "text/markdown; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
};

// Comprehensive Movie Catalog (58 Indian & Global Blockbusters)
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
    trailerId: "B5GAjuSnNuQ",
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
    trailerId: "bJbZAXbF3Xo",
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
    trailerId: "qeVfT2iLiu0",
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
    trailerId: "Po3jStA673E",
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
  "animal": {
    slug: "animal",
    title: "Animal",
    trailerId: "DzbJQI618-U",
    runtime: "3h 24m",
    cert: "A",
    rating: "8.1",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"],
    genres: ["Action", "Drama", "Crime"],
    director: "Sandeep Reddy Vanga",
    cast: ["Ranbir Kapoor", "Rashmika Mandanna", "Anil Kapoor", "Bobby Deol"],
    accent: "#dc2626",
  },
  "chhaava": {
    slug: "chhaava",
    title: "Chhaava",
    trailerId: "z1QhO4s47U0",
    runtime: "2h 40m",
    cert: "UA 16+",
    rating: "9.3",
    lang: "Hindi",
    langs: ["Hindi", "Marathi", "Tamil", "Telugu"],
    genres: ["Historical", "Action", "Drama"],
    director: "Laxman Utekar",
    cast: ["Vicky Kaushal", "Rashmika Mandanna", "Akshaye Khanna"],
    accent: "#d97706",
  },
  "dhurandhar": {
    slug: "dhurandhar",
    title: "Dhurandhar",
    trailerId: "BKOVzHcjEIo",
    runtime: "2h 51m",
    cert: "UA",
    rating: "8.6",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu"],
    genres: ["Action", "Thriller"],
    director: "Aditya Dhar",
    cast: ["Ranveer Singh", "Sanjay Dutt", "R. Madhavan", "Akshaye Khanna"],
    accent: "#0284c7",
  },
  "dragon": {
    slug: "dragon",
    title: "Dragon",
    trailerId: "qIBZlbJ7NUE",
    runtime: "2h 41m",
    cert: "UA",
    rating: "8.7",
    lang: "Tamil",
    langs: ["Tamil", "Telugu"],
    genres: ["Action", "Drama"],
    director: "Ashwath Marimuthu",
    cast: ["Pradeep Ranganathan", "Anupama Parameswaran", "Kayadu Lohar"],
    accent: "#f97316",
  },
  "jailer-2": {
    slug: "jailer-2",
    title: "Jailer 2",
    trailerId: "FW_PPcr1sPE",
    runtime: "2h 46m",
    cert: "UA 16+",
    rating: "9.1",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Kannada"],
    genres: ["Action", "Thriller", "Comedy"],
    director: "Nelson Dilipkumar",
    cast: ["Rajinikanth", "Mohanlal", "Shiva Rajkumar"],
    accent: "#e11d48",
  },
  "jana-nayagan": {
    slug: "jana-nayagan",
    title: "Jana Nayagan",
    trailerId: "fJaAYcERf3Y",
    runtime: "2h 22m",
    cert: "UA 16+",
    rating: "8.9",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Political", "Action", "Thriller"],
    director: "H. Vinoth",
    cast: ["Vijay", "Pooja Hegde", "Bobby Deol"],
    accent: "#8b5cf6",
  },
  "jawan": {
    slug: "jawan",
    title: "Jawan",
    trailerId: "MW3OshnQjV8",
    runtime: "2h 49m",
    cert: "UA 16+",
    rating: "8.4",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu"],
    genres: ["Action", "Thriller"],
    director: "Atlee",
    cast: ["Shah Rukh Khan", "Nayanthara", "Vijay Sethupathi"],
    accent: "#b91c1c",
  },
  "jigarthanda": {
    slug: "jigarthanda",
    title: "Jigarthanda DoubleX",
    trailerId: "PvoUJejn1e4",
    runtime: "2h 31m",
    cert: "UA",
    rating: "8.4",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Kannada"],
    genres: ["Action", "Western", "Drama"],
    director: "Karthik Subbaraj",
    cast: ["Raghava Lawrence", "S. J. Suryah", "Nimisha Sajayan"],
    accent: "#d97706",
  },
  "kanguva": {
    slug: "kanguva",
    title: "Kanguva",
    trailerId: "ajnCMSC4VPo",
    runtime: "2h 48m",
    cert: "UA",
    rating: "7.1",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Malayalam", "Kannada"],
    genres: ["Period", "Action", "Fantasy"],
    director: "Siva",
    cast: ["Suriya", "Bobby Deol", "Disha Patani"],
    accent: "#b45309",
  },
  "kgf-2": {
    slug: "kgf-2",
    title: "K.G.F: Chapter 2",
    trailerId: "jQsE85cI384",
    runtime: "2h 48m",
    cert: "UA",
    rating: "8.8",
    lang: "Kannada",
    langs: ["Kannada", "Tamil", "Telugu", "Hindi", "Malayalam"],
    genres: ["Action", "Period", "Crime"],
    director: "Prashanth Neel",
    cast: ["Yash", "Sanjay Dutt", "Raveena Tandon", "Srinidhi Shetty"],
    accent: "#eab308",
  },
  "lokah": {
    slug: "lokah",
    title: "Lokah Chapter 1: Chandra",
    trailerId: "64XHtNWTB5o",
    runtime: "2h 44m",
    cert: "A",
    rating: "8.7",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Malayalam"],
    genres: ["Action", "Sci-Fi", "Thriller"],
    director: "Dominic Arun",
    cast: ["Kalyani Priyadarshan", "Dulquer Salmaan"],
    accent: "#06b6d4",
  },
  "maharaja": {
    slug: "maharaja",
    title: "Maharaja",
    trailerId: "Otcr-vRuaQs",
    runtime: "2h 29m",
    cert: "A",
    rating: "9.3",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Action", "Crime", "Mystery"],
    director: "Nithilan Saminathan",
    cast: ["Vijay Sethupathi", "Anurag Kashyap", "Mamta Mohandas"],
    accent: "#78716c",
  },
  "mark-antony": {
    slug: "mark-antony",
    title: "Mark Antony",
    trailerId: "Dg8X7SZ_4bs",
    runtime: "2h 24m",
    cert: "A",
    rating: "7.9",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Sci-Fi", "Comedy", "Action"],
    director: "Adhik Ravichandran",
    cast: ["Vishal", "S. J. Suryah", "Ritu Varma"],
    accent: "#ca8a04",
  },
  "peddi": {
    slug: "peddi",
    title: "Peddi",
    trailerId: "sF2dj7ycZvA",
    runtime: "2h 28m",
    cert: "UA",
    rating: "8.9",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi"],
    genres: ["Action", "Drama"],
    director: "Buchi Babu Sana",
    cast: ["Ram Charan", "Janhvi Kapoor", "Shiva Rajkumar"],
    accent: "#ea580c",
  },
  "ponniyin-selvan": {
    slug: "ponniyin-selvan",
    title: "Ponniyin Selvan: I",
    trailerId: "D4qAQYlgZQs",
    runtime: "2h 57m",
    cert: "UA 16+",
    rating: "8.6",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Malayalam", "Kannada"],
    genres: ["Historical", "Epic", "Drama"],
    director: "Mani Ratnam",
    cast: ["Vikram", "Aishwarya Rai Bachchan", "Jayam Ravi", "Karthi", "Trisha"],
    accent: "#f59e0b",
  },
  "pushpa-2": {
    slug: "pushpa-2",
    title: "Pushpa 2: The Rule",
    trailerId: "g3JUbgOHgdw",
    runtime: "3h 21m",
    cert: "UA 16+",
    rating: "8.9",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Malayalam", "Kannada"],
    genres: ["Action", "Crime", "Drama"],
    director: "Sukumar",
    cast: ["Allu Arjun", "Rashmika Mandanna", "Fahadh Faasil"],
    accent: "#dc2626",
  },
  "saiyaara": {
    slug: "saiyaara",
    title: "Saiyaara",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 25m",
    cert: "UA",
    rating: "8.5",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu"],
    genres: ["Romance", "Musical", "Drama"],
    director: "Mohit Suri",
    cast: ["Ahan Shetty", "Pooja Hegde"],
    accent: "#ec4899",
  },
  "thug-life": {
    slug: "thug-life",
    title: "Thug Life",
    trailerId: "96kAbj3IF3k",
    runtime: "2h 34m",
    cert: "A",
    rating: "8.2",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    genres: ["Gangster", "Action", "Drama"],
    director: "Mani Ratnam",
    cast: ["Kamal Haasan", "Silambarasan TR", "Trisha"],
    accent: "#ef4444",
  },
  "viduthalai-2": {
    slug: "viduthalai-2",
    title: "Viduthalai Part 2",
    trailerId: "HOxXrrwa_8o",
    runtime: "2h 55m",
    cert: "UA 16+",
    rating: "8.9",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Period", "Crime", "Drama"],
    director: "Vetrimaaran",
    cast: ["Vijay Sethupathi", "Soori", "Manju Warrier", "Anurag Kashyap"],
    accent: "#b45309",
  },
  "war-2": {
    slug: "war-2",
    title: "War 2",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 45m",
    cert: "UA 16+",
    rating: "9.2",
    lang: "Hindi",
    langs: ["Hindi", "Telugu", "Tamil"],
    genres: ["Spy", "Action", "Thriller"],
    director: "Ayan Mukerji",
    cast: ["Hrithik Roshan", "N. T. Rama Rao Jr.", "Kiara Advani"],
    accent: "#3b82f6",
  },
  "akhanda-2": {
    slug: "akhanda-2",
    title: "Akhanda 2: Thaandavam",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 45m",
    cert: "UA",
    rating: "8.7",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi"],
    genres: ["Action", "Mythology"],
    director: "Boyapati Srinu",
    cast: ["Nandamuri Balakrishna", "Pragya Jaiswal"],
    accent: "#f59e0b",
  },
  "baahubali-2": {
    slug: "baahubali-2",
    title: "Baahubali 2: The Conclusion",
    trailerId: "qD-6d8Wo3do",
    runtime: "2h 47m",
    cert: "UA",
    rating: "9.2",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Malayalam"],
    genres: ["Epic", "Action", "Fantasy"],
    director: "S. S. Rajamouli",
    cast: ["Prabhas", "Rana Daggubati", "Anushka Shetty", "Tamannaah"],
    accent: "#d97706",
  },
  "daaku": {
    slug: "daaku",
    title: "Daaku Maharaaj",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 35m",
    cert: "UA",
    rating: "8.3",
    lang: "Telugu",
    langs: ["Telugu", "Hindi", "Tamil"],
    genres: ["Period", "Action"],
    director: "Bobby Kolli",
    cast: ["Nandamuri Balakrishna", "Bobby Deol", "Urvashi Rautela"],
    accent: "#e11d48",
  },
  "devara": {
    slug: "devara",
    title: "Devara: Part 1",
    trailerId: "44Lvh0808tc",
    runtime: "2h 58m",
    cert: "UA 16+",
    rating: "8.2",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Kannada", "Malayalam"],
    genres: ["Action", "Drama"],
    director: "Koratala Siva",
    cast: ["N. T. Rama Rao Jr.", "Janhvi Kapoor", "Saif Ali Khan"],
    accent: "#0284c7",
  },
  "empuraan": {
    slug: "empuraan",
    title: "L2: Empuraan",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 50m",
    cert: "UA 16+",
    rating: "9.3",
    lang: "Malayalam",
    langs: ["Malayalam", "Tamil", "Telugu", "Hindi"],
    genres: ["Political", "Action", "Thriller"],
    director: "Prithviraj Sukumaran",
    cast: ["Mohanlal", "Prithviraj Sukumaran", "Manju Warrier"],
    accent: "#7c3aed",
  },
  "game-changer": {
    slug: "game-changer",
    title: "Game Changer",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 45m",
    cert: "UA",
    rating: "8.0",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi"],
    genres: ["Political", "Action"],
    director: "S. Shankar",
    cast: ["Ram Charan", "Kiara Advani", "S. J. Suryah"],
    accent: "#2563eb",
  },
  "hanuman": {
    slug: "hanuman",
    title: "Hanu-Man",
    trailerId: "Oqvly3MvlXA",
    runtime: "2h 38m",
    cert: "U",
    rating: "8.9",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Kannada", "Malayalam"],
    genres: ["Superhero", "Mythology", "Fantasy"],
    director: "Prasanth Varma",
    cast: ["Teja Sajja", "Amritha Aiyer", "Varalaxmi Sarathkumar"],
    accent: "#ea580c",
  },
  "kalki": {
    slug: "kalki",
    title: "Kalki 2898 AD",
    trailerId: "kQDd1AhGIHk",
    runtime: "3h 01m",
    cert: "UA",
    rating: "8.8",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Malayalam", "Kannada"],
    genres: ["Sci-Fi", "Mythology", "Epic"],
    director: "Nag Ashwin",
    cast: ["Prabhas", "Amitabh Bachchan", "Kamal Haasan", "Deepika Padukone"],
    accent: "#f59e0b",
  },
  "kantara-1": {
    slug: "kantara-1",
    title: "Kantara",
    trailerId: "8mrVfZcln4w",
    runtime: "2h 28m",
    cert: "UA",
    rating: "9.1",
    lang: "Kannada",
    langs: ["Kannada", "Tamil", "Telugu", "Hindi", "Malayalam"],
    genres: ["Folklore", "Action", "Drama"],
    director: "Rishab Shetty",
    cast: ["Rishab Shetty", "Sapthami Gowda", "Kishore"],
    accent: "#ca8a04",
  },
  "lucky-baskhar": {
    slug: "lucky-baskhar",
    title: "Lucky Baskhar",
    trailerId: "s3ZqPsmYpSU",
    runtime: "2h 30m",
    cert: "UA",
    rating: "8.6",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Malayalam", "Hindi"],
    genres: ["Period", "Crime", "Drama"],
    director: "Venky Atluri",
    cast: ["Dulquer Salmaan", "Meenakshi Chaudhary"],
    accent: "#16a34a",
  },
  "manjummel": {
    slug: "manjummel",
    title: "Manjummel Boys",
    trailerId: "id848Ww1YLo",
    runtime: "2h 15m",
    cert: "U",
    rating: "9.0",
    lang: "Malayalam",
    langs: ["Malayalam", "Tamil", "Telugu", "Hindi"],
    genres: ["Survival", "Thriller", "Adventure"],
    director: "Chidambaram",
    cast: ["Soubin Shahir", "Sreenath Bhasi", "Balu Varghese"],
    accent: "#0d9488",
  },
  "master": {
    slug: "master",
    title: "Master",
    trailerId: "1_iU7rTqd34",
    runtime: "2h 59m",
    cert: "UA",
    rating: "8.5",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Action", "Thriller"],
    director: "Lokesh Kanagaraj",
    cast: ["Vijay", "Vijay Sethupathi", "Malavika Mohanan"],
    accent: "#ef4444",
  },
  "og": {
    slug: "og",
    title: "They Call Him OG",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 45m",
    cert: "A",
    rating: "9.1",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi"],
    genres: ["Gangster", "Action"],
    director: "Sujeeth",
    cast: ["Pawan Kalyan", "Emraan Hashmi", "Priyanka Mohan"],
    accent: "#dc2626",
  },
  "raja-saab": {
    slug: "raja-saab",
    title: "The Raja Saab",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 40m",
    cert: "UA",
    rating: "8.7",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Kannada", "Malayalam"],
    genres: ["Horror", "Comedy", "Romance"],
    director: "Maruthi",
    cast: ["Prabhas", "Malavika Mohanan", "Nidhhi Agerwal"],
    accent: "#9333ea",
  },
  "retro": {
    slug: "retro",
    title: "Retro",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 20m",
    cert: "UA",
    rating: "8.4",
    lang: "Tamil",
    langs: ["Tamil", "Telugu"],
    genres: ["Period", "Music", "Drama"],
    director: "Karthik Subbaraj",
    cast: ["Suriya", "Pooja Hegde"],
    accent: "#f97316",
  },
  "rrr": {
    slug: "rrr",
    title: "RRR",
    trailerId: "NgBoMJy386M",
    runtime: "3h 07m",
    cert: "UA",
    rating: "9.3",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Malayalam", "Kannada"],
    genres: ["Period", "Action", "Epic"],
    director: "S. S. Rajamouli",
    cast: ["N. T. Rama Rao Jr.", "Ram Charan", "Alia Bhatt", "Ajay Devgn"],
    accent: "#d97706",
  },
  "salaar": {
    slug: "salaar",
    title: "Salaar: Part 1 – Ceasefire",
    trailerId: "4GPvYMKtrtI",
    runtime: "2h 55m",
    cert: "A",
    rating: "8.6",
    lang: "Telugu",
    langs: ["Telugu", "Tamil", "Hindi", "Malayalam", "Kannada"],
    genres: ["Action", "Crime", "Thriller"],
    director: "Prashanth Neel",
    cast: ["Prabhas", "Prithviraj Sukumaran", "Shruti Haasan"],
    accent: "#475569",
  },
  "stree-2": {
    slug: "stree-2",
    title: "Stree 2",
    trailerId: "KVnhePf049Q",
    runtime: "2h 27m",
    cert: "UA",
    rating: "8.7",
    lang: "Hindi",
    langs: ["Hindi", "Tamil", "Telugu"],
    genres: ["Horror", "Comedy"],
    director: "Amar Kaushik",
    cast: ["Shraddha Kapoor", "Rajkummar Rao", "Pankaj Tripathi"],
    accent: "#e11d48",
  },
  "vidaamuyarchi": {
    slug: "vidaamuyarchi",
    title: "Vidaamuyarchi",
    trailerId: "irVNGjRFZGk",
    runtime: "2h 45m",
    cert: "UA 16+",
    rating: "8.5",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi"],
    genres: ["Action", "Thriller", "Survival"],
    director: "Magizh Thirumeni",
    cast: ["Ajith Kumar", "Trisha", "Arjun Sarja", "Regina Cassandra"],
    accent: "#0ea5e9",
  },
  "amaran": {
    slug: "amaran",
    title: "Amaran",
    trailerId: "r9qZ0z8j2dM",
    runtime: "2h 35m",
    cert: "UA",
    rating: "8.3",
    lang: "Tamil",
    langs: ["Tamil", "Telugu", "Hindi", "Kannada", "Malayalam"],
    genres: ["Action", "Drama", "Biography"],
    director: "Raj Kumar M. Thiagarajan",
    cast: ["Sivaji", "Prakash Raj", "Sanjay Dutt", "Bhama"],
    accent: "#7c3aed",
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
    cast: ["Lead Star", "Co-Star"],
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

function getTheatreName(theatreId) {
  if (!theatreId) return "Nova Cinemas: T. Nagar";
  if (THEATRE_NAMES[theatreId]) return THEATRE_NAMES[theatreId];
  const parts = theatreId.split("-");
  const city = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "Chennai";
  const areaParts = parts.slice(1, -1);
  const area = areaParts.length ? areaParts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Main Screen";
  return `PVR: ${area}, ${city}`;
}

// ------------------------------------------------------------- Synthesisers
function synthesizeBookPage(slug, query) {
  const movie = getMovie(slug);
  const city = query.city || "chennai";
  const theatre = query.theatre || "chennai-t-nagar-0";
  const time = query.time || "14:20";
  const format = query.format || "2D";
  const lang = query.lang || movie.lang || "Tamil";
  const dateNum = Number(query.date) || 0;

  const theatreLabel = getTheatreName(theatre);
  const timeFormatted = formatTime(time);

  const baseHtml = fs.readFileSync(path.join(PAGES, "book-ramayana.html"), "utf8");

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
  const directPath = path.join(PAGES, `movie-${slug}.html`);
  if (fs.existsSync(directPath)) {
    return fs.readFileSync(directPath, "utf8");
  }

  const movie = getMovie(slug);
  const baseHtml = fs.readFileSync(path.join(PAGES, "movie-ramayana.html"), "utf8");

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

// Optimized send with content-type aware caching + gzip compression
function send(req, res, status, type, body, cacheControl) {
  const headers = {
    "content-type": type,
    "access-control-allow-origin": "*",
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
  };
  if (cacheControl) headers["cache-control"] = cacheControl;
  
  const { body: compressedBody, encoding } = maybeCompress(req, body, type);
  if (encoding) headers["content-encoding"] = encoding;
  
  res.writeHead(status, headers);
  res.end(compressedBody);
}

// Cache control headers by content type
const CACHE = {
  html: "no-store, max-age=0",
  rsc: "no-store, max-age=0",
  js: "public, max-age=31536000, immutable",
  css: "public, max-age=31536000, immutable",
  woff2: "public, max-age=31536000, immutable",
  png: "public, max-age=31536000, immutable",
  webp: "public, max-age=31536000, immutable",
  jpg: "public, max-age=31536000, immutable",
  ico: "public, max-age=31536000, immutable",
  glb: "public, max-age=31536000, immutable",
  json: "public, max-age=3600, stale-while-revalidate=86400",
};

// ------------------------------------------------------------- Server
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, "http://localhost");
  const query = Object.fromEntries(parsed.searchParams);
  const cleanPath = decodeURIComponent(parsed.pathname || "/");
  const isRsc = parsed.searchParams.has("_rsc") || req.headers["rsc"] === "1";

  // 1. Booking Routes: /book/:slug
  if (cleanPath.startsWith("/book/")) {
    const parts = cleanPath.split("/").filter(Boolean);
    const slug = parts[1] || "ramayana";
    try {
      const pageHtml = synthesizeBookPage(slug, query);
      if (isRsc) {
        const rscPayload = extractRsc(pageHtml);
        send(req, res, 200, "text/x-component; charset=utf-8", rscPayload, CACHE.rsc);
      } else {
        send(req, res, 200, MIME[".html"], pageHtml, CACHE.html);
      }
      return;
    } catch (err) {
      console.error("Book page synthesis error:", err);
      send(req, res, 500, "text/plain", "Internal Booking Error: " + err.message);
      return;
    }
  }

  // 2. Movie Routes: /movie/:slug
  if (cleanPath.startsWith("/movie/")) {
    const parts = cleanPath.split("/").filter(Boolean);
    const slug = parts[1] || "ramayana";
    try {
      const pageHtml = synthesizeMoviePage(slug);
      if (isRsc) {
        const rscPayload = extractRsc(pageHtml);
        send(req, res, 200, "text/x-component; charset=utf-8", rscPayload, CACHE.rsc);
      } else {
        send(req, res, 200, MIME[".html"], pageHtml, CACHE.html);
      }
      return;
    } catch (err) {
      console.error("Movie page synthesis error:", err);
      send(req, res, 500, "text/plain", "Internal Movie Error: " + err.message);
      return;
    }
  }

  // 3. Root Home Page: /
  if (cleanPath === "/" || cleanPath === "") {
    const pageHtml = fs.readFileSync(path.join(PAGES, "index.html"), "utf8");
    if (isRsc) {
      send(req, res, 200, "text/x-component; charset=utf-8", extractRsc(pageHtml), CACHE.rsc);
    } else {
      send(req, res, 200, MIME[".html"], pageHtml, CACHE.html);
    }
    return;
  }

  // 4. Bookings History Page: /bookings
  if (cleanPath === "/bookings") {
    const pageHtml = fs.readFileSync(path.join(PAGES, "bookings.html"), "utf8");
    if (isRsc) {
      send(req, res, 200, "text/x-component; charset=utf-8", extractRsc(pageHtml), CACHE.rsc);
    } else {
      send(req, res, 200, MIME[".html"], pageHtml, CACHE.html);
    }
    return;
  }

  // 5. Login route / prefetch
  if (cleanPath === "/login" || cleanPath === "/_login") {
    const loginRsc = path.join(FILES, "_html", "_login?_rsc=5CB68i4pnAekjehf");
    const loginHtml = path.join(FILES, "_html", "_login");
    if (isRsc && fs.existsSync(loginRsc)) {
      send(req, res, 200, "text/x-component; charset=utf-8", fs.readFileSync(loginRsc), CACHE.rsc);
    } else if (fs.existsSync(loginHtml)) {
      send(req, res, 200, MIME[".html"], fs.readFileSync(loginHtml), CACHE.html);
    } else {
      send(req, res, 200, "text/plain", "OK", CACHE.html);
    }
    return;
  }

  // 6. 3D Models: /models/*
  if (cleanPath.startsWith("/models/")) {
    const modelRel = cleanPath.replace("/models/", "");
    const paths = [
      path.join(PAGES, "models", modelRel),
      path.join(FILES, "models", modelRel),
    ];
    for (const p of paths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const ext = path.extname(p).toLowerCase();
        send(req, res, 200, MIME[ext] || "model/gltf-binary", fs.readFileSync(p), CACHE[ext.slice(1)] || CACHE.glb);
        return;
      }
    }
  }

  // 7. 3D Textures: /textures/*
  if (cleanPath.startsWith("/textures/")) {
    const texRel = cleanPath.replace("/textures/", "");
    const paths = [
      path.join(PAGES, "textures", texRel),
      path.join(FILES, "textures", texRel),
    ];
    for (const p of paths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const ext = path.extname(p).toLowerCase();
        send(req, res, 200, MIME[ext] || "image/jpeg", fs.readFileSync(p), CACHE[ext.slice(1)] || CACHE.jpg);
        return;
      }
    }
  }

  // 8. Static Posters: /posters/*
  if (cleanPath.startsWith("/posters/")) {
    const posterRel = cleanPath.replace("/posters/", "");
    const paths = [
      path.join(PAGES, "posters", posterRel),
      path.join(FILES, "posters", posterRel),
    ];
    for (const p of paths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const ext = path.extname(p).toLowerCase();
        send(req, res, 200, MIME[ext] || "image/webp", fs.readFileSync(p), CACHE[ext.slice(1)] || CACHE.webp);
        return;
      }
    }
  }

  // 9. Static Chunks & Mirrored Files (/_next/, /favicon, etc.)
  const assetPaths = [
    path.join(FILES, cleanPath),
    path.join(PAGES, cleanPath),
  ];
  for (const p of assetPaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      const ext = path.extname(p).toLowerCase();
      const cacheKey = ext.slice(1);
      send(req, res, 200, MIME[ext] || "application/octet-stream", fs.readFileSync(p), CACHE[cacheKey] || CACHE.js);
      return;
    }
  }

  // Fallback 404
  send(req, res, 404, "text/plain", "Not Found");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Run with PORT=<port> node server.js or stop the existing process.`);
    process.exit(1);
  }
  throw err;
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`MOVIEVERSE by Lokesh running self-contained on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  MOVIES,
  getMovie,
  getTheatreName,
  synthesizeBookPage,
  synthesizeMoviePage,
  extractRsc,
  escapeForScript,
  formatTime,
};
