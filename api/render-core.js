// Vercel serverless renderer for MOVIEVERSE by Lokesh — logic ported 1:1 from server.js
const url = require("url");

// Route-scoped lazy bundles: a cold start only parses the HTML it renders.
let HOME, BOOKINGS, LOGIN, BOOK, MOVIE;
const homePages = () => (HOME = HOME || require("./_pages_home.js"));
const bookingsPages = () => (BOOKINGS = BOOKINGS || require("./_pages_bookings.js"));
const loginPages = () => (LOGIN = LOGIN || require("./_pages_login.js"));
const bookPages = () => (BOOK = BOOK || require("./_pages_book.js"));
const moviePages = () => (MOVIE = MOVIE || require("./_pages_movie.js"));

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

  const baseHtml = bookPages()["book-ramayana.html"];

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
  
  if (moviePages()["movie-" + slug + ".html"]) {
    return moviePages()["movie-" + slug + ".html"];
  }

  const movie = getMovie(slug);
  const baseHtml = moviePages()["movie-ramayana.html"];

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



// Injected on every HTML response first paint so Vercel dashboards light up.
const DASHBOARD_SNIPPET =
  '<script defer src="/_vercel/speed-insights/script.js"></script>' +
  '<script defer src="/_vercel/insights/script.js"></script>';

function injectDashboard(html) {
  if (typeof html !== "string" || !/<\/head>/i.test(html)) return html;
  return html.replace(/<\/head>/i, DASHBOARD_SNIPPET + "</head>");
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
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
  };
  if (cacheControl) headers["cache-control"] = cacheControl;
  res.writeHead(status, headers);
  res.end(body);
}

module.exports = async (req, res) => {
  // Check forwarded path from Vercel edge/rewrite headers, fallback to req.url
  const matchedHeader =
    req.headers["x-matched-path"] ||
    req.headers["x-forwarded-uri"] ||
    req.headers["x-rewrite-url"];
  const parsed = new URL(req.url, "http://localhost");
  const query = Object.fromEntries(parsed.searchParams);
  let routePath = decodeURIComponent(
    matchedHeader && !matchedHeader.startsWith("/api/render")
      ? matchedHeader
      : parsed.pathname || "/"
  );
  if (routePath.length > 1 && routePath.endsWith("/")) {
    routePath = routePath.slice(0, -1);
  }

  let seg = routePath.replace(/^\/api\/render\/?/, "").replace(/^\//, "");
  if (seg === "route") seg = "";
  const segRoot = seg.split("/")[0].toLowerCase();

  const isRsc = parsed.searchParams.has("_rsc") || req.headers["rsc"] === "1";

  try {
    if (segRoot === "book") {
      const slug = seg.split("/")[1] || query.slug || "ramayana";
      const pageHtml = synthesizeBookPage(slug, query);
      if (isRsc) send(res, 200, RSC, extractRsc(pageHtml), CACHE_HTML_FRESH);
      else send(res, 200, HTML, injectDashboard(pageHtml), CACHE_HTML_FRESH);
      return;
    }

    if (segRoot === "movie") {
      const slug = seg.split("/")[1] || query.slug || "ramayana";
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

    if (segRoot === "login" || segRoot === "_login") {
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
