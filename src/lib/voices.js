// ElevenLabs voice for every teacher. Plain data so the server can import it.
//
// These are voices from the ElevenLabs Voice Library, picked to match each
// person's accent, age and temperament (German for Einstein, French for Curie,
// Danish for Bohr, Balkan for Tesla...). They are NOT clones of the real people.
//
//   id:     ElevenLabs voice_id
//   lib:    the voice's name in the Voice Library (used to add it to your account automatically)
//   s:      stability (lower = more expressive), st: style exaggeration, sp: speed
//
// To swap a voice, paste a different voice_id here (find one at elevenlabs.io/app/voice-library).

export const VOICES = {
  einstein: { id: "yR6YPi6ytQSGBZ0uKFQl", lib: "Heribert deutsch", why: "older, warm, thoughtful native German speaker (speaks English with a German accent)", s: 0.45, st: 0.3, sp: 0.9 },
  curie: { id: "6COmvtjXbPPyANlFAo0z", lib: "Nathalie  fresh clear soft French Native", why: "calm, measured French accent", s: 0.55, st: 0.15, sp: 0.95 },
  turing: { id: "qJXPML3QGhCJ3NLe2sEw", lib: "Connor", why: "kind, gentle young British voice", s: 0.5, st: 0.2, sp: 1.0 },
  tesla: { id: "F2kYsMGahtg8auErVXgY", lib: "ProVox - Wise & Gentle", why: "Balkan (Serbo-Croatian) accent", s: 0.4, st: 0.3, sp: 1.0 },

  davinci: { id: "qQFoiN2eQXULODjD1SwL", lib: "Emanuele", why: "warm, curious Italian accent", s: 0.35, st: 0.4, sp: 0.95 },
  jobs: { id: "wdeEOw9iMDHzRDUDlgPC", lib: "Kyle F - Technical and Soft", why: "calm, soft-spoken older Californian", s: 0.5, st: 0.25, sp: 0.97 },

  bohr: { id: "ygiXC2Oa1BiHksD3WkJZ", lib: "Mathias - Storyteller", why: "soft Danish baritone", s: 0.5, st: 0.2, sp: 0.92 },
  feynman: { id: "qs7xY0GtfjxrWYDILEb7", lib: "Dre Way", why: "street-smart, well-read New Yorker", s: 0.3, st: 0.45, sp: 1.05 },
  planck: { id: "G4t3322LqgEAU2HEgGCv", lib: "Paul - English Barritone Narration", why: "formal baritone, light German accent", s: 0.6, st: 0.1, sp: 0.9 },

  pauling: { id: "sTGkt0SQ2Dnwa8VqJlvj", lib: "Graham, the story teller", why: "warm, enthusiastic American", s: 0.4, st: 0.3, sp: 1.0 },
  hodgkin: { id: "kkPJzQOWz2Oz9cUaEaQd", lib: "Beatrice - Mature Female Storyteller", why: "warm, wise older British woman", s: 0.55, st: 0.15, sp: 0.95 },
  rutherford: { id: "FzF8jZqBPUzPBSk1iEOG", lib: "Lucas - 50s male - New Zealand accent", why: "New Zealander who lived in the UK", s: 0.4, st: 0.3, sp: 1.0 },
  sanger: { id: "fnYMz3F5gMEDGMWcH1ex", lib: "Finley -  Articulate Anchor", why: "crisp, modest older Englishman", s: 0.55, st: 0.1, sp: 0.95 },

  fleming: { id: "h194bY5xBKzOKQYzA1N5", lib: "John", why: "mild Scottish accent", s: 0.5, st: 0.2, sp: 0.97 },
  pavlov: { id: "IGRoDkfYV2Frq7Ly0PRu", lib: "Maxim - Russian Accented English", why: "rich Russian baritone", s: 0.55, st: 0.2, sp: 0.92 },
  cajal: { id: "v6Pyp14HUgq3UVeqBfaN", lib: "Gustavo Gomez", why: "deep Spanish-accented voice", s: 0.45, st: 0.3, sp: 0.95 },
  crick: { id: "hEZploiPJinU5zriiU1l", lib: "Mason - Bright, Clear, Educator", why: "bright, fast-talking Englishman", s: 0.35, st: 0.35, sp: 1.05 },
  mcclintock: { id: "5u41aNhyCU6hXOcjPPv0", lib: "Carol - Relatable, Real, Cool, Senior", why: "sharp, kind American grandmother", s: 0.5, st: 0.2, sp: 0.95 },

  simon: { id: "x8EpqJ1pKzP4vo35tTCm", lib: "David - Clear, Friendly Explainer", why: "clear, witty American professor", s: 0.45, st: 0.25, sp: 1.0 },
  mccarthy: { id: "f1FbEx0BXrcIZphRWWmL", lib: "Jezza - Confident, Measured, Clear", why: "precise, logical American", s: 0.55, st: 0.15, sp: 1.0 },
  minsky: { id: "BrRAeqxB2th2WFOe9aDF", lib: "Paul G", why: "mischievous New Yorker", s: 0.35, st: 0.4, sp: 1.0 },
  newell: { id: "4N8zjn9tVNuDEBFWVHAq", lib: "Jesse - Elearning Casual Friendly Male", why: "energetic, friendly American", s: 0.4, st: 0.3, sp: 1.03 },

  nash: { id: "XHG7PtdLPWP7xwHIsVBi", lib: "Maayan Tech Tutorials", why: "quiet, precise American", s: 0.6, st: 0.1, sp: 0.95 },
  mirzakhani: { id: "NZiuR1C6kVMSWHG27sIM", lib: "Sahar", why: "warm, lyrical Persian accent", s: 0.45, st: 0.3, sp: 0.97 },
  grothendieck: { id: "1a6onbE6zC5AwIN3pEp0", lib: "Nicolas - French English Male Deep", why: "calm, deep French accent", s: 0.6, st: 0.15, sp: 0.9 },
  russell: { id: "ItluBpGWT7OvTHpsgTJY", lib: "Peter Alec Underwood", why: "old-school upper-class English", s: 0.45, st: 0.3, sp: 1.0 },
  kantorovich: { id: "XaEUesE01wKIKaa0xI0h", lib: "Alex - Calm, Stable and Confident", why: "calm, analytical Russian accent", s: 0.6, st: 0.1, sp: 0.95 },

  kahneman: { id: "QTsFt9OpsJoyxbXFpdFz", lib: "DR Parr M4B", why: "thoughtful older professor", s: 0.55, st: 0.15, sp: 0.93 },
  friedman: { id: "pqHfZKP75CvOlQylNhV4", lib: "Bill", why: "crisp, upbeat older American", s: 0.45, st: 0.3, sp: 1.05 },
  samuelson: { id: "kJQzNtKOEkJ2Y7ui1GTM", lib: "Biz Professor H.", why: "cheerful economics professor", s: 0.5, st: 0.2, sp: 1.0 },
  hayek: { id: "LdrOKpb095fRo6KyS8jU", lib: "Maximilian", why: "courteous Viennese accent", s: 0.6, st: 0.15, sp: 0.92 },
  ostrom: { id: "8fwYhwfiWkLjR4FKLHSQ", lib: "Elise Hart - Warm, Clear & Engaging", why: "friendly, down-to-earth American", s: 0.5, st: 0.2, sp: 1.0 },

  tagore: { id: "bbGyqGAEIg7zLT7U2n9A", lib: "Dr. Eddyee Siingh - Warm and Mature", why: "warm, gentle Indian accent", s: 0.5, st: 0.25, sp: 0.9 },
  hemingway: { id: "qE598pWTKNVcF4JNLrNs", lib: "OTIS", why: "rugged, adventurous older American", s: 0.45, st: 0.3, sp: 0.95 },
  camus: { id: "bObiIpcSB2feMOHORpee", lib: "Antonin - Warm, Unsettling, Elegant", why: "warm, gravelly French accent", s: 0.45, st: 0.3, sp: 0.95 },
  marquez: { id: "VwFqNuzKDBHmXscEaKvX", lib: "Alejandro – Warm Latin Storyteller", why: "warm Latin American storyteller", s: 0.4, st: 0.35, sp: 0.97 },
  morrison: { id: "MHPwHxLx0nmGIb5Jnbly", lib: "Empress J", why: "strong, wise Black American woman", s: 0.5, st: 0.25, sp: 0.93 },

  mlk: { id: "87tjwokZlpNU7QL3HaLP", lib: "Reverend – Powerful Preacher, Motivational Speaker", why: "rich, rhythmic preacher's voice", s: 0.4, st: 0.4, sp: 0.95 },
  mandela: { id: "zGYoZfz0DfQp20tGXUMu", lib: "Danny Banda - Africa", why: "Southern African speaker", s: 0.55, st: 0.2, sp: 0.9 },
  teresa: { id: "wGcFBfKz5yUQqhqr0mVy", lib: "Maria Moody | Grandmotherly Storykeeper", why: "gentle, patient elderly woman", s: 0.6, st: 0.1, sp: 0.9 },
  maathai: { id: "hrMENUPSbAbVQk6jkV5k", lib: "Maryanne - Soulful, calm and empowering", why: "warm Kenyan-influenced English", s: 0.45, st: 0.3, sp: 0.97 },
  bunche: { id: "44CMwb4cPyXxxMfAMljI", lib: "Odom - Measured, Clear, Instructional", why: "measured, calm diplomat", s: 0.6, st: 0.1, sp: 0.95 },
};

// Built-in ElevenLabs voices every account has. Used only if a library voice
// can't be added to your account (for example, your plan's voice slots are full).
export const FALLBACK_VOICES = {
  m_old: "pqHfZKP75CvOlQylNhV4", // Bill
  m: "JBFqnCBsd6RMkjVDRZzb", // George
  f: "Xb7hH8MSUJpSbSDYk0k2", // Alice
};
