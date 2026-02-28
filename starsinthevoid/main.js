// ASCII Adventure Game - Clean, Single-Slot Version
// Requires lore.js for LORE_MESSAGES array

const asciiArt = {
    introConsole: [
        "   _____________________________",
        "  |  Series 800 Starcraft      |",
        "  |---------------------------|",
        "  |  [o]   [o]   [o]   [o]    |",
        "  |                           |",
        "  |         [*]               |",
        "  |      Enter Name           |",
        "  |___________________________|"
    ].join("\n"),
    starfield: [
        "   ____________________________________________________________________________  ",
    "  /                                                                            \\",
    " /   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]   [o]      \\",
        "|------------------------------------------------------------------------------|",
        "|  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|                                                                              |",
        "|   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *  |",
        "|______________________________________________________________________________|"
    ].join("\n"),
    bottomConsole: function(name, ly) {
        const inds = ['[o]','[o]','[o]','[o]'];
        try {
            if (window.__consoleBlinkOn) {
                const i = (window.__consoleBlinkIdx|0) % inds.length;
                inds[i] = '[*]';
            }
        } catch(e) {}
        return [
            "   _____________________________",
            "  |  Series 800 Starcraft      |",
            "  |---------------------------|",
            `  |  ${inds[0]}   ${inds[1]}   ${inds[2]}   ${inds[3]}    |`,
            "  |                           |",
            `  |   Pilot: ${name.padEnd(18)}|`,
            `  |   Lightyears: ${ly.toString().padEnd(12)}|`,
            "  |___________________________|"
        ].join("\n");
    }
};

let playerName = '';
let fuel = 0;
let currentScene = 'intro';
let lyGauge = 0;
let lyInterval = null;
let fuelLoreShown = false;
let starFrame = 0;
let beepOn = true;
let lyConversionOn = true; // DM->Ly conversion active when true
// DOM cache refs (assigned on demand)
let lyToggleWrapper = null;
let coPilotPurchased = false;
let coPilotActive = false;
let coPilotButtonAdded = false;
let coPilotSwitch = null;
let autoDMInterval = null;
let milestone50LoreShown = false; // only controls lore line (button is idempotent)
let coPilotOnlineLoreShown = false; // ensure online lore shows only once
let milestone50Fired = false; // fires exactly once when Lightyears crosses 50
let lookAroundLoreShown = false; // prevents duplicate environment lore
let developerMode = false; // cheat mode: name 'ajmemes'
let milestone100Fired = false; // lights on + state
let milestone100LoreShown = false; // show 100 Lightyears lore once
// ---- Shop & Upgrades State ----
let currentView = 'main'; // 'main' | 'shop' | 'collapser'
let coPilotLevel = 1; // each level adds +2 Dark-Matter/sec (base provided by constants)
// (Deprecated) engineLevel replaced by capacity/efficiency split
let engineLevel = 1; // legacy (kept for migration)
// New engine upgrade model:
let capacityLevel = 1; // Dark-Matter consumed per second (>=1)
let efficiencyLevel = 1; // Efficiency multiplier for Lightyears output (1x or 2x)
let stardust = 0;
let collapseCooldownUntil = 0; // timestamp ms
let starCollapserOnline = false;
// --- Collapser Bay State ---
let starCollapserBayOnline = false; // unlocked by spending Stardust
let collapserYieldBase = 1; // base Stardust per collapse click (1 -> 2 with upgrade)
let collapserCooldownUpgrades = 0; // each reduces cooldown by 1s, max 10
let collapserEfficiencyLevel = 1; // 1x base, 2x after efficiency upgrade
const CO_PILOT_BASE_GAIN = 2; // Dark-Matter/sec per co-pilot level
// Dynamic escalating costs (persisted)
let coPilotUpgradeCost = 150;
let capacityUpgradeCost = 200;
let efficiencyUpgradeCost = 500; // one-time
// Manual dump upgrade: each level adds +1 to click gain (start at Lvl 1)
let dumpUpgradeLevel = 1;
let dumpUpgradeCost = 100;
function getCoPilotUpgradeCost() { return coPilotUpgradeCost; }
function getCapacityUpgradeCost() { return capacityUpgradeCost; }
function getEfficiencyUpgradeCost() { return efficiencyUpgradeCost; }
function totalLyPerSecond() { return capacityLevel + (efficiencyLevel - 1); }
function getDumpUpgradeCost() { return dumpUpgradeCost; }
function currentClickGain() {
    const base = developerMode ? 100 : 1;
    return base + dumpUpgradeLevel;
}
function updateFuelButtonLabel() {
    const fb = document.getElementById('fuel-btn');
    if (fb) fb.textContent = `Dump Fuel (+${currentClickGain()})`;
}

function getSaveData() {
    const raw = localStorage.getItem('asciiSaveSlot');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Corrupted save detected. Removing.', e);
        localStorage.removeItem('asciiSaveSlot');
        return null;
    }
}
function setSaveData(data) {
    localStorage.setItem('asciiSaveSlot', JSON.stringify(data));
}
function saveGame() {
    const lySwitchEl = document.getElementById('ly-switch');
    if (lySwitchEl) lyConversionOn = lySwitchEl.checked;
    setSaveData({ playerName, fuel, currentScene, lyGauge, fuelLoreShown, lyConversionOn, milestone50LoreShown, coPilotPurchased, coPilotActive, coPilotButtonAdded, coPilotOnlineLoreShown, milestone50Fired, lookAroundLoreShown, developerMode, milestone100Fired, milestone100LoreShown, currentView, coPilotLevel, engineLevel, capacityLevel, efficiencyLevel, coPilotUpgradeCost, capacityUpgradeCost, efficiencyUpgradeCost, stardust, collapseCooldownUntil, starCollapserOnline, dumpUpgradeLevel, dumpUpgradeCost, starCollapserBayOnline, collapserYieldBase, collapserCooldownUpgrades, collapserEfficiencyLevel });
    // Save lore messages
    const loreText = document.getElementById('lore-text');
    if (loreText) {
        localStorage.setItem('asciiLoreText', loreText.innerHTML);
    }
    const msg = document.getElementById('save-msg');
    if (msg) {
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 1200);
    }
}

function restoreLoreText() {
    const loreText = document.getElementById('lore-text');
    const savedLore = localStorage.getItem('asciiLoreText');
    if (loreText && savedLore) {
        loreText.innerHTML = savedLore;
        // Trim to 6 newest entries if needed
        while (loreText.children.length > 6) {
            const oldest = loreText.lastElementChild;
            if (!oldest) break;
            oldest.remove();
        }
    }
}

function loadGame() {
    const data = getSaveData();
    if (data) {
        playerName = data.playerName;
        fuel = data.fuel || 0;
        currentScene = data.currentScene || 'intro';
        lyGauge = data.lyGauge || 0;
        fuelLoreShown = !!data.fuelLoreShown;
        lyConversionOn = (typeof data.lyConversionOn === 'boolean') ? data.lyConversionOn : lyConversionOn;
        milestone50LoreShown = !!data.milestone50LoreShown;
        coPilotPurchased = !!data.coPilotPurchased;
        coPilotActive = !!data.coPilotActive;
        coPilotButtonAdded = !!data.coPilotButtonAdded;
    coPilotOnlineLoreShown = !!data.coPilotOnlineLoreShown;
    milestone50Fired = !!data.milestone50Fired || lyGauge >= 50; // infer if already past
    lookAroundLoreShown = !!data.lookAroundLoreShown;
    milestone100Fired = !!data.milestone100Fired || lyGauge >= 100;
    milestone100LoreShown = !!data.milestone100LoreShown;
        currentView = data.currentView || 'main';
        coPilotLevel = data.coPilotLevel || 1;
    engineLevel = data.engineLevel || 1; // legacy
    capacityLevel = data.capacityLevel || engineLevel || 1;
    efficiencyLevel = data.efficiencyLevel || 1;
    coPilotUpgradeCost = data.coPilotUpgradeCost || Math.ceil(150 * Math.pow(1.2, (coPilotLevel - 1)));
    capacityUpgradeCost = data.capacityUpgradeCost || Math.ceil(200 * Math.pow(1.2, (capacityLevel - 1)));
    efficiencyUpgradeCost = data.efficiencyUpgradeCost || 500;
    stardust = data.stardust || 0;
    collapseCooldownUntil = data.collapseCooldownUntil || 0;
    starCollapserOnline = !!data.starCollapserOnline;
    // Collapser Bay
    starCollapserBayOnline = !!data.starCollapserBayOnline;
    collapserYieldBase = data.collapserYieldBase || 1;
    collapserCooldownUpgrades = data.collapserCooldownUpgrades || 0;
    collapserEfficiencyLevel = data.collapserEfficiencyLevel || 1;
    dumpUpgradeLevel = (typeof data.dumpUpgradeLevel === 'number') ? Math.max(1, data.dumpUpgradeLevel) : 1;
    dumpUpgradeCost = data.dumpUpgradeCost || Math.ceil(100 * Math.pow(1.2, dumpUpgradeLevel));
    restoreLoreText();
    developerMode = !!data.developerMode;
    if (developerMode && lyGauge < 45) lyGauge = 45;
        if (currentScene === 'starfield') {
            renderStarfield(true);
        } else {
            renderIntro();
        }
        // If subviews were open when saved, render their controls again
            if (currentView === 'shop') {
                ensureSystemsButton();
            // slight delay to ensure DOM nodes exist
            setTimeout(() => { renderShopControls(); }, 50);
        } else if (currentView === 'collapser' && starCollapserBayOnline) {
            ensureSystemsButton();
            ensureCollapserBayNavButton();
            setTimeout(() => { renderCollapserBayControls(); }, 50);
        }
        // Ensure stardust UI reflects saved state
        setTimeout(() => {
            ensureStardustUI();
            if (starCollapserBayOnline) ensureCollapserBayNavButton();
        }, 60);
    } else {
        renderIntro();
    }
}

function addLoreMessage(msg) {
    const loreText = document.getElementById('lore-text');
    if (!loreText) return;
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.7s';
    div.style.fontFamily = 'inherit';
    div.style.fontSize = '18px';
    div.style.background = 'none';
    div.style.padding = '0';
    div.style.margin = '0 0 36px 0';
    loreText.insertBefore(div, loreText.firstChild);
    // Track in ship log
    appendToShipLog(msg);
    // Strictly cap to 6 visible entries (immediate removal to avoid buildup during spam)
    while (loreText.children.length > 6) {
        const oldest = loreText.lastElementChild;
        if (!oldest) break;
        oldest.remove();
    }
    setTimeout(() => { div.style.opacity = '1'; }, 50);
}

// --- Ship log (persist all lore) ---
function appendToShipLog(msg) {
    try {
        const raw = localStorage.getItem('asciiLogBook');
        const log = raw ? JSON.parse(raw) : [];
        // Avoid consecutive identical duplicates
        if (log.length === 0 || log[log.length - 1].m !== msg) {
            log.push({ t: Date.now(), m: msg });
        }
        localStorage.setItem('asciiLogBook', JSON.stringify(log));
    } catch(e) { /* ignore */ }
}

function showLogBook() {
    // Simple overlay viewer to scroll to oldest message
    const existing = document.getElementById('ascii-logbook-overlay');
    if (existing) { existing.remove(); }
    const wrap = document.createElement('div');
    wrap.id = 'ascii-logbook-overlay';
    wrap.style.position = 'fixed';
    wrap.style.top = '0';
    wrap.style.left = '0';
    wrap.style.width = '100vw';
    wrap.style.height = '100vh';
    wrap.style.background = 'rgba(0,0,0,0.85)';
    wrap.style.zIndex = '99998';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    const inner = document.createElement('div');
    inner.style.maxWidth = '900px';
    inner.style.width = '90%';
    inner.style.maxHeight = '70vh';
    inner.style.overflow = 'auto';
    inner.style.background = '#222';
    inner.style.color = '#eee';
    inner.style.borderRadius = '12px';
    inner.style.boxShadow = '0 0 18px #000a';
    inner.style.padding = '24px';
    inner.style.position = 'relative';
    const title = document.createElement('div');
    title.textContent = 'Ship Logbook';
    title.style.fontSize = '20px';
    title.style.marginBottom = '12px';
    inner.appendChild(title);
    // Add close button at top-right
    const topClose = document.createElement('button');
    topClose.textContent = 'Close';
    topClose.style.position = 'absolute';
    topClose.style.top = '12px';
    topClose.style.right = '12px';
    topClose.style.padding = '6px 12px';
    topClose.style.border = 'none';
    topClose.style.borderRadius = '6px';
    topClose.style.background = '#555';
    topClose.style.color = '#fff';
    topClose.style.cursor = 'pointer';
    topClose.onclick = () => wrap.remove();
    inner.appendChild(topClose);
    const list = document.createElement('div');
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '12px';
    try {
        const raw = localStorage.getItem('asciiLogBook');
        let log = raw ? JSON.parse(raw) : [];
        // Newest-first in the overlay
        log = log.slice().reverse();
        // Remove adjacent duplicates in this view as well
        let last = null;
        for (const entry of log) {
            if (last && last.m === entry.m) { continue; }
            const row = document.createElement('div');
            row.textContent = new Date(entry.t).toLocaleString() + ' — ' + entry.m;
            row.style.fontSize = '15px';
            list.appendChild(row);
            last = entry;
        }
    } catch(e) {}
    inner.appendChild(list);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '12px';
    btns.style.marginTop = '16px';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.background = '#555';
    closeBtn.style.color = '#fff';
    closeBtn.onclick = () => wrap.remove();
    btns.appendChild(closeBtn);
    inner.appendChild(btns);
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
}

function renderIntro() {
    lyGauge = 0;
    if (lyInterval) { clearInterval(lyInterval); lyInterval = null; }
    if (window.consoleBlinkInterval) { clearInterval(window.consoleBlinkInterval); window.consoleBlinkInterval = null; }
    const fuelSection = document.getElementById('fuel-section');
    if (fuelSection) fuelSection.style.display = 'none';
    document.getElementById('ascii').textContent = asciiArt.introConsole;
    document.getElementById('output').textContent = '';
    document.getElementById('name-entry').style.display = 'block';
    beepOn = true;
    if (window.beepInterval) clearInterval(window.beepInterval);
    window.beepInterval = setInterval(() => {
        let art = asciiArt.introConsole.split("\n");
        art[5] = beepOn ? "  |         [*]               |" : "  |         [ ]               |";
        document.getElementById('ascii').textContent = art.join("\n");
        beepOn = !beepOn;
    }, 500);
    const loreText = document.getElementById('lore-text');
    if (loreText) loreText.innerHTML = '';
    setTimeout(() => {
        addLoreMessage(LORE_MESSAGES ? LORE_MESSAGES[0] : 'You awake slowly on the cold metallic floor of a dimly lit metal box. A small console blinks in front of you.');
    }, 0);

    // Hide DM->Ly toggle in intro
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (lyToggleWrapper) lyToggleWrapper.style.display = 'none';
}

function handleNameSubmit() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    if (name) {
        playerName = name;
        if (name.toLowerCase() === 'ajmemes') {
            developerMode = true;
            addLoreMessage('[DEV MODE ENABLED: +100 FUEL PER CLICK]');
            updateFuelButtonLabel();
        }
        currentScene = 'starfield';
        if (window.beepInterval) clearInterval(window.beepInterval);
    // Hide name entry UI after successful submission
    const nameEntry = document.getElementById('name-entry');
    if (nameEntry) nameEntry.style.display = 'none';
    nameInput.value = '';
        renderStarfield(false);
        const bottomBubble = document.getElementById('bottom-bubble');
        if (bottomBubble) bottomBubble.style.display = 'block';
        const fuelSection = document.getElementById('fuel-section');
    if (fuelSection) fuelSection.style.display = 'none';
        setTimeout(() => {
            fuel = 0;
            if (fuelSection) {
                fuelSection.style.display = 'flex';
                const fuelCount = document.getElementById('fuel-count');
                if (fuelCount) fuelCount.textContent = 'Dark-Matter: ' + fuel;
                updateFuelButtonLabel();
            }
            // environment lore handled in renderStarfield delayed reveal; removed duplicate here
        }, 5000);
    }
}

function ensureLyToggle() {
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (!lyToggleWrapper) return;
    lyToggleWrapper.style.display = 'block';
    const lySwitch = document.getElementById('ly-switch');
    if (lySwitch && !lySwitch.__wired) {
        lySwitch.addEventListener('change', e => {
            lyConversionOn = e.target.checked;
            // Update label text to reflect state
            const labelSpan = lyToggleWrapper ? lyToggleWrapper.querySelector('span') : null;
            if (labelSpan) labelSpan.textContent = lyConversionOn ? 'Engine On' : 'Engine Off';
        });
        lySwitch.__wired = true;
    }
    if (lySwitch) {
        lySwitch.checked = lyConversionOn; // reflect saved state
        const labelSpan = lyToggleWrapper ? lyToggleWrapper.querySelector('span') : null;
        if (labelSpan) labelSpan.textContent = lyConversionOn ? 'Engine On' : 'Engine Off';
    }
}

function generateRandomStarfield(width = 100, height = 14, starDensity = 0.07) {
    let field = [];
    // Deterministic parallax starfield: diagonal streaks moving to the left as starFrame increases
    const lines = [];
    const f = starFrame || 0;
    for (let y = 0; y < height; y++) {
        const row = new Array(width).fill(' ');
        // Layer 1: distant (sparse, slow, dots)
        const spacing1 = 11; const speed1 = 1;
        for (let x = 0; x < width; x++) {
            if (((x + y * 2 + f * speed1) % spacing1) === 0) row[x] = '.';
        }
        // Layer 2: mid (medium density, medium speed, stars)
        const spacing2 = 17; const speed2 = 2;
        for (let x = 0; x < width; x++) {
            if (((x + y * 3 + f * speed2) % spacing2) === 0) row[x] = '*';
        }
        // Layer 3: close (streaks, faster)
        const spacing3 = 23; const speed3 = 3;
        for (let x = 0; x < width; x++) {
            if (((x + y * 5 + f * speed3) % spacing3) === 0) {
                row[x] = '-';
                if (x + 1 < width) row[x + 1] = '-'; // tiny streak
            }
        }
        lines.push(row.join(''));
    }
    return lines;
}

function getStarFieldArt() {
    const width = 100;
    const height = 14;
    if (currentView === 'shop') {
        return getShopAscii(width);
    } else if (currentView === 'collapser') {
        return getCollapserBayAscii(width);
    }
    let starfield = generateRandomStarfield(width, height);
    let topBorder = '┌' + '─'.repeat(width) + '┐';
    let bottomBorder = '└' + '─'.repeat(width) + '┘';
    let boxedStarfield = [topBorder];
    for (let line of starfield) {
        boxedStarfield.push('│' + line + '│');
    }
    boxedStarfield.push(bottomBorder);
    let consoleArt = asciiArt.bottomConsole(playerName, lyGauge).split('\n');
    let consoleWidth = Math.max(...consoleArt.map(l => l.length));
    let leftPad = Math.floor((width - consoleWidth) / 2);
    let rightPad = width - consoleWidth - leftPad;
    consoleArt = consoleArt.map(line => ' '.repeat(leftPad) + line + ' '.repeat(rightPad));
    return [...boxedStarfield, ...consoleArt].join('\n');
}

function getShopAscii(width) {
    const title = ' SHIP SYSTEMS BAY ';
    const w = width;
    const top = '┌' + '─'.repeat(w) + '┐';
    const bottom = '└' + '─'.repeat(w) + '┘';
    function center(text) {
        const inner = w;
        if (text.length > inner) text = text.slice(0, inner);
        const pad = inner - text.length;
        const left = Math.floor(pad / 2);
        const right = pad - left;
        return '│' + ' '.repeat(left) + text + ' '.repeat(right) + '│';
    }
    const lines = [];
    lines.push(top);
    lines.push(center(title));
    const sep = '='.repeat(Math.max(8, Math.min(40, Math.floor(w * 0.5))));
    lines.push(center(sep));
    // Order: Manual Dump, Co-Pilot, Engine
    lines.push(center(`Manual Dump: +${currentClickGain()} Dark-Matter/click`));
    lines.push(center(`Co-Pilot: Lvl ${coPilotLevel} (+${CO_PILOT_BASE_GAIN * coPilotLevel} Dark-Matter/s)`));
    const effPanel = Math.max(1, efficiencyLevel|0);
    const outPerSec = capacityLevel * effPanel;
    const lyWord = outPerSec === 1 ? 'Lightyear' : 'Lightyears';
    lines.push(center(`Engine: ${capacityLevel} Dark-Matter/s -> ${outPerSec} ${lyWord}/s`));
    lines.push(center(sep));
    lines.push(bottom);
    return lines.join('\n');
}

function fireMilestone50() {
    if (lyGauge < 50) return; // milestone not reached yet
    const upgrades = document.getElementById('upgrades');
    // Show lore only once
    if (!milestone50Fired || !milestone50LoreShown) {
        addLoreMessage('The console begins humming and a gauge reads [50 Lightyears from Origin] - you notice a new lever that reads "Ship Co-Pilot"');
        milestone50LoreShown = true;
        milestone50Fired = true; // mark after lore
    }
    if (!upgrades) {
        // If upgrades container not yet in DOM, retry soon until mounted
        const retry = setInterval(() => {
            const up = document.getElementById('upgrades');
            if (up) {
                clearInterval(retry);
                if (!coPilotPurchased) {
                    let existing = document.getElementById('copilot-buy-btn');
                    if (!existing) createCoPilotPurchaseButton(up);
                }
                else if (coPilotPurchased && !coPilotSwitch) createCoPilotSwitch();
            }
        }, 200);
        return;
    }
    if (!coPilotPurchased) {
        let existing = document.getElementById('copilot-buy-btn');
        if (!existing) createCoPilotPurchaseButton(upgrades);
    }
    else if (coPilotPurchased && !coPilotSwitch) createCoPilotSwitch();
}

function createCoPilotPurchaseButton(upgrades) {
    const btn = document.createElement('button');
    btn.id = 'copilot-buy-btn';
    btn.textContent = 'Ship Co-Pilot: 100 Dark-Matter';
    btn.style.fontSize = '14px';
    btn.style.padding = '6px 14px';
    btn.style.background = '#444';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px #000a';
    btn.addEventListener('click', () => {
        if (fuel >= 100 && !coPilotPurchased) {
            fuel -= 100;
            document.getElementById('fuel-count').textContent = 'Dark-Matter: ' + fuel;
            coPilotPurchased = true;
            addLoreMessage('[SHIP COPILOT ONLINE]');
            btn.remove();
            createCoPilotSwitch();
        }
    });
    // Move to ly-toggle-wrapper area next to engine switch
    const toggleWrap = document.getElementById('ly-toggle-wrapper');
    if (toggleWrap) {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '16px';
        toggleWrap.appendChild(spacer);
        toggleWrap.appendChild(btn);
    } else {
        upgrades.appendChild(btn);
    }
    coPilotButtonAdded = true;
}

function createCoPilotSwitch() {
    const toggleWrap = document.getElementById('ly-toggle-wrapper');
    const upgrades = document.getElementById('upgrades');
    coPilotSwitch = document.createElement('button');
    coPilotSwitch.id = 'copilot-switch-btn';
    coPilotSwitch.textContent = 'Ship Co-Pilot: OFF';
    coPilotSwitch.style.fontSize = '14px';
    coPilotSwitch.style.padding = '6px 14px';
    coPilotSwitch.style.background = '#555';
    coPilotSwitch.style.color = '#fff';
    coPilotSwitch.style.border = 'none';
    coPilotSwitch.style.borderRadius = '6px';
    coPilotSwitch.style.boxShadow = '0 2px 8px #000a';
    coPilotSwitch.style.minWidth = '168px';
    coPilotSwitch.style.textAlign = 'center';
    coPilotSwitch.addEventListener('click', toggleCoPilotActive);
    if (toggleWrap) {
        const spacer = document.createElement('span');
        spacer.style.display = 'inline-block';
        spacer.style.width = '10px';
        toggleWrap.appendChild(spacer);
        toggleWrap.appendChild(coPilotSwitch);
    } else if (upgrades) {
        upgrades.appendChild(coPilotSwitch);
    }
        ensureSystemsButton();
}

function toggleCoPilotActive() {
    coPilotActive = !coPilotActive;
    if (coPilotSwitch) {
        coPilotSwitch.textContent = 'Ship Co-Pilot: ' + (coPilotActive ? 'ON' : 'OFF');
        coPilotSwitch.style.background = coPilotActive ? '#2c6' : '#555';
    }
    if (coPilotActive) {
        if (!coPilotOnlineLoreShown) {
            addLoreMessage('[COPILOT ONLINE - BEGINNING AUTOMATIC CENTRIFUGE DUMP]');
            coPilotOnlineLoreShown = true;
        }
        if (autoDMInterval) clearInterval(autoDMInterval);
        autoDMInterval = setInterval(() => {
            // Auto-generate Dark-Matter based on current Co-Pilot level
            fuel += CO_PILOT_BASE_GAIN * coPilotLevel;
            const fc = document.getElementById('fuel-count');
            if (fc) fc.textContent = 'Dark-Matter: ' + fuel;
        }, 1000);
    } else {
        if (autoDMInterval) { clearInterval(autoDMInterval); autoDMInterval = null; }
    }
}

function renderStarfield(skipIntroLore = false) {
    const fuelSection = document.getElementById('fuel-section');
    const bottomBubble = document.getElementById('bottom-bubble');
    // Hide DM->Ly toggle initially; it will appear after 5s with fuel UI
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (lyToggleWrapper) lyToggleWrapper.style.display = 'none';

    // Show the materials bubble (bottomBubble) immediately
    if (bottomBubble) {
        bottomBubble.style.display = 'block';
        bottomBubble.style.position = 'relative';
        bottomBubble.style.left = '';
        bottomBubble.style.right = '';
        bottomBubble.style.top = '';
        bottomBubble.style.transform = '';
        bottomBubble.style.margin = '32px auto 0 auto';
    }

    // Hide fuel section initially
    if (fuelSection) fuelSection.style.display = 'none';

        if (skipIntroLore) {
        // Loaded from save: show immediately (no delay, keep existing fuel amount)
            if (fuelSection) {
                fuelSection.style.display = 'flex';
                const fuelCount = document.getElementById('fuel-count');
                if (fuelCount) fuelCount.textContent = 'Dark-Matter: ' + fuel;
                updateFuelButtonLabel();
            }
        if (lyToggleWrapper) ensureLyToggle();
    } else {
        // Fresh start: delay reveal for atmospheric pacing
        setTimeout(() => {
                if (fuelSection) {
                    fuelSection.style.display = 'flex';
                    const fuelCount = document.getElementById('fuel-count');
                    if (fuelCount) fuelCount.textContent = 'Dark-Matter: ' + fuel;
                    updateFuelButtonLabel();
                }
                if (lyToggleWrapper) ensureLyToggle();
                if (!lookAroundLoreShown) {
                    addLoreMessage('You take a second to look around, it\'s an old model starship from the 2100\'s, a dusty Dark-Matter centrifuge lies in the back of the ship...');
                    lookAroundLoreShown = true;
                }
        }, 5000);
    }

    function drawScene() {
        const asciiEl = document.getElementById('ascii');
        if (asciiEl) asciiEl.textContent = getStarFieldArt();
        const fuelCountEl = document.getElementById('fuel-count');
        if (fuelCountEl) {
            fuelCountEl.textContent = 'Dark-Matter: ' + fuel;
            fuelCountEl.style.display = 'inline-block';
        }
        const fuelBtnEl = document.getElementById('fuel-btn');
        if (fuelBtnEl) fuelBtnEl.style.display = 'inline-block';
        // Removed references to old save/load buttons that no longer exist (save-btn, load-btn)
    // Toggle already positioned below ASCII art via HTML structure
    fireMilestone50();
    fireMilestone100();
    }
    if (lyInterval) clearInterval(lyInterval);
    lyInterval = setInterval(() => {
        const lySwitchEl = document.getElementById('ly-switch');
        if (lySwitchEl) lyConversionOn = lySwitchEl.checked;
        if (fuel > 0 && lyConversionOn) {
            const dmToConsume = Math.min(capacityLevel, fuel); // can't exceed available fuel
            const effMult = efficiencyLevel; // 1x base, 2x after Efficiency I, 4x after Efficiency II
            const lyProduced = dmToConsume * effMult;
            fuel -= dmToConsume;
            lyGauge += lyProduced;
            const fc = document.getElementById('fuel-count');
            if (fc) fc.textContent = 'Dark-Matter: ' + fuel;
            drawScene();
        }
        // Boundary detection: if we just crossed 50 this tick fire immediately
        if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
        if (lyGauge >= 100) fireMilestone100();
    }, 1000);
    if (!skipIntroLore && typeof LORE_MESSAGES !== 'undefined') {
        setTimeout(() => {
            addLoreMessage(LORE_MESSAGES[1]);
        }, 0);
    }
    if (window.starfieldInterval) {
        clearInterval(window.starfieldInterval);
        window.starfieldInterval = null;
    }
    window.starfieldInterval = setInterval(() => {
        starFrame++;
        if (currentScene === 'starfield') drawScene();
        if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
        if (lyGauge >= 100) fireMilestone100();
    }, 300);
    // Start/refresh bottom console blink effect
    try { if (window.consoleBlinkInterval) { clearInterval(window.consoleBlinkInterval); } } catch(e){}
    window.__consoleBlinkOn = false;
    window.__consoleBlinkIdx = 0;
    window.consoleBlinkInterval = setInterval(() => {
        if (Math.random() < 0.28) { // roughly every 3-4 seconds given interval
            window.__consoleBlinkIdx = Math.floor(Math.random() * 4);
            window.__consoleBlinkOn = true;
            setTimeout(() => { window.__consoleBlinkOn = false; }, 1000); // visible for ~1s
        }
    }, 1000);
    drawScene();
    // Immediate milestone evaluation for loaded saves
    if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
    if (lyGauge >= 100) fireMilestone100();
}

function fireMilestone100() {
    if (lyGauge < 100) return;
    if (!milestone100Fired) {
        milestone100Fired = true;
    }
    if (!milestone100LoreShown) {
    addLoreMessage('[100 Lightyears from Origin] A hum begins buzzing in your ear as the ships main lights begin turning on... you finally can see what lies at the edges of the ship, a new model star-collapser');
        milestone100LoreShown = true;
    }
}

function clearSaveData() {
    localStorage.removeItem('asciiSaveSlot');
}

document.addEventListener('DOMContentLoaded', () => {
    installGlobalErrorHandlers();
    const data = getSaveData();
    if (data) {
        loadGame();
    } else {
        renderIntro();
    }
    if (coPilotPurchased) ensureSystemsButton();
    if (starCollapserBayOnline) { ensureCollapserBayButton(); ensureCollapserBayNavButton(); }
    ensureStardustUI();
    document.getElementById('save-slot-btn').onclick = saveGame;
    document.getElementById('wipe-save-btn').onclick = () => {
        clearSaveData();
        try { localStorage.removeItem('asciiLogBook'); } catch(e){}
        location.reload();
    };
    const logBtn = document.getElementById('logbook-btn');
    if (logBtn) logBtn.onclick = showLogBook;
    document.getElementById('name-submit').onclick = handleNameSubmit;
    document.getElementById('name-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleNameSubmit();
    });
    const fuelBtnInit = document.getElementById('fuel-btn');
    updateFuelButtonLabel();
    document.getElementById('fuel-btn').onclick = () => {
        const gain = currentClickGain();
        fuel += gain;
        document.getElementById('fuel-count').textContent = 'Dark-Matter: ' + fuel;
        if (!fuelLoreShown) {
            addLoreMessage('Upon activation the centrifuge whirls to life with a cacophony of metallic clangs and Dark-Matter begins pouring into the crucible in liquid form.');
            fuelLoreShown = true;
        }
    };
    // Adjust button label if reloading into dev mode
    if (developerMode) {
        updateFuelButtonLabel();
    }
    document.getElementById('ly-switch').onchange = function() {
        lyConversionOn = this.checked;
    };
    // Apply saved state immediately if starfield already active when loading
    const lySwitchSaved = document.getElementById('ly-switch');
    if (lySwitchSaved) lySwitchSaved.checked = lyConversionOn;
});

// -------- Systems Button & Controls --------
function ensureSystemsButton() {
    if (!coPilotPurchased) return; // only after buying co-pilot
    if (!lyToggleWrapper) lyToggleWrapper = document.getElementById('ly-toggle-wrapper');
    if (!lyToggleWrapper) return;
    const systemsBtn = document.getElementById('systems-btn');
    if (systemsBtn) {
        systemsBtn.style.display = 'inline-block';
        systemsBtn.style.minWidth = '168px';
        systemsBtn.style.padding = '6px 14px';
        if (!systemsBtn.__wired) {
            systemsBtn.__wired = true;
            systemsBtn.addEventListener('click', () => {
                if (currentView === 'shop') {
                    // Return to main console
                    currentView = 'main';
                    const sc = document.getElementById('shop-controls');
                    if (sc) sc.remove();
                    const bc = document.getElementById('collapser-controls');
                    if (bc) bc.remove();
                    systemsBtn.textContent = 'Systems';
                    showConversionSwitch();
                    const asciiEl = document.getElementById('ascii');
                    if (asciiEl) asciiEl.textContent = getStarFieldArt();
                } else {
                    currentView = 'shop';
                    const bc = document.getElementById('collapser-controls');
                    if (bc) bc.remove();
                    renderShopControls();
                }
            });
        }
        // Initial label & switch visibility
        systemsBtn.textContent = currentView === 'shop' ? 'Main Console' : 'Systems';
        if (currentView === 'shop') hideConversionSwitch(); else showConversionSwitch();
    }
}

function renderShopControls() {
    const asciiEl = document.getElementById('ascii');
    if (asciiEl) asciiEl.textContent = getStarFieldArt(); // refresh ascii to shop view
    const systemsBtn = document.getElementById('systems-btn');
    if (systemsBtn) systemsBtn.textContent = 'Main Console';
    hideConversionSwitch();
    try { window.scrollTo(0,0); } catch(e){}
    ensureStardustUI();
    clearSubviewControls();
    let shopControls = document.getElementById('shop-controls');
    if (!shopControls) {
        shopControls = document.createElement('div');
        shopControls.id = 'shop-controls';
        shopControls.style.display = 'flex';
        shopControls.style.flexDirection = 'row';
        shopControls.style.flexWrap = 'nowrap';
    shopControls.style.gap = '16px';
    shopControls.style.marginTop = '-54px';
    shopControls.style.alignItems = 'flex-start';
        const container = document.getElementById('game-container');
        if (container) container.appendChild(shopControls);
    }
    shopControls.innerHTML = '';
    shopControls.style.marginTop = '-54px';
    // Create three side-by-side columns: Main, Efficiency, Experimental
    const upgradesCol = document.createElement('div');
    upgradesCol.style.display = 'flex';
    upgradesCol.style.flexDirection = 'column';
    upgradesCol.style.alignItems = 'flex-start';
    upgradesCol.style.gap = '8px';
    upgradesCol.style.marginTop = '-32px';
    shopControls.appendChild(upgradesCol);

    const efficiencyCol = document.createElement('div');
    efficiencyCol.style.display = 'flex';
    efficiencyCol.style.flexDirection = 'column';
    efficiencyCol.style.alignItems = 'flex-start';
    efficiencyCol.style.gap = '8px';
    efficiencyCol.style.marginTop = '-32px';
    shopControls.appendChild(efficiencyCol);

    const otherCol = document.createElement('div');
    otherCol.style.display = 'flex';
    otherCol.style.flexDirection = 'column';
    otherCol.style.alignItems = 'flex-start';
    otherCol.style.gap = '8px';
    otherCol.style.marginTop = '-32px';
    shopControls.appendChild(otherCol);
    // Section: Main Upgrades
    const mainHeader = document.createElement('div');
    mainHeader.textContent = 'Main Upgrades';
    mainHeader.style.fontSize = '13px';
    mainHeader.style.color = '#aaa';
    mainHeader.style.margin = '0 0 2px 2px';
    upgradesCol.appendChild(mainHeader);
    // Dump Yield Upgrade (click bonus) — first
    const dumpBtn = document.createElement('button');
    dumpBtn.textContent = `Upgrade Dump Yield (Lvl ${dumpUpgradeLevel}): Cost ${getDumpUpgradeCost()} Dark-Matter`;
    styleShopBtn(dumpBtn);
    dumpBtn.onclick = () => {
        const cost = getDumpUpgradeCost();
        if (fuel >= cost) {
            fuel -= cost;
            dumpUpgradeLevel++;
            dumpUpgradeCost = Math.ceil(dumpUpgradeCost * 1.2);
            addLoreMessage('[MANUAL DUMP YIELD INCREASED: +1 PER CLICK]');
            updateFuelButtonLabel();
            renderShopControls();
        } else {
            addLoreMessage('[INSUFFICIENT Dark-Matter FOR DUMP YIELD UPGRADE]');
        }
    };
    upgradesCol.appendChild(dumpBtn);
    // Co-Pilot Upgrade — second
    const cpBtn = document.createElement('button');
    cpBtn.textContent = `Upgrade Co-Pilot (Lvl ${coPilotLevel}): Cost ${getCoPilotUpgradeCost()} Dark-Matter`;
    styleShopBtn(cpBtn);
    cpBtn.onclick = () => {
        const cost = getCoPilotUpgradeCost();
        if (fuel >= cost) {
            fuel -= cost;
            coPilotLevel++;
            coPilotUpgradeCost = Math.ceil(coPilotUpgradeCost * 1.2);
            if (coPilotActive) { // restart interval to apply new rate
                toggleCoPilotActive();
                toggleCoPilotActive();
            }
            addLoreMessage(`[CO-PILOT UPGRADED TO LEVEL ${coPilotLevel}]`);
            renderShopControls();
        } else {
            addLoreMessage('[INSUFFICIENT Dark-Matter FOR CO-PILOT UPGRADE]');
        }
    };
    upgradesCol.appendChild(cpBtn);
    // Engine (formerly Capacity) Upgrade — third
    const capBtn = document.createElement('button');
    capBtn.textContent = `Upgrade Engine (Lvl ${capacityLevel}): Cost ${getCapacityUpgradeCost()} Dark-Matter`;
    styleShopBtn(capBtn);
    capBtn.onclick = () => {
        const cost = getCapacityUpgradeCost();
        if (fuel >= cost) {
            fuel -= cost;
            capacityLevel++;
            capacityUpgradeCost = Math.ceil(capacityUpgradeCost * 1.2);
            addLoreMessage(`[ENGINE UPGRADED: Intake ${capacityLevel} Dark-Matter/s]`);
            renderShopControls();
        } else {
            addLoreMessage('[INSUFFICIENT Dark-Matter FOR ENGINE UPGRADE]');
        }
    };
    upgradesCol.appendChild(capBtn);
    // Section: Efficiency (one-time)
    const effSectionHeader = document.createElement('div');
    effSectionHeader.textContent = 'Efficiency';
    effSectionHeader.style.fontSize = '13px';
    effSectionHeader.style.color = '#aaa';
    effSectionHeader.style.margin = '0 0 2px 2px';
    efficiencyCol.appendChild(effSectionHeader);
    if (efficiencyLevel === 1) {
        const effBtn = document.createElement('button');
    effBtn.textContent = `Upgrade Efficiency: Cost ${getEfficiencyUpgradeCost()} Dark-Matter`;
        styleShopBtn(effBtn);
        effBtn.onclick = () => {
            const cost = getEfficiencyUpgradeCost();
            if (fuel >= cost) {
                fuel -= cost;
                efficiencyLevel = 2; // Efficiency I
                addLoreMessage('[ENGINE EFFICIENCY UPGRADED: Lightyears output doubled]');
                renderShopControls();
            } else {
                addLoreMessage('[INSUFFICIENT Dark-Matter FOR EFFICIENCY UPGRADE]');
            }
        };
    efficiencyCol.appendChild(effBtn);
    } else if (efficiencyLevel === 2 && capacityLevel >= 5) {
        // Unlock Efficiency II when Engine reaches Level 5
        const eff2Btn = document.createElement('button');
        eff2Btn.textContent = 'Upgrade Efficiency II: Cost 1000 Dark-Matter';
        styleShopBtn(eff2Btn);
        eff2Btn.onclick = () => {
            const cost = 1000;
            if (fuel >= cost) {
                fuel -= cost;
                efficiencyLevel = 4; // Efficiency II doubles again (2x -> 4x)
                addLoreMessage('[ENGINE EFFICIENCY UPGRADED: Lightyears output doubled again]');
                renderShopControls();
            } else {
                addLoreMessage('[INSUFFICIENT Dark-Matter FOR EFFICIENCY II]');
            }
        };
        efficiencyCol.appendChild(eff2Btn);
    }

    // Section: Experimental Systems
    const expHeader = document.createElement('div');
    expHeader.textContent = 'Experimental Systems';
    expHeader.style.fontSize = '13px';
    expHeader.style.color = '#aaa';
    expHeader.style.margin = '0 0 2px 2px';
    otherCol.appendChild(expHeader);
    // Star Collapser purchase (appears at 100 Lightyears if not yet owned)
    if (lyGauge >= 100 && !starCollapserOnline) {
        const scBtn = document.createElement('button');
    scBtn.textContent = `Star-Collapser: Cost 300 Dark-Matter`;
        styleShopBtn(scBtn);
        scBtn.onclick = () => {
            if (fuel >= 300) {
                fuel -= 300;
                starCollapserOnline = true;
                addLoreMessage('[STAR COLLAPSER ONLINE]');
                const sd = document.getElementById('stardust-section');
                if (sd) sd.style.display = 'flex';
                ensureStardustUI();
                renderShopControls();
            } else {
                addLoreMessage('[INSUFFICIENT Dark-Matter FOR STAR-COLLAPSER]');
            }
        };
        otherCol.appendChild(scBtn);
    }
}

function styleShopBtn(btn) {
    btn.style.padding = '6px 14px';
    btn.style.background = '#555';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px #000a';
    btn.style.fontSize = '14px';
    btn.style.cursor = 'pointer';
}

// --- Stardust / Collapser UI wiring ---
function ensureStardustUI() {
    const sd = document.getElementById('stardust-section');
    if (!sd) return;
    sd.style.display = starCollapserOnline ? 'flex' : 'none';
    const sdCount = document.getElementById('stardust-count');
    if (sdCount) sdCount.textContent = `Stardust: ${stardust}`;
    const collapseBtn = document.getElementById('collapse-btn');
    if (collapseBtn && !collapseBtn.__wired) {
        collapseBtn.__wired = true;
        collapseBtn.addEventListener('click', () => {
            const now = Date.now();
            if (!starCollapserOnline) return;
            if (now < collapseCooldownUntil) return; // still cooling down
            // award stardust and start cooldown
            const yieldAmt = collapserYieldBase * collapserEfficiencyLevel; // base times efficiency
            stardust += yieldAmt;
            const baseMs = 10000; // 10s base
            const reduceMs = Math.min(10, Math.max(0, collapserCooldownUpgrades)) * 1000;
            collapseCooldownUntil = now + Math.max(1000, baseMs - reduceMs);
            if (sdCount) sdCount.textContent = `Stardust: ${stardust}`;
            updateCollapseCooldownUI();
        });
    }
    updateCollapseCooldownUI();
    // Show Collapser Bay access/purchase when applicable
    ensureCollapserBayButton();
    if (starCollapserBayOnline) ensureCollapserBayNavButton();
}

function updateCollapseCooldownUI() {
    const collapseBtn = document.getElementById('collapse-btn');
    if (!collapseBtn) return;
    const now = Date.now();
    if (now >= collapseCooldownUntil) {
        collapseBtn.disabled = false;
        const yieldAmt = collapserYieldBase * collapserEfficiencyLevel;
        collapseBtn.textContent = `Collapse (+${yieldAmt})`;
        return;
    }
    collapseBtn.disabled = true;
    const secs = Math.ceil((collapseCooldownUntil - now) / 1000);
    collapseBtn.textContent = `Collapse (${secs}s)`;
    setTimeout(updateCollapseCooldownUI, 250);
}

// Helpers: ensure only one subview's controls are present
function clearSubviewControls() {
    const sc = document.getElementById('shop-controls');
    if (sc) sc.remove();
    const bc = document.getElementById('collapser-controls');
    if (bc) bc.remove();
}

// --- Conversion switch visibility helpers ---
function hideConversionSwitch() {
    const label = document.querySelector('#ly-toggle-wrapper label');
    if (label) label.style.display = 'none';
}
function showConversionSwitch() {
    const label = document.querySelector('#ly-toggle-wrapper label');
    if (label) label.style.display = 'inline-flex';
}

// --------- Global Error Handling & Recovery ---------
function installGlobalErrorHandlers() {
    if (window.__asciiErrorHandlersInstalled) return;
    window.__asciiErrorHandlersInstalled = true;
    window.addEventListener('error', ev => {
        showErrorOverlay(ev.error ? (ev.error.stack || ev.error.message) : ev.message);
    });
    window.addEventListener('unhandledrejection', ev => {
        showErrorOverlay(ev.reason ? (ev.reason.stack || ev.reason.message) : 'Unhandled rejection');
    });
}

function showErrorOverlay(message) {
    if (document.getElementById('ascii-error-overlay')) return;
    const wrap = document.createElement('div');
    wrap.id = 'ascii-error-overlay';
    wrap.style.position = 'fixed';
    wrap.style.top = '0';
    wrap.style.left = '0';
    wrap.style.width = '100vw';
    wrap.style.height = '100vh';
    wrap.style.background = 'rgba(0,0,0,0.85)';
    wrap.style.zIndex = '99999';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    wrap.style.fontFamily = 'monospace';
    wrap.innerHTML = `
        <div style="max-width:720px;padding:24px 32px;background:#222;border-radius:12px;box-shadow:0 0 18px #000a;color:#eee;display:flex;flex-direction:column;gap:18px;">
            <div style="font-size:22px;font-weight:bold;color:#f66;">Runtime Error</div>
            <pre style="white-space:pre-wrap;font-size:14px;line-height:1.4;max-height:40vh;overflow:auto;margin:0;">${escapeHtml(message||'Unknown error')}</pre>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <button id="force-wipe-btn" style="padding:8px 18px;font-size:14px;border:none;border-radius:6px;background:#c33;color:#fff;cursor:pointer;">Force Wipe Save & Reload</button>
                <button id="close-error-overlay" style="padding:8px 18px;font-size:14px;border:none;border-radius:6px;background:#555;color:#fff;cursor:pointer;">Dismiss</button>
            </div>
        </div>`;
    document.body.appendChild(wrap);
    document.getElementById('close-error-overlay').onclick = () => wrap.remove();
    document.getElementById('force-wipe-btn').onclick = () => {
        try { localStorage.removeItem('asciiSaveSlot'); localStorage.removeItem('asciiLoreText'); } catch(e){}
        location.reload();
    };
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

// --- Collapser Bay Access and Panel ---
function ensureCollapserBayButton() {
    const sd = document.getElementById('stardust-section');
    if (!sd) return;
    let bayBtn = document.getElementById('collapser-bay-btn');
    if (!bayBtn) {
        bayBtn = document.createElement('button');
        bayBtn.id = 'collapser-bay-btn';
        bayBtn.textContent = 'Collapser Bay';
        styleShopBtn(bayBtn);
        bayBtn.style.padding = '4px 10px';
        sd.appendChild(bayBtn);
    }
    // Show purchase state when locked; hide the button once unlocked (nav lives next to Systems)
    if (!starCollapserBayOnline) {
        bayBtn.style.display = 'inline-block';
        bayBtn.textContent = stardust >= 10 ? 'Buy Collapser Bay (10 Stardust)' : 'Collapser Bay (Locked)';
        bayBtn.disabled = stardust < 10;
        bayBtn.onclick = () => {
            if (stardust >= 10 && !starCollapserBayOnline) {
                stardust -= 10;
                starCollapserBayOnline = true;
                addLoreMessage('[COLLAPSER BAY CONSTRUCTED — ACCESS PANEL ONLINE]');
                ensureStardustUI();
                ensureCollapserBayNavButton();
                currentView = 'collapser';
                clearSubviewControls();
                renderCollapserBayControls();
            }
        };
    } else {
        bayBtn.style.display = 'none';
    }
}

function renderCollapserBayControls() {
    // Render inside main bubble like Systems view; clear Systems controls if present
    const scLeftover = document.getElementById('shop-controls');
    if (scLeftover) scLeftover.remove();
    const asciiEl = document.getElementById('ascii');
    if (asciiEl) asciiEl.textContent = getCollapserBayAscii(100);
    hideConversionSwitch();
    try { window.scrollTo(0,0); } catch(e){}
    let bayControls = document.getElementById('collapser-controls');
    if (!bayControls) {
        bayControls = document.createElement('div');
        bayControls.id = 'collapser-controls';
        bayControls.style.display = 'flex';
        bayControls.style.flexDirection = 'row';
        bayControls.style.flexWrap = 'nowrap';
        bayControls.style.gap = '16px';
        bayControls.style.marginTop = '-54px';
        bayControls.style.alignItems = 'flex-start';
        const container = document.getElementById('game-container');
        if (container) container.appendChild(bayControls);
    }
    bayControls.innerHTML = '';
    // Two columns: Main Upgrades and One-time Upgrades
    const mainCol = document.createElement('div');
    mainCol.style.display = 'flex';
    mainCol.style.flexDirection = 'column';
    mainCol.style.alignItems = 'flex-start';
    mainCol.style.gap = '8px';
    mainCol.style.marginTop = '-32px';
    bayControls.appendChild(mainCol);

    const oneOffCol = document.createElement('div');
    oneOffCol.style.display = 'flex';
    oneOffCol.style.flexDirection = 'column';
    oneOffCol.style.alignItems = 'flex-start';
    oneOffCol.style.gap = '8px';
    oneOffCol.style.marginTop = '-32px';
    bayControls.appendChild(oneOffCol);

    const mainHeader = document.createElement('div');
    mainHeader.textContent = 'Main Upgrades';
    mainHeader.style.fontSize = '13px'; mainHeader.style.color = '#aaa'; mainHeader.style.margin = '0 0 2px 2px';
    mainCol.appendChild(mainHeader);

    // Main: +1 Stardust per click (base 1 -> 2)
    const yieldBtn = document.createElement('button');
    yieldBtn.textContent = `Increase Yield: Current ${collapserYieldBase} → ${collapserYieldBase+1}`;
    styleShopBtn(yieldBtn);
    yieldBtn.onclick = () => {
        const cost = 10; // simple cost per rank
        if (stardust >= cost) {
            stardust -= cost;
            collapserYieldBase += 1;
            ensureStardustUI();
            renderCollapserBayControls();
        }
    };
    mainCol.appendChild(yieldBtn);

    // Main: -1s cooldown per upgrade (max 10)
    const cdBtn = document.createElement('button');
    cdBtn.textContent = `Reduce Cooldown (-1s) [${collapserCooldownUpgrades}/10]`;
    styleShopBtn(cdBtn);
    cdBtn.onclick = () => {
        const cost = 10;
        if (stardust >= cost && collapserCooldownUpgrades < 10) {
            stardust -= cost;
            collapserCooldownUpgrades += 1;
            ensureStardustUI();
            renderCollapserBayControls();
        }
    };
    mainCol.appendChild(cdBtn);

    const oneHeader = document.createElement('div');
    oneHeader.textContent = 'One-time Upgrades';
    oneHeader.style.fontSize = '13px'; oneHeader.style.color = '#aaa'; oneHeader.style.margin = '0 0 2px 2px';
    oneOffCol.appendChild(oneHeader);

    // One-time: Efficiency x2 (multiplicative)
    if (collapserEfficiencyLevel === 1) {
        const effBtn = document.createElement('button');
        effBtn.textContent = 'Efficiency: x2 Output (Cost 20 Stardust)';
        styleShopBtn(effBtn);
        effBtn.onclick = () => {
            const cost = 20;
            if (stardust >= cost) {
                stardust -= cost;
                collapserEfficiencyLevel = 2;
                ensureStardustUI();
                renderCollapserBayControls();
            }
        };
        oneOffCol.appendChild(effBtn);
    } else {
        const done = document.createElement('div');
        done.textContent = 'Efficiency x2: Purchased';
        done.style.color = '#8f8';
        done.style.fontSize = '13px';
        oneOffCol.appendChild(done);
    }
}

function getCollapserBayAscii(width) {
    const title = ' STAR-COLLAPSER BAY ';
    const w = width;
    const top = '┌' + '─'.repeat(w) + '┐';
    const bottom = '└' + '─'.repeat(w) + '┘';
    function center(text) {
        const inner = w;
        if (text.length > inner) text = text.slice(0, inner);
        const pad = inner - text.length;
        const left = Math.floor(pad / 2);
        const right = pad - left;
        return '│' + ' '.repeat(left) + text + ' '.repeat(right) + '│';
    }
    const lines = [];
    lines.push(top);
    lines.push(center(title));
    const sep = '='.repeat(Math.max(8, Math.min(40, Math.floor(w * 0.5))));
    lines.push(center(sep));
    lines.push(center(`Yield: ${collapserYieldBase} × Efficiency ${collapserEfficiencyLevel} => ${collapserYieldBase * collapserEfficiencyLevel} Stardust/click`));
    const cdSecs = Math.max(1, 10 - Math.min(10, collapserCooldownUpgrades));
    lines.push(center(`Cooldown: ${cdSecs}s`));
    lines.push(center(sep));
    lines.push(bottom);
    return lines.join('\n');
}

// (No dedicated collapser bubble; view is toggled within main bubble.)

function ensureCollapserBayNavButton() {
    const navBtn = document.getElementById('collapserbay-btn');
    if (!navBtn) return;
    navBtn.style.display = 'inline-block';
    navBtn.style.minWidth = '168px';
    navBtn.style.padding = '6px 14px';
    if (!navBtn.__wired) {
        navBtn.__wired = true;
        navBtn.addEventListener('click', () => {
            if (!starCollapserBayOnline) return;
            if (currentView === 'collapser') {
                currentView = 'main';
                const bc = document.getElementById('collapser-controls'); if (bc) bc.remove();
                const sc = document.getElementById('shop-controls'); if (sc) sc.remove();
                navBtn.textContent = 'Collapser Bay';
                showConversionSwitch();
                const asciiEl = document.getElementById('ascii');
                if (asciiEl) asciiEl.textContent = getStarFieldArt();
            } else {
                currentView = 'collapser';
                renderCollapserBayControls();
            }
        });
    }
    navBtn.textContent = currentView === 'collapser' ? 'Main Console' : 'Collapser Bay';
}