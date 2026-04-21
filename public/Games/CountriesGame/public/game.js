/* =====================================================================
   Countries of the World  —  game.js
   ===================================================================== */

'use strict';

// ── Country data ────────────────────────────────────────────────────────
const ALL_COUNTRIES = [
  // ── Africa (54) ──────────────────────────────────────────────────────
  { name:"Algeria",                          id:12,  continent:"Africa",        alt:[] },
  { name:"Angola",                           id:24,  continent:"Africa",        alt:[] },
  { name:"Benin",                            id:204, continent:"Africa",        alt:[] },
  { name:"Botswana",                         id:72,  continent:"Africa",        alt:[] },
  { name:"Burkina Faso",                     id:854, continent:"Africa",        alt:[] },
  { name:"Burundi",                          id:108, continent:"Africa",        alt:[] },
  { name:"Cameroon",                         id:120, continent:"Africa",        alt:[] },
  { name:"Cape Verde",                       id:132, continent:"Africa",        alt:["cabo verde","cape verde islands"] },
  { name:"Central African Republic",         id:140, continent:"Africa",        alt:["car","central africa"] },
  { name:"Chad",                             id:148, continent:"Africa",        alt:[] },
  { name:"Comoros",                          id:174, continent:"Africa",        alt:["comoro islands","the comoros"] },
  { name:"Congo",                            id:178, continent:"Africa",        alt:["republic of congo","republic of the congo","congo republic","congo brazzaville","brazzaville"] },
  { name:"DR Congo",                         id:180, continent:"Africa",        alt:["democratic republic of congo","democratic republic of the congo","drc","congo kinshasa","zaire","drcongo"] },
  { name:"Djibouti",                         id:262, continent:"Africa",        alt:[] },
  { name:"Egypt",                            id:818, continent:"Africa",        alt:[] },
  { name:"Equatorial Guinea",                id:226, continent:"Africa",        alt:[] },
  { name:"Eritrea",                          id:232, continent:"Africa",        alt:[] },
  { name:"Eswatini",                         id:748, continent:"Africa",        alt:["swaziland"] },
  { name:"Ethiopia",                         id:231, continent:"Africa",        alt:[] },
  { name:"Gabon",                            id:266, continent:"Africa",        alt:[] },
  { name:"Gambia",                           id:270, continent:"Africa",        alt:["the gambia"] },
  { name:"Ghana",                            id:288, continent:"Africa",        alt:[] },
  { name:"Guinea",                           id:324, continent:"Africa",        alt:[] },
  { name:"Guinea-Bissau",                    id:624, continent:"Africa",        alt:["guinea bissau"] },
  { name:"Ivory Coast",                      id:384, continent:"Africa",        alt:["cote d ivoire","cote divoire","ivory coast","la cote divoire","ci"] },
  { name:"Kenya",                            id:404, continent:"Africa",        alt:[] },
  { name:"Lesotho",                          id:426, continent:"Africa",        alt:[] },
  { name:"Liberia",                          id:430, continent:"Africa",        alt:[] },
  { name:"Libya",                            id:434, continent:"Africa",        alt:[] },
  { name:"Madagascar",                       id:450, continent:"Africa",        alt:[] },
  { name:"Malawi",                           id:454, continent:"Africa",        alt:[] },
  { name:"Mali",                             id:466, continent:"Africa",        alt:[] },
  { name:"Mauritania",                       id:478, continent:"Africa",        alt:["mauritanie","mauritiana"] },
  { name:"Mauritius",                        id:480, continent:"Africa",        alt:[] },
  { name:"Morocco",                          id:504, continent:"Africa",        alt:[] },
  { name:"Mozambique",                       id:508, continent:"Africa",        alt:[] },
  { name:"Namibia",                          id:516, continent:"Africa",        alt:[] },
  { name:"Niger",                            id:562, continent:"Africa",        alt:[] },
  { name:"Nigeria",                          id:566, continent:"Africa",        alt:[] },
  { name:"Rwanda",                           id:646, continent:"Africa",        alt:[] },
  { name:"São Tomé and Príncipe",            id:678, continent:"Africa",        alt:["sao tome and principe","sao tome","sao tome principe"] },
  { name:"Senegal",                          id:686, continent:"Africa",        alt:[] },
  { name:"Seychelles",                       id:690, continent:"Africa",        alt:[] },
  { name:"Sierra Leone",                     id:694, continent:"Africa",        alt:[] },
  { name:"Somalia",                          id:706, continent:"Africa",        alt:[] },
  { name:"South Africa",                     id:710, continent:"Africa",        alt:["rsa"] },
  { name:"South Sudan",                      id:728, continent:"Africa",        alt:[] },
  { name:"Sudan",                            id:729, continent:"Africa",        alt:[] },
  { name:"Tanzania",                         id:834, continent:"Africa",        alt:[] },
  { name:"Togo",                             id:768, continent:"Africa",        alt:[] },
  { name:"Tunisia",                          id:788, continent:"Africa",        alt:[] },
  { name:"Uganda",                           id:800, continent:"Africa",        alt:[] },
  { name:"Zambia",                           id:894, continent:"Africa",        alt:[] },
  { name:"Zimbabwe",                         id:716, continent:"Africa",        alt:[] },

  // ── Asia (49) ────────────────────────────────────────────────────────
  { name:"Afghanistan",                      id:4,   continent:"Asia",          alt:[] },
  { name:"Armenia",                          id:51,  continent:"Asia",          alt:[] },
  { name:"Azerbaijan",                       id:31,  continent:"Asia",          alt:[] },
  { name:"Bahrain",                          id:48,  continent:"Asia",          alt:[] },
  { name:"Bangladesh",                       id:50,  continent:"Asia",          alt:[] },
  { name:"Bhutan",                           id:64,  continent:"Asia",          alt:[] },
  { name:"Brunei",                           id:96,  continent:"Asia",          alt:["brunei darussalam"] },
  { name:"Cambodia",                         id:116, continent:"Asia",          alt:[] },
  { name:"China",                            id:156, continent:"Asia",          alt:["prc","peoples republic of china"] },
  { name:"Cyprus",                           id:196, continent:"Asia",          alt:[] },
  { name:"East Timor",                       id:626, continent:"Asia",          alt:["timor-leste","timor leste","timorleste"] },
  { name:"Georgia",                          id:268, continent:"Asia",          alt:[] },
  { name:"India",                            id:356, continent:"Asia",          alt:[] },
  { name:"Indonesia",                        id:360, continent:"Asia",          alt:[] },
  { name:"Iran",                             id:364, continent:"Asia",          alt:[] },
  { name:"Iraq",                             id:368, continent:"Asia",          alt:[] },
  { name:"Israel",                           id:376, continent:"Asia",          alt:[] },
  { name:"Japan",                            id:392, continent:"Asia",          alt:[] },
  { name:"Jordan",                           id:400, continent:"Asia",          alt:[] },
  { name:"Kazakhstan",                       id:398, continent:"Asia",          alt:[] },
  { name:"Kuwait",                           id:414, continent:"Asia",          alt:[] },
  { name:"Kyrgyzstan",                       id:417, continent:"Asia",          alt:["kyrgyz republic","kyrgyz"] },
  { name:"Laos",                             id:418, continent:"Asia",          alt:[] },
  { name:"Lebanon",                          id:422, continent:"Asia",          alt:[] },
  { name:"Malaysia",                         id:458, continent:"Asia",          alt:[] },
  { name:"Maldives",                         id:462, continent:"Asia",          alt:[] },
  { name:"Mongolia",                         id:496, continent:"Asia",          alt:[] },
  { name:"Myanmar",                          id:104, continent:"Asia",          alt:["burma"] },
  { name:"Nepal",                            id:524, continent:"Asia",          alt:[] },
  { name:"North Korea",                      id:408, continent:"Asia",          alt:["dprk","korea north"] },
  { name:"Oman",                             id:512, continent:"Asia",          alt:[] },
  { name:"Pakistan",                         id:586, continent:"Asia",          alt:[] },
  { name:"Palestine",                        id:275, continent:"Asia",          alt:["palestinian territories","west bank","gaza","palestinian authority"] },
  { name:"Philippines",                      id:608, continent:"Asia",          alt:[] },
  { name:"Qatar",                            id:634, continent:"Asia",          alt:[] },
  { name:"Saudi Arabia",                     id:682, continent:"Asia",          alt:["ksa"] },
  { name:"Singapore",                        id:702, continent:"Asia",          alt:[] },
  { name:"South Korea",                      id:410, continent:"Asia",          alt:["korea","republic of korea","korea south"] },
  { name:"Sri Lanka",                        id:144, continent:"Asia",          alt:["ceylon"] },
  { name:"Syria",                            id:760, continent:"Asia",          alt:[] },
  { name:"Taiwan",                           id:158, continent:"Asia",          alt:["roc","republic of china"] },
  { name:"Tajikistan",                       id:762, continent:"Asia",          alt:[] },
  { name:"Thailand",                         id:764, continent:"Asia",          alt:[] },
  { name:"Turkey",                           id:792, continent:"Asia",          alt:["turkiye"] },
  { name:"Turkmenistan",                     id:795, continent:"Asia",          alt:[] },
  { name:"United Arab Emirates",             id:784, continent:"Asia",          alt:["uae","emirates"] },
  { name:"Uzbekistan",                       id:860, continent:"Asia",          alt:[] },
  { name:"Vietnam",                          id:704, continent:"Asia",          alt:["viet nam"] },
  { name:"Yemen",                            id:887, continent:"Asia",          alt:[] },

  // ── Europe (45) ──────────────────────────────────────────────────────
  { name:"Albania",                          id:8,   continent:"Europe",        alt:[] },
  { name:"Andorra",                          id:20,  continent:"Europe",        alt:[] },
  { name:"Austria",                          id:40,  continent:"Europe",        alt:[] },
  { name:"Belarus",                          id:112, continent:"Europe",        alt:[] },
  { name:"Belgium",                          id:56,  continent:"Europe",        alt:[] },
  { name:"Bosnia and Herzegovina",           id:70,  continent:"Europe",        alt:["bosnia","bosnia-herzegovina","bosnia & herzegovina","bosnia herzegovina","bih"] },
  { name:"Bulgaria",                         id:100, continent:"Europe",        alt:[] },
  { name:"Croatia",                          id:191, continent:"Europe",        alt:[] },
  { name:"Czech Republic",                   id:203, continent:"Europe",        alt:["czechia","czech","czechrepublic"] },
  { name:"Denmark",                          id:208, continent:"Europe",        alt:[] },
  { name:"Estonia",                          id:233, continent:"Europe",        alt:[] },
  { name:"Finland",                          id:246, continent:"Europe",        alt:[] },
  { name:"France",                           id:250, continent:"Europe",        alt:[] },
  { name:"Germany",                          id:276, continent:"Europe",        alt:[] },
  { name:"Greece",                           id:300, continent:"Europe",        alt:[] },
  { name:"Hungary",                          id:348, continent:"Europe",        alt:[] },
  { name:"Iceland",                          id:352, continent:"Europe",        alt:[] },
  { name:"Ireland",                          id:372, continent:"Europe",        alt:[] },
  { name:"Italy",                            id:380, continent:"Europe",        alt:[] },
  { name:"Kosovo",                           id:383, continent:"Europe",        alt:[] },
  { name:"Latvia",                           id:428, continent:"Europe",        alt:[] },
  { name:"Liechtenstein",                    id:438, continent:"Europe",        alt:[] },
  { name:"Lithuania",                        id:440, continent:"Europe",        alt:[] },
  { name:"Luxembourg",                       id:442, continent:"Europe",        alt:[] },
  { name:"Malta",                            id:470, continent:"Europe",        alt:[] },
  { name:"Moldova",                          id:498, continent:"Europe",        alt:["republic of moldova"] },
  { name:"Monaco",                           id:492, continent:"Europe",        alt:[] },
  { name:"Montenegro",                       id:499, continent:"Europe",        alt:[] },
  { name:"Netherlands",                      id:528, continent:"Europe",        alt:["holland","the netherlands"] },
  { name:"North Macedonia",                  id:807, continent:"Europe",        alt:["macedonia","fyrom"] },
  { name:"Norway",                           id:578, continent:"Europe",        alt:[] },
  { name:"Poland",                           id:616, continent:"Europe",        alt:[] },
  { name:"Portugal",                         id:620, continent:"Europe",        alt:[] },
  { name:"Romania",                          id:642, continent:"Europe",        alt:[] },
  { name:"Russia",                           id:643, continent:"Europe",        alt:["russian federation","russsia","rusia"] },
  { name:"San Marino",                       id:674, continent:"Europe",        alt:[] },
  { name:"Serbia",                           id:688, continent:"Europe",        alt:[] },
  { name:"Slovakia",                         id:703, continent:"Europe",        alt:[] },
  { name:"Slovenia",                         id:705, continent:"Europe",        alt:[] },
  { name:"Spain",                            id:724, continent:"Europe",        alt:[] },
  { name:"Sweden",                           id:752, continent:"Europe",        alt:[] },
  { name:"Switzerland",                      id:756, continent:"Europe",        alt:["swiss"] },
  { name:"Ukraine",                          id:804, continent:"Europe",        alt:[] },
  { name:"United Kingdom",                   id:826, continent:"Europe",        alt:["uk","great britain","england","britain","gb"] },
  { name:"Vatican City",                     id:336, continent:"Europe",        alt:["holy see","vatican"] },

  // ── North America (23) ───────────────────────────────────────────────
  { name:"Antigua and Barbuda",              id:28,  continent:"North America", alt:["antigua","antigua & barbuda"] },
  { name:"Bahamas",                          id:44,  continent:"North America", alt:["the bahamas"] },
  { name:"Barbados",                         id:52,  continent:"North America", alt:[] },
  { name:"Belize",                           id:84,  continent:"North America", alt:[] },
  { name:"Canada",                           id:124, continent:"North America", alt:[] },
  { name:"Costa Rica",                       id:188, continent:"North America", alt:[] },
  { name:"Cuba",                             id:192, continent:"North America", alt:[] },
  { name:"Dominica",                         id:212, continent:"North America", alt:[] },
  { name:"Dominican Republic",               id:214, continent:"North America", alt:["dr","dominican rep"] },
  { name:"El Salvador",                      id:222, continent:"North America", alt:["salvador"] },
  { name:"Grenada",                          id:308, continent:"North America", alt:[] },
  { name:"Guatemala",                        id:320, continent:"North America", alt:[] },
  { name:"Haiti",                            id:332, continent:"North America", alt:[] },
  { name:"Honduras",                         id:340, continent:"North America", alt:[] },
  { name:"Jamaica",                          id:388, continent:"North America", alt:[] },
  { name:"Mexico",                           id:484, continent:"North America", alt:[] },
  { name:"Nicaragua",                        id:558, continent:"North America", alt:[] },
  { name:"Panama",                           id:591, continent:"North America", alt:[] },
  { name:"Saint Kitts and Nevis",            id:659, continent:"North America", alt:["st kitts","st kitts and nevis","saint kitts","st kitts nevis","saint kitts nevis","stkitts"] },
  { name:"Saint Lucia",                      id:662, continent:"North America", alt:["st lucia","st. lucia"] },
  { name:"Saint Vincent and the Grenadines", id:670, continent:"North America", alt:["st vincent","st vincent and the grenadines","saint vincent","st vincent grenadines","saint vincent grenadines"] },
  { name:"Trinidad and Tobago",              id:780, continent:"North America", alt:["trinidad","tobago","t&t","tt"] },
  { name:"United States",                    id:840, continent:"North America", alt:["usa","us","united states of america","america","the us","the usa"] },

  // ── Oceania (14) ─────────────────────────────────────────────────────
  { name:"Australia",                        id:36,  continent:"Oceania",       alt:["oz","aus"] },
  { name:"Fiji",                             id:242, continent:"Oceania",       alt:[] },
  { name:"Kiribati",                         id:296, continent:"Oceania",       alt:[] },
  { name:"Marshall Islands",                 id:584, continent:"Oceania",       alt:["marshall"] },
  { name:"Micronesia",                       id:583, continent:"Oceania",       alt:["federated states of micronesia","fsm"] },
  { name:"Nauru",                            id:520, continent:"Oceania",       alt:[] },
  { name:"New Zealand",                      id:554, continent:"Oceania",       alt:["nz","aotearoa"] },
  { name:"Palau",                            id:585, continent:"Oceania",       alt:[] },
  { name:"Papua New Guinea",                 id:598, continent:"Oceania",       alt:["png"] },
  { name:"Samoa",                            id:882, continent:"Oceania",       alt:["western samoa"] },
  { name:"Solomon Islands",                  id:90,  continent:"Oceania",       alt:["solomons"] },
  { name:"Tonga",                            id:776, continent:"Oceania",       alt:[] },
  { name:"Tuvalu",                           id:798, continent:"Oceania",       alt:[] },
  { name:"Vanuatu",                          id:548, continent:"Oceania",       alt:[] },

  // ── South America (12) ───────────────────────────────────────────────
  { name:"Argentina",                        id:32,  continent:"South America", alt:[] },
  { name:"Bolivia",                          id:68,  continent:"South America", alt:[] },
  { name:"Brazil",                           id:76,  continent:"South America", alt:["brasil"] },
  { name:"Chile",                            id:152, continent:"South America", alt:[] },
  { name:"Colombia",                         id:170, continent:"South America", alt:[] },
  { name:"Ecuador",                          id:218, continent:"South America", alt:[] },
  { name:"Guyana",                           id:328, continent:"South America", alt:[] },
  { name:"Paraguay",                         id:600, continent:"South America", alt:[] },
  { name:"Peru",                             id:604, continent:"South America", alt:[] },
  { name:"Suriname",                         id:740, continent:"South America", alt:["surinam"] },
  { name:"Uruguay",                          id:858, continent:"South America", alt:[] },
  { name:"Venezuela",                        id:862, continent:"South America", alt:[] },

];

// Antarctica is an easter egg — not in the main list or count
const ANTARCTICA_EASTER = { name:"Antarctica", id:10, alt:["antartic","antartica","antarcta"] };
const ANTARCTICA_NORMS  = new Set([normalize("Antarctica"), ...ANTARCTICA_EASTER.alt.map(normalize)]);

const TOTAL = ALL_COUNTRIES.length; // 197 (Antarctica is an easter egg)

const CONTINENT_ORDER = [
  "Africa", "Asia", "Europe", "North America", "Oceania", "South America"
];

// ── Territories: when a sovereign country is guessed, also highlight
//    these dependent/associated territories on the map. ──────────────────
// Key = topojson feature ID of territory, Value = parent country ID.
const TERRITORY_OF = {
  304: 208,  // Greenland           → Denmark
  234: 208,  // Faroe Islands       → Denmark
  254: 250,  // French Guiana       → France
  312: 250,  // Guadeloupe          → France
  474: 250,  // Martinique          → France
  638: 250,  // Réunion             → France
  540: 250,  // New Caledonia       → France
  258: 250,  // French Polynesia    → France
  175: 250,  // Mayotte             → France
  238: 826,  // Falkland Islands    → United Kingdom
  654: 826,  // St Helena           → United Kingdom
  630: 840,  // Puerto Rico         → United States
  850: 840,  // US Virgin Islands   → United States
  316: 840,  // Guam                → United States
  580: 840,  // N. Mariana Islands  → United States
  16:  840,  // American Samoa      → United States
  744: 578,  // Svalbard            → Norway
  184: 554,  // Cook Islands        → New Zealand
  570: 554,  // Niue                → New Zealand
};

// ── Manual dot positions [lon, lat] for tiny islands not reliably
//    represented in the 50m topojson at this zoom level. ─────────────────
const MANUAL_DOT_COORDS = {
  798: [179.2,  -8.0],   // Tuvalu
  520: [166.9,  -0.5],   // Nauru
  584: [168.0,   7.1],   // Marshall Islands
  585: [134.5,   7.5],   // Palau
  296: [-157.4,  1.9],   // Kiribati (Christmas Island part)
  583: [158.2,   6.9],   // Micronesia
  882: [-172.2, -13.6],  // Samoa
  776: [-175.2, -21.2],  // Tonga
  336: [12.45,  41.9],   // Vatican City
  492: [7.42,   43.73],  // Monaco
  674: [12.46,  43.94],  // San Marino
  438: [9.55,   47.17],  // Liechtenstein
  20:  [1.52,   42.55],  // Andorra
};

// ── Text normalisation ───────────────────────────────────────────────────
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Exact lookup map: normalised string → country
const EXACT = new Map();
ALL_COUNTRIES.forEach(c => {
  EXACT.set(normalize(c.name), c);
  c.alt.forEach(a => EXACT.set(normalize(a), c));
});

// ── Fuzzy matching (Levenshtein) ─────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({length: n + 1}, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i-1] === b[j-1]
        ? prev[j-1]
        : 1 + Math.min(prev[j], curr[j-1], prev[j-1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function maxDist(len) {
  if (len <= 4) return 0;
  if (len <= 7) return 1;
  return 2;
}

function fuzzyLookup(norm) {
  let best = null, bestDist = Infinity, tie = false;
  const threshold = maxDist(norm.length);
  for (const country of ALL_COUNTRIES) {
    for (const cand of [normalize(country.name), ...country.alt.map(normalize)]) {
      if (Math.abs(cand.length - norm.length) > threshold + 1) continue;
      const d = levenshtein(norm, cand);
      if (d < bestDist) { bestDist = d; best = country; tie = false; }
      else if (d === bestDist && country !== best) { tie = true; }
    }
  }
  return (bestDist <= threshold && !tie) ? best : null;
}

function lookupCountry(raw) {
  const norm = normalize(raw);
  if (!norm) return null;
  return EXACT.get(norm) ?? fuzzyLookup(norm);
}

// ── State ────────────────────────────────────────────────────────────────
let guessed          = new Set();
let timerHandle      = null;
let startTime        = null;
let elapsed          = 0;
let gameOver         = false;
let easterEggGuessed = false;
let isZoomed         = false;
let zoomBehavior     = null;
let mapGroup         = null;
let W_map            = 960;

// ── DOM refs ─────────────────────────────────────────────────────────────
const inputEl        = document.getElementById('countryInput');
const countEl        = document.getElementById('count');
const timerEl        = document.getElementById('timer');
const toastEl        = document.getElementById('toast');
const overlayEl      = document.getElementById('overlay');
const overlayTitle   = document.getElementById('overlayTitle');
const overlayBody    = document.getElementById('overlayBody');
const historyBtn     = document.getElementById('historyBtn');
const historySection = document.getElementById('history-section');
const mapLoading     = document.getElementById('map-loading');
const dotsToggle     = document.getElementById('dotsToggle');
const mapSvg         = document.getElementById('world-map');
const overlayXBtn    = document.getElementById('overlayX');
const themeToggle    = document.getElementById('themeToggle');

// ── Toast ────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'ok', duration = 2000) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.className = `toast visible${type === 'warn' ? ' warn' : type === 'err' ? ' err' : ''}`;
  toastTimer = setTimeout(() => toastEl.classList.replace('visible', 'hidden'), duration);
}

// ── Timer ────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startTimer() {
  startTime = Date.now() - elapsed * 1000;
  timerHandle = setInterval(() => {
    elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
  }, 500);
}

function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
  if (startTime) elapsed = Math.floor((Date.now() - startTime) / 1000);
}

// ── Theme ────────────────────────────────────────────────────────────────
(function() {
  const saved = localStorage.getItem('lightTheme') === 'true';
  themeToggle.checked = saved;
  document.body.classList.toggle('light-theme', saved);
})();

themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('light-theme', themeToggle.checked);
  localStorage.setItem('lightTheme', themeToggle.checked);
});

// ── Session persistence (localStorage) ──────────────────────────────────
const SAVE_KEY = 'countriesGame_v1';

function saveProgress() {
  if (gameOver) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    guessedIds: [...guessed],
    elapsed
  }));
}

function clearProgress() {
  localStorage.removeItem(SAVE_KEY);
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Session API ──────────────────────────────────────────────────────────
async function apiRecordWin(seconds) {
  try {
    await fetch('/api/win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seconds })
    });
  } catch(e) { console.warn('Could not record win', e); }
}

// ── Country list UI ──────────────────────────────────────────────────────
const continentCounts = {};
CONTINENT_ORDER.forEach(cont => {
  continentCounts[cont] = {
    total: ALL_COUNTRIES.filter(c => c.continent === cont).length,
    guessed: 0
  };
});

function buildCountryList() {
  const grid = document.getElementById('continents-grid');
  grid.innerHTML = '';
  CONTINENT_ORDER.forEach(cont => {
    const countries = ALL_COUNTRIES
      .filter(c => c.continent === cont)
      .sort((a, b) => a.name.localeCompare(b.name));

    const block = document.createElement('div');
    block.className = 'continent-block';
    block.innerHTML = `
      <div class="continent-title">
        <span>${cont}</span>
        <span class="continent-counter" id="counter-${cont.replace(/ /g,'-')}">
          0 / ${countries.length}
        </span>
      </div>`;

    countries.forEach(c => {
      const item = document.createElement('div');
      item.className = 'country-item';
      item.id = `li-${c.id}`;
      const barW = Math.max(50, Math.min(160, c.name.length * 7));
      item.innerHTML =
        `<span class="check"></span>` +
        `<span class="label"><span class="blank-bar" style="width:${barW}px"></span></span>`;
      block.appendChild(item);
    });
    grid.appendChild(block);
  });
}

function revealInList(countryId, cls) {
  const country = ALL_COUNTRIES.find(c => c.id === countryId);
  const el = document.getElementById(`li-${countryId}`);
  if (!el || !country) return;
  el.classList.add(cls);
  el.querySelector('.label').textContent = country.name;
}

function markListGuessed(countryId) {
  revealInList(countryId, 'guessed');
  const cont = ALL_COUNTRIES.find(c => c.id === countryId)?.continent;
  if (cont) {
    continentCounts[cont].guessed++;
    const el = document.getElementById(`counter-${cont.replace(/ /g, '-')}`);
    if (el) el.textContent = `${continentCounts[cont].guessed} / ${continentCounts[cont].total}`;
  }
}

function markListMissed(countryId) {
  revealInList(countryId, 'missed');
}

function resetList() {
  CONTINENT_ORDER.forEach(cont => {
    continentCounts[cont].guessed = 0;
    const el = document.getElementById(`counter-${cont.replace(/ /g, '-')}`);
    if (el) el.textContent = `0 / ${continentCounts[cont].total}`;
  });
  document.querySelectorAll('.country-item').forEach(el => {
    el.classList.remove('guessed', 'missed');
    const id = parseInt(el.id.replace('li-', ''));
    const country = ALL_COUNTRIES.find(c => c.id === id);
    if (country) {
      const barW = Math.max(50, Math.min(160, country.name.length * 7));
      el.querySelector('.label').innerHTML =
        `<span class="blank-bar" style="width:${barW}px"></span>`;
    }
  });
}

// ── Map ──────────────────────────────────────────────────────────────────
let svgSel, pathGen, proj;

function zoomToFeature(feature) {
  const [[x0, y0], [x1, y1]] = pathGen.bounds(feature);
  const bW = Math.max(x1 - x0, 1), bH = Math.max(y1 - y0, 1);
  const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2;
  const scale = Math.min(8, 0.85 * Math.min(W_map / bW, 540 / bH));
  const tx = W_map / 2 - scale * midX;
  const ty = 540    / 2 - scale * midY;
  svgSel.transition().duration(750)
    .call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  isZoomed = true;
  mapSvg.classList.add('map-zoomed');
}

function resetZoomView() {
  if (!zoomBehavior) return;
  svgSel.transition().duration(600)
    .call(zoomBehavior.transform, d3.zoomIdentity);
  isZoomed = false;
  mapSvg.classList.remove('map-zoomed');
}

const tooltip = document.createElement('div');
tooltip.className = 'map-tooltip';
tooltip.style.display = 'none';
document.getElementById('map-container').appendChild(tooltip);

async function initMap() {
  const container = document.getElementById('map-container');
  W_map = container.clientWidth || 960;
  const H = 540;

  svgSel = d3.select('#world-map')
    .attr('viewBox', `0 0 ${W_map} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  proj = d3.geoNaturalEarth1();
  proj.fitExtent([[4, 8], [W_map - 4, H - 8]], { type: 'Sphere' });
  pathGen = d3.geoPath().projection(proj);

  // All map content lives in this group so D3 zoom can transform it together
  mapGroup = svgSel.append('g').attr('id', 'map-group');

  mapGroup.append('path').datum({ type: 'Sphere' }).attr('class', 'sphere').attr('d', pathGen)
    .on('click', () => { if (isZoomed) resetZoomView(); });
  mapGroup.append('path').datum(d3.geoGraticule()()).attr('class', 'graticule').attr('d', pathGen);

  let world;
  try {
    world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
  } catch(e) {
    mapLoading.textContent = 'Map failed to load. Check your connection.';
    return;
  }
  mapLoading.style.display = 'none';

  const features = topojson.feature(world, world.objects.countries).features;

  // Countries in a sub-group so raise() stays below the dots layer
  const countriesGroup = mapGroup.append('g').attr('id', 'countries-layer');

  countriesGroup.selectAll('.country')
    .data(features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('id', d => `path-${+d.id}`)
    .attr('d', pathGen)
    .on('mousemove', function(event, d) {
      const numId = +d.id;
      const c = ALL_COUNTRIES.find(c => c.id === numId);
      const parentId = TERRITORY_OF[numId];
      const parent = parentId ? ALL_COUNTRIES.find(c => c.id === parentId) : null;
      const label = c
        ? (guessed.has(c.id) ? c.name : '???')
        : parent
          ? (guessed.has(parent.id) ? `${d.id === 304 ? 'Greenland' : 'Territory'} (${parent.name})` : '???')
          : null;
      if (!label) return;
      tooltip.style.display = 'block';
      tooltip.style.left = (event.offsetX + 14) + 'px';
      tooltip.style.top  = (event.offsetY + 8)  + 'px';
      tooltip.textContent = label;
    })
    .on('mouseleave', () => { tooltip.style.display = 'none'; })
    .on('click', function(event, d) {
      if (isZoomed) { resetZoomView(); } else { zoomToFeature(d); }
    });

  // ── Dot hint layer (rendered above countries) ────────────────────────
  const dotsGroup = mapGroup.append('g').attr('id', 'dots-layer');
  const dotsPlaced = new Set();

  // Dots from topojson centroids (game countries only, not Antarctica)
  ALL_COUNTRIES.forEach(c => {
    const feat = features.find(f => +f.id === c.id);
    if (!feat) return;
    const [cx, cy] = pathGen.centroid(feat);
    if (isNaN(cx) || isNaN(cy)) return;
    dotsGroup.append('circle')
      .attr('class', 'country-dot')
      .attr('id', `dot-${c.id}`)
      .attr('cx', cx).attr('cy', cy).attr('r', 3);
    dotsPlaced.add(c.id);
  });

  // Manual fallback dots for islands too small for the 50m topojson
  ALL_COUNTRIES.forEach(c => {
    if (dotsPlaced.has(c.id)) return;
    const coords = MANUAL_DOT_COORDS[c.id];
    if (!coords) return;
    const [px, py] = proj(coords);
    if (isNaN(px) || isNaN(py)) return;
    dotsGroup.append('circle')
      .attr('class', 'country-dot')
      .attr('id', `dot-${c.id}`)
      .attr('cx', px).attr('cy', py).attr('r', 3);
  });

  // ── D3 zoom setup ────────────────────────────────────────────────────
  zoomBehavior = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', event => { mapGroup.attr('transform', event.transform); });
  svgSel.call(zoomBehavior);
  svgSel.on('dblclick.zoom', null); // disable built-in double-click zoom

  // Apply saved dots toggle state now that SVG exists
  const dotsOn = localStorage.getItem('dotsOn') === 'true';
  dotsToggle.checked = dotsOn;
  mapSvg.classList.toggle('dots-visible', dotsOn);
}

// ── Map helpers ───────────────────────────────────────────────────────────
function highlightPath(numId, cls) {
  let sel = d3.select(`#path-${numId}`);
  if (sel.empty()) sel = d3.selectAll('.country').filter(d => +d.id === numId);
  if (!sel.empty()) {
    sel.classed('guessed', false).classed('missed', false).classed(cls, true);
    sel.raise(); // bring to front within countries-layer (fixes Kosovo hidden under Serbia)
  }
}

function highlightCountry(countryId, cls = 'guessed') {
  // Main country path
  highlightPath(countryId, cls);

  // Dependent territories
  for (const [territId, parentId] of Object.entries(TERRITORY_OF)) {
    if (parentId === countryId) highlightPath(+territId, cls);
  }

  // Dot
  if (cls === 'guessed') {
    d3.select(`#dot-${countryId}`).classed('dot-done', true);
  }
}

function resetMap() {
  d3.selectAll('.country').classed('guessed', false).classed('missed', false);
  d3.selectAll('.country-dot').classed('dot-done', false);
  resetZoomView();
}

// Dots toggle — save preference to localStorage
dotsToggle.addEventListener('change', () => {
  mapSvg.classList.toggle('dots-visible', dotsToggle.checked);
  localStorage.setItem('dotsOn', dotsToggle.checked);
});

// ── Guess logic ──────────────────────────────────────────────────────────
function tryGuess(raw) {
  if (gameOver || !raw.trim()) return;

  // Antarctica easter egg — highlight but don't count toward total
  if (ANTARCTICA_NORMS.has(normalize(raw))) {
    inputEl.value = '';
    if (easterEggGuessed) {
      showToast('Antarctica already found!', 'warn', 1200);
    } else {
      easterEggGuessed = true;
      highlightPath(ANTARCTICA_EASTER.id, 'guessed');
      d3.select(`#dot-${ANTARCTICA_EASTER.id}`).classed('dot-done', true);
      showToast('🐧 Antarctica! (Secret easter egg)', 'ok', 3000);
    }
    return;
  }

  const country = lookupCountry(raw);
  if (!country) {
    showToast(`"${raw}" not recognised`, 'err', 1500);
    return;
  }

  if (guessed.has(country.id)) {
    showToast(`${country.name} already guessed!`, 'warn', 1200);
    inputEl.value = '';
    return;
  }

  guessed.add(country.id);
  highlightCountry(country.id, 'guessed');
  markListGuessed(country.id);
  saveProgress();
  countEl.textContent = `${guessed.size} / ${TOTAL}`;

  const exact = EXACT.has(normalize(raw));
  showToast(exact ? `✓ ${country.name}` : `✓ ${country.name}  (matched)`, 'ok', 1400);
  inputEl.value = '';

  if (guessed.size === TOTAL) finishGame(true, false);
}

// ── Game control ─────────────────────────────────────────────────────────
async function startGame(forceNew = false) {
  guessed.clear();
  elapsed          = 0;
  gameOver         = false;
  easterEggGuessed = false;
  stopTimer();

  resetMap(); // also resets zoom
  resetList();
  overlayEl.classList.add('hidden');
  inputEl.value = '';
  inputEl.disabled = false;

  if (!forceNew) {
    const saved = loadProgress();
    if (saved && saved.guessedIds?.length > 0) {
      elapsed = saved.elapsed ?? 0;
      for (const id of saved.guessedIds) {
        guessed.add(id);
        highlightCountry(id, 'guessed');
        markListGuessed(id);
      }
    }
  } else {
    clearProgress();
  }

  countEl.textContent = `${guessed.size} / ${TOTAL}`;
  timerEl.textContent = formatTime(elapsed);
  inputEl.focus();
  startTimer();
}

async function finishGame(completed, gaveUp) {
  clearProgress();
  stopTimer();
  gameOver = true;
  inputEl.disabled = true;

  const missed = ALL_COUNTRIES.filter(c => !guessed.has(c.id));
  missed.forEach(c => { highlightCountry(c.id, 'missed'); markListMissed(c.id); });

  if (completed) {
    await apiRecordWin(elapsed);
    overlayTitle.textContent = 'Congratulations!';
    overlayBody.textContent  = `You named all ${TOTAL} countries in ${formatTime(elapsed)}!`;
    overlayXBtn.style.display = 'none';
  } else {
    // Give up — don't record to DB; show X so user can close and inspect the map
    overlayTitle.textContent = 'You Lost';
    overlayBody.textContent  =
      `You got ${guessed.size} / ${TOTAL} in ${formatTime(elapsed)}.\n` +
      (missed.length ? `${missed.length} ${missed.length > 1 ? 'countries' : 'country'} shown in red.` : '');
    overlayXBtn.style.display = 'flex';
  }
  overlayEl.classList.remove('hidden');
}

// ── History ──────────────────────────────────────────────────────────────
async function loadHistory() {
  try {
    const rows = await fetch('/api/sessions').then(r => r.json());
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';

    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) clearBtn.style.display = rows.length ? 'inline-block' : 'none';

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-dim);text-align:center;padding:20px">No wins yet</td></tr>';
      return;
    }

    rows.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${s.id}</td>
        <td>${s.end_time || s.start_time}</td>
        <td>${formatTime(s.seconds)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteSession(${s.id})">Delete</button></td>`;
      tbody.appendChild(tr);
    });
  } catch(e) { console.warn('Could not load history', e); }
}

async function deleteSession(id) {
  if (!confirm(`Delete session #${id}?`)) return;
  await fetch(`/api/session/${id}`, { method: 'DELETE' });
  await loadHistory();
}

async function clearAllSessions() {
  if (!confirm('Delete ALL sessions? This cannot be undone.')) return;
  await fetch('/api/sessions', { method: 'DELETE' });
  await loadHistory();
}

// ── Event listeners ──────────────────────────────────────────────────────
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); tryGuess(inputEl.value.trim()); }
});

inputEl.addEventListener('input', () => {
  if (gameOver) return;
  const norm = normalize(inputEl.value);
  if (!norm) return;
  // Check antarctica easter egg exact match
  if (ANTARCTICA_NORMS.has(norm)) { tryGuess(inputEl.value); return; }
  const country = EXACT.get(norm);
  if (country && !guessed.has(country.id)) tryGuess(inputEl.value);
});

document.getElementById('giveUpBtn').addEventListener('click', async () => {
  if (gameOver) return;
  if (!confirm('Are you sure you want to give up?')) return;
  await finishGame(false, true);
});

// forceNew = true so these always start a fresh game and clear localStorage
document.getElementById('newGameBtn').addEventListener('click', () => startGame(true));
document.getElementById('overlayClose').addEventListener('click', () => startGame(true));

// X button on lose overlay: just close and let the user see the map
overlayXBtn.addEventListener('click', () => { overlayEl.classList.add('hidden'); });

historyBtn.addEventListener('click', async () => {
  const nowHidden = historySection.classList.toggle('hidden');
  historyBtn.textContent = nowHidden ? 'History' : 'Hide History';
  if (!nowHidden) await loadHistory();
});

// ── Boot ─────────────────────────────────────────────────────────────────
(async () => {
  buildCountryList();
  await initMap();
  await startGame(); // forceNew = false → will restore from localStorage if available
})();
