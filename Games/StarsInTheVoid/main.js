// Stars In The Void - Rebuilt
// Requires lore.js

// ── State ──
let playerName = '';
let fuel = 0;
let lyGauge = 0;
let currentScene = 'void'; // void | terminal | starfield
let currentView = 'main'; // main | shop | collapser
let lyConversionOn = true;
let developerMode = false;
let fuelLoreShown = false;
let lookAroundLoreShown = false;
let milestone50Fired = false;
let milestone50LoreShown = false;
let milestone100Fired = false;
let milestone100LoreShown = false;
let coPilotPurchased = false;
let coPilotActive = false;
let coPilotOnlineLoreShown = false;
let starCollapserOnline = false;
let starCollapserBayOnline = false;
let stardust = 0;
let collapseCooldownUntil = 0;

// Upgrade levels
let dumpUpgradeLevel = 1;
let dumpUpgradeCost = 100;
let coPilotLevel = 1;
let coPilotUpgradeCost = 150;
let capacityLevel = 1;
let capacityUpgradeCost = 200;
let efficiencyLevel = 1;
let efficiencyUpgradeCost = 500;
let collapserYieldBase = 1;
let collapserCooldownUpgrades = 0;
let collapserEfficiencyLevel = 1;

const CO_PILOT_BASE_GAIN = 2;

// Intervals
let lyInterval = null;
let starfieldInterval = null;
let consoleBlinkInterval = null;
let autoDMInterval = null;
let starFrame = 0;

// ── ASCII Art ──
const terminalArt = (blinkOn) => [
    '   _____________________________',
    '  |  Series 800 Starcraft      |',
    '  |---------------------------|',
    '  |  [o]   [o]   [o]   [o]    |',
    '  |                           |',
    blinkOn
        ? '  |         [*]               |'
        : '  |         [ ]               |',
    '  |      Enter Name           |',
    '  |___________________________|'
].join('\n');

function consoleArt(name, ly) {
    const inds = ['[o]','[o]','[o]','[o]'];
    if (window._blinkOn) {
        inds[(window._blinkIdx || 0) % 4] = '[*]';
    }
    return [
        '   _____________________________',
        '  |  Series 800 Starcraft      |',
        '  |---------------------------|',
        `  |  ${inds[0]}   ${inds[1]}   ${inds[2]}   ${inds[3]}    |`,
        '  |                           |',
        `  |   Pilot: ${name.padEnd(18)}|`,
        `  |   Lightyears: ${ly.toString().padEnd(12)}|`,
        '  |___________________________|'
    ].join('\n');
}

function generateStarfield(w = 90, h = 14) {
    const f = starFrame;
    const lines = [];
    for (let y = 0; y < h; y++) {
        const row = new Array(w).fill(' ');
        // distant
        for (let x = 0; x < w; x++) {
            if (((x + y * 2 + f) % 11) === 0) row[x] = '.';
        }
        // mid
        for (let x = 0; x < w; x++) {
            if (((x + y * 3 + f * 2) % 17) === 0) row[x] = '*';
        }
        // close streaks
        for (let x = 0; x < w; x++) {
            if (((x + y * 5 + f * 3) % 23) === 0) {
                row[x] = '-';
                if (x + 1 < w) row[x + 1] = '-';
            }
        }
        lines.push(row.join(''));
    }
    return lines;
}

function getViewportArt() {
    const w = 90;
    if (currentView === 'shop') return getShopAscii(w);
    if (currentView === 'collapser') return getCollapserBayAscii(w);

    const starLines = generateStarfield(w);
    const top = '┌' + '─'.repeat(w) + '┐';
    const bot = '└' + '─'.repeat(w) + '┘';
    const boxed = [top];
    for (const line of starLines) {
        boxed.push('│' + line + '│');
    }
    boxed.push(bot);
    return boxed.join('\n');
}

function getShopAscii(w) {
    const top = '┌' + '─'.repeat(w) + '┐';
    const bot = '└' + '─'.repeat(w) + '┘';
    const center = (t) => {
        if (t.length > w) t = t.slice(0, w);
        const pad = w - t.length;
        return '│' + ' '.repeat(Math.floor(pad/2)) + t + ' '.repeat(pad - Math.floor(pad/2)) + '│';
    };
    const sep = '='.repeat(Math.min(40, Math.floor(w * 0.5)));
    const effMult = Math.max(1, efficiencyLevel);
    const outPerSec = capacityLevel * effMult;
    const lyWord = outPerSec === 1 ? 'Lightyear' : 'Lightyears';
    return [
        top,
        center(' SHIP SYSTEMS BAY '),
        center(sep),
        center(`Manual Dump: +${currentClickGain()} Dark-Matter/click`),
        center(`Co-Pilot: Lvl ${coPilotLevel} (+${CO_PILOT_BASE_GAIN * coPilotLevel} Dark-Matter/s)`),
        center(`Engine: ${capacityLevel} Dark-Matter/s -> ${outPerSec} ${lyWord}/s`),
        center(sep),
        bot
    ].join('\n');
}

function getCollapserBayAscii(w) {
    const top = '┌' + '─'.repeat(w) + '┐';
    const bot = '└' + '─'.repeat(w) + '┘';
    const center = (t) => {
        if (t.length > w) t = t.slice(0, w);
        const pad = w - t.length;
        return '│' + ' '.repeat(Math.floor(pad/2)) + t + ' '.repeat(pad - Math.floor(pad/2)) + '│';
    };
    const sep = '='.repeat(Math.min(40, Math.floor(w * 0.5)));
    const cdSecs = Math.max(1, 10 - Math.min(10, collapserCooldownUpgrades));
    return [
        top,
        center(' STAR-COLLAPSER BAY '),
        center(sep),
        center(`Yield: ${collapserYieldBase} × Efficiency ${collapserEfficiencyLevel} => ${collapserYieldBase * collapserEfficiencyLevel} Stardust/click`),
        center(`Cooldown: ${cdSecs}s`),
        center(sep),
        bot
    ].join('\n');
}

// ── Helpers ──
function currentClickGain() {
    const base = developerMode ? 100 : 2;
    return base + (dumpUpgradeLevel - 1);
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// ── DOM helpers ──
const $ = (id) => document.getElementById(id);

function show(id) { $(id)?.classList.remove('hidden'); }
function hide(id) { $(id)?.classList.add('hidden'); }

// ── Lore ──
function addLoreMessage(msg) {
    const container = $('lore-text');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'lore-entry';
    div.textContent = msg;
    container.insertBefore(div, container.firstChild);
    appendToShipLog(msg);
    // Cap to 6
    while (container.children.length > 6) {
        container.lastElementChild?.remove();
    }
    requestAnimationFrame(() => {
        requestAnimationFrame(() => div.classList.add('visible'));
    });
}

function appendToShipLog(msg) {
    try {
        const raw = localStorage.getItem('sivLogBook');
        const log = raw ? JSON.parse(raw) : [];
        if (log.length === 0 || log[log.length - 1].m !== msg) {
            log.push({ t: Date.now(), m: msg });
        }
        localStorage.setItem('sivLogBook', JSON.stringify(log));
    } catch(e) {}
}

// ── Save / Load ──
function saveGame() {
    const data = {
        playerName, fuel, lyGauge, currentScene, currentView, lyConversionOn,
        developerMode, fuelLoreShown, lookAroundLoreShown,
        milestone50Fired, milestone50LoreShown, milestone100Fired, milestone100LoreShown,
        coPilotPurchased, coPilotActive, coPilotOnlineLoreShown,
        starCollapserOnline, starCollapserBayOnline, stardust, collapseCooldownUntil,
        dumpUpgradeLevel, dumpUpgradeCost,
        coPilotLevel, coPilotUpgradeCost,
        capacityLevel, capacityUpgradeCost,
        efficiencyLevel, efficiencyUpgradeCost,
        collapserYieldBase, collapserCooldownUpgrades, collapserEfficiencyLevel
    };
    localStorage.setItem('sivSave', JSON.stringify(data));
    // Save lore HTML
    const lore = $('lore-text');
    if (lore) localStorage.setItem('sivLore', lore.innerHTML);
    const msg = $('save-msg');
    if (msg) {
        msg.style.display = 'block';
        setTimeout(() => msg.style.display = 'none', 1200);
    }
}

function loadSave() {
    const raw = localStorage.getItem('sivSave');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch(e) {
        localStorage.removeItem('sivSave');
        return null;
    }
}

function wipeSave() {
    localStorage.removeItem('sivSave');
    localStorage.removeItem('sivLore');
    localStorage.removeItem('sivLogBook');
    location.reload();
}

function restoreState(d) {
    playerName = d.playerName || '';
    fuel = d.fuel || 0;
    lyGauge = d.lyGauge || 0;
    currentScene = d.currentScene || 'void';
    currentView = d.currentView || 'main';
    lyConversionOn = d.lyConversionOn !== false;
    developerMode = !!d.developerMode;
    fuelLoreShown = !!d.fuelLoreShown;
    lookAroundLoreShown = !!d.lookAroundLoreShown;
    milestone50Fired = !!d.milestone50Fired || lyGauge >= 50;
    milestone50LoreShown = !!d.milestone50LoreShown;
    milestone100Fired = !!d.milestone100Fired || lyGauge >= 100;
    milestone100LoreShown = !!d.milestone100LoreShown;
    coPilotPurchased = !!d.coPilotPurchased;
    coPilotActive = !!d.coPilotActive;
    coPilotOnlineLoreShown = !!d.coPilotOnlineLoreShown;
    starCollapserOnline = !!d.starCollapserOnline;
    starCollapserBayOnline = !!d.starCollapserBayOnline;
    stardust = d.stardust || 0;
    collapseCooldownUntil = d.collapseCooldownUntil || 0;
    dumpUpgradeLevel = d.dumpUpgradeLevel || 1;
    dumpUpgradeCost = d.dumpUpgradeCost || 100;
    coPilotLevel = d.coPilotLevel || 1;
    coPilotUpgradeCost = d.coPilotUpgradeCost || 150;
    capacityLevel = d.capacityLevel || 1;
    capacityUpgradeCost = d.capacityUpgradeCost || 200;
    efficiencyLevel = d.efficiencyLevel || 1;
    efficiencyUpgradeCost = d.efficiencyUpgradeCost || 500;
    collapserYieldBase = d.collapserYieldBase || 1;
    collapserCooldownUpgrades = d.collapserCooldownUpgrades || 0;
    collapserEfficiencyLevel = d.collapserEfficiencyLevel || 1;
}

// ── Logbook ──
function showLogbook() {
    if ($('logbook-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'logbook-overlay';
    const inner = document.createElement('div');
    inner.className = 'logbook-inner';
    const title = document.createElement('div');
    title.className = 'logbook-title';
    title.textContent = 'Ship Logbook';
    inner.appendChild(title);
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => overlay.remove();
    inner.appendChild(closeBtn);
    try {
        const raw = localStorage.getItem('sivLogBook');
        let log = raw ? JSON.parse(raw) : [];
        log = log.slice().reverse();
        let last = null;
        for (const entry of log) {
            if (last && last.m === entry.m) continue;
            const row = document.createElement('div');
            row.className = 'logbook-entry';
            row.textContent = new Date(entry.t).toLocaleString() + ' — ' + entry.m;
            inner.appendChild(row);
            last = entry;
        }
    } catch(e) {}
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
}

// ── Intro sequence ──
function startIntroSequence() {
    currentScene = 'void';
    // Pure black for 2 seconds, then terminal fades in
    setTimeout(() => {
        show('terminal');
        $('terminal-art').textContent = terminalArt(true);
        $('terminal').classList.add('visible');
        // Start blink on terminal
        let blinkOn = true;
        const termBlink = setInterval(() => {
            blinkOn = !blinkOn;
            $('terminal-art').textContent = terminalArt(blinkOn);
        }, 500);
        window._termBlink = termBlink;
        $('name-input').focus();
    }, 2000);
}

// ── Name submit ──
function handleNameSubmit() {
    const name = $('name-input').value.trim();
    if (!name) return;
    playerName = name;
    if (name.toLowerCase() === 'ajmemes') {
        developerMode = true;
    }
    // Clear terminal blink
    if (window._termBlink) clearInterval(window._termBlink);
    // Fade out terminal
    $('terminal').classList.remove('visible');
    setTimeout(() => {
        hide('terminal');
        $('void').classList.add('fade-out');
        enterStarfield(false);
    }, 800);
}

// ── Enter starfield (main game) ──
function enterStarfield(fromSave) {
    currentScene = 'starfield';
    show('top-bar');
    show('game');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => $('game').classList.add('visible'));
    });

    // Start starfield animation
    drawScene();
    if (starfieldInterval) clearInterval(starfieldInterval);
    starfieldInterval = setInterval(() => {
        starFrame++;
        drawScene();
    }, 300);

    // Console blink
    window._blinkOn = false;
    window._blinkIdx = 0;
    if (consoleBlinkInterval) clearInterval(consoleBlinkInterval);
    consoleBlinkInterval = setInterval(() => {
        if (Math.random() < 0.28) {
            window._blinkIdx = Math.floor(Math.random() * 4);
            window._blinkOn = true;
            setTimeout(() => { window._blinkOn = false; }, 1000);
        }
    }, 1000);

    // Engine conversion loop
    if (lyInterval) clearInterval(lyInterval);
    lyInterval = setInterval(() => {
        const sw = $('engine-switch');
        if (sw) lyConversionOn = sw.checked;
        if (fuel > 0 && lyConversionOn) {
            const dm = Math.min(capacityLevel, fuel);
            const ly = dm * efficiencyLevel;
            fuel -= dm;
            lyGauge += ly;
            updateFuelDisplay();
            drawScene();
        }
        checkMilestones();
    }, 1000);

    // Engine switch state
    const sw = $('engine-switch');
    if (sw) sw.checked = lyConversionOn;
    updateEngineLabel();

    if (fromSave) {
        // Immediate: show everything
        $('void').classList.add('fade-out');
        show('controls');
        show('materials');
        updateFuelDisplay();
        updateFuelBtnLabel();
        restoreLoreText();
        if (milestone100Fired) document.body.classList.add('lights-on');
        if (coPilotPurchased) setupCoPilotSwitch();
        if (coPilotPurchased) show('systems-btn');
        if (starCollapserBayOnline) show('collapserbay-nav-btn');
        updateStardustUI();
        if (coPilotActive) startAutoDM();
        // Restore subview
        if (currentView === 'shop') {
            $('systems-btn').textContent = 'Main Console';
            renderShopControls();
        } else if (currentView === 'collapser' && starCollapserBayOnline) {
            $('collapserbay-nav-btn').textContent = 'Main Console';
            renderCollapserBayControls();
        }
    } else {
        // Fresh start: cinematic reveal
        // Lore message #0 immediately
        addLoreMessage(LORE_MESSAGES[0]);
        if (developerMode) {
            addLoreMessage('[DEV MODE ENABLED: +100 FUEL PER CLICK]');
        }

        // After 4s: look around lore + fuel button appears
        setTimeout(() => {
            if (!lookAroundLoreShown) {
                addLoreMessage(LORE_MESSAGES[1]);
                lookAroundLoreShown = true;
            }
            show('materials');
            show('controls');
            updateFuelDisplay();
            updateFuelBtnLabel();
        }, 4000);
    }
}

function drawScene() {
    const ascii = $('ascii');
    if (ascii) ascii.textContent = getViewportArt();
    const con = $('console-art');
    if (con) con.textContent = consoleArt(playerName, lyGauge);
    checkMilestones();
}

function updateFuelDisplay() {
    const fc = $('fuel-count');
    if (fc) fc.textContent = 'Dark-Matter: ' + fuel;
}

function updateFuelBtnLabel() {
    const fb = $('fuel-btn');
    if (fb) fb.textContent = `Dump Fuel (+${currentClickGain()})`;
}

function updateEngineLabel() {
    const span = document.querySelector('#engine-toggle span');
    if (span) span.textContent = lyConversionOn ? 'Engine On' : 'Engine Off';
}

function updateStardustUI() {
    const sec = $('stardust-section');
    if (!sec) return;
    if (starCollapserOnline) {
        sec.classList.remove('hidden');
        const sc = $('stardust-count');
        if (sc) sc.textContent = `Stardust: ${stardust}`;
        updateCollapseCooldown();
    } else {
        sec.classList.add('hidden');
    }
}

function updateCollapseCooldown() {
    const btn = $('collapse-btn');
    if (!btn) return;
    const now = Date.now();
    if (now >= collapseCooldownUntil) {
        btn.disabled = false;
        const yld = collapserYieldBase * collapserEfficiencyLevel;
        btn.textContent = `Collapse (+${yld})`;
        return;
    }
    btn.disabled = true;
    const secs = Math.ceil((collapseCooldownUntil - now) / 1000);
    btn.textContent = `Collapse (${secs}s)`;
    setTimeout(updateCollapseCooldown, 250);
}

function restoreLoreText() {
    const lore = $('lore-text');
    const saved = localStorage.getItem('sivLore');
    if (lore && saved) {
        lore.innerHTML = saved;
        while (lore.children.length > 6) {
            lore.lastElementChild?.remove();
        }
    }
}

// ── Milestones ──
function checkMilestones() {
    if (!milestone50Fired && lyGauge >= 50) fireMilestone50();
    if (!milestone100Fired && lyGauge >= 100) fireMilestone100();
    // Re-check for already-passed milestones on load
    if (milestone50Fired && !coPilotPurchased) ensureCoPilotBuyBtn();
    if (milestone50Fired && coPilotPurchased) {
        show('systems-btn');
    }
}

function fireMilestone50() {
    milestone50Fired = true;
    if (!milestone50LoreShown) {
        addLoreMessage(LORE_MESSAGES[3]);
        addLoreMessage('The console begins humming - you notice a new lever that reads "Ship Co-Pilot"');
        milestone50LoreShown = true;
    }
    ensureCoPilotBuyBtn();
}

function ensureCoPilotBuyBtn() {
    if (coPilotPurchased) return;
    const btn = $('copilot-action-btn');
    if (!btn) return;
    btn.classList.remove('hidden');
    btn.textContent = 'Ship Co-Pilot: 100 DM';
}

function fireMilestone100() {
    milestone100Fired = true;
    document.body.classList.add('lights-on');
    if (!milestone100LoreShown) {
        addLoreMessage(LORE_MESSAGES[4]);
        milestone100LoreShown = true;
    }
}

// ── Co-Pilot ──
function setupCoPilotSwitch() {
    const btn = $('copilot-action-btn');
    if (!btn) return;
    btn.classList.remove('hidden');
    btn.textContent = 'Ship Co-Pilot: ' + (coPilotActive ? 'ON' : 'OFF');
    btn.style.borderColor = coPilotActive ? '#4a4' : '#333';
}

function toggleCoPilot() {
    coPilotActive = !coPilotActive;
    const btn = $('copilot-action-btn');
    if (btn) {
        btn.textContent = 'Ship Co-Pilot: ' + (coPilotActive ? 'ON' : 'OFF');
        btn.style.borderColor = coPilotActive ? '#4a4' : '#333';
    }
    if (coPilotActive) {
        if (!coPilotOnlineLoreShown) {
            addLoreMessage('[COPILOT ONLINE - BEGINNING AUTOMATIC CENTRIFUGE DUMP]');
            coPilotOnlineLoreShown = true;
        }
        startAutoDM();
    } else {
        stopAutoDM();
    }
}

function startAutoDM() {
    if (autoDMInterval) clearInterval(autoDMInterval);
    autoDMInterval = setInterval(() => {
        fuel += CO_PILOT_BASE_GAIN * coPilotLevel;
        updateFuelDisplay();
    }, 1000);
}

function stopAutoDM() {
    if (autoDMInterval) { clearInterval(autoDMInterval); autoDMInterval = null; }
}

// ── Shop ──
function renderShopControls() {
    currentView = 'shop';
    $('systems-btn').textContent = 'Main Console';
    hideEngineToggle();
    clearSubviewControls();
    drawScene(); // refresh ASCII to shop view

    const container = document.createElement('div');
    container.id = 'shop-controls';
    container.className = 'subview-controls';

    // Main upgrades column
    const mainCol = document.createElement('div');
    mainCol.className = 'subview-col';
    mainCol.innerHTML = '<div class="section-header">Main Upgrades</div>';

    mainCol.appendChild(makeShopBtn(
        `Upgrade Dump Yield (Lvl ${dumpUpgradeLevel}): ${dumpUpgradeCost} DM`,
        () => {
            if (fuel >= dumpUpgradeCost) {
                fuel -= dumpUpgradeCost;
                dumpUpgradeLevel++;
                dumpUpgradeCost = Math.ceil(dumpUpgradeCost * 1.2);
                addLoreMessage('[MANUAL DUMP YIELD INCREASED: +1 PER CLICK]');
                updateFuelBtnLabel();
                renderShopControls();
            } else addLoreMessage('[INSUFFICIENT Dark-Matter]');
        }
    ));
    mainCol.appendChild(makeShopBtn(
        `Upgrade Co-Pilot (Lvl ${coPilotLevel}): ${coPilotUpgradeCost} DM`,
        () => {
            if (fuel >= coPilotUpgradeCost) {
                fuel -= coPilotUpgradeCost;
                coPilotLevel++;
                coPilotUpgradeCost = Math.ceil(coPilotUpgradeCost * 1.2);
                if (coPilotActive) { stopAutoDM(); startAutoDM(); }
                addLoreMessage(`[CO-PILOT UPGRADED TO LEVEL ${coPilotLevel}]`);
                renderShopControls();
            } else addLoreMessage('[INSUFFICIENT Dark-Matter]');
        }
    ));
    mainCol.appendChild(makeShopBtn(
        `Upgrade Engine (Lvl ${capacityLevel}): ${capacityUpgradeCost} DM`,
        () => {
            if (fuel >= capacityUpgradeCost) {
                fuel -= capacityUpgradeCost;
                capacityLevel++;
                capacityUpgradeCost = Math.ceil(capacityUpgradeCost * 1.2);
                addLoreMessage(`[ENGINE UPGRADED: Intake ${capacityLevel} Dark-Matter/s]`);
                renderShopControls();
            } else addLoreMessage('[INSUFFICIENT Dark-Matter]');
        }
    ));
    container.appendChild(mainCol);

    // Efficiency column
    const effCol = document.createElement('div');
    effCol.className = 'subview-col';
    effCol.innerHTML = '<div class="section-header">Efficiency</div>';

    if (efficiencyLevel === 1) {
        effCol.appendChild(makeShopBtn(
            `Efficiency I: ${efficiencyUpgradeCost} DM`,
            () => {
                if (fuel >= efficiencyUpgradeCost) {
                    fuel -= efficiencyUpgradeCost;
                    efficiencyLevel = 2;
                    addLoreMessage('[ENGINE EFFICIENCY UPGRADED: Lightyears output doubled]');
                    renderShopControls();
                } else addLoreMessage('[INSUFFICIENT Dark-Matter]');
            }
        ));
    } else if (efficiencyLevel === 2 && capacityLevel >= 5) {
        effCol.appendChild(makeShopBtn(
            'Efficiency II: 1000 DM',
            () => {
                if (fuel >= 1000) {
                    fuel -= 1000;
                    efficiencyLevel = 4;
                    addLoreMessage('[ENGINE EFFICIENCY UPGRADED: Lightyears output doubled again]');
                    renderShopControls();
                } else addLoreMessage('[INSUFFICIENT Dark-Matter]');
            }
        ));
    }
    container.appendChild(effCol);

    // Experimental column
    const expCol = document.createElement('div');
    expCol.className = 'subview-col';
    expCol.innerHTML = '<div class="section-header">Experimental</div>';

    if (lyGauge >= 100 && !starCollapserOnline) {
        expCol.appendChild(makeShopBtn(
            'Star-Collapser: 300 DM',
            () => {
                if (fuel >= 300) {
                    fuel -= 300;
                    starCollapserOnline = true;
                    addLoreMessage('[STAR COLLAPSER ONLINE]');
                    updateStardustUI();
                    renderShopControls();
                } else addLoreMessage('[INSUFFICIENT Dark-Matter]');
            }
        ));
    }
    container.appendChild(expCol);

    $('viewport').appendChild(container);
    updateStardustUI();
}

function renderCollapserBayControls() {
    currentView = 'collapser';
    const navBtn = $('collapserbay-nav-btn');
    if (navBtn) navBtn.textContent = 'Main Console';
    hideEngineToggle();
    clearSubviewControls();
    drawScene();

    const container = document.createElement('div');
    container.id = 'collapser-controls';
    container.className = 'subview-controls';

    const mainCol = document.createElement('div');
    mainCol.className = 'subview-col';
    mainCol.innerHTML = '<div class="section-header">Main Upgrades</div>';

    mainCol.appendChild(makeShopBtn(
        `Increase Yield: ${collapserYieldBase} → ${collapserYieldBase + 1} (10 Stardust)`,
        () => {
            if (stardust >= 10) {
                stardust -= 10;
                collapserYieldBase++;
                updateStardustUI();
                renderCollapserBayControls();
            }
        }
    ));
    mainCol.appendChild(makeShopBtn(
        `Reduce Cooldown (-1s) [${collapserCooldownUpgrades}/10] (10 Stardust)`,
        () => {
            if (stardust >= 10 && collapserCooldownUpgrades < 10) {
                stardust -= 10;
                collapserCooldownUpgrades++;
                updateStardustUI();
                renderCollapserBayControls();
            }
        }
    ));
    container.appendChild(mainCol);

    const oneCol = document.createElement('div');
    oneCol.className = 'subview-col';
    oneCol.innerHTML = '<div class="section-header">One-time Upgrades</div>';

    if (collapserEfficiencyLevel === 1) {
        oneCol.appendChild(makeShopBtn(
            'Efficiency x2 Output (20 Stardust)',
            () => {
                if (stardust >= 20) {
                    stardust -= 20;
                    collapserEfficiencyLevel = 2;
                    updateStardustUI();
                    renderCollapserBayControls();
                }
            }
        ));
    } else {
        const done = document.createElement('div');
        done.className = 'purchased-label';
        done.textContent = 'Efficiency x2: Purchased';
        oneCol.appendChild(done);
    }
    container.appendChild(oneCol);

    $('viewport').appendChild(container);
    updateStardustUI();
}

function makeShopBtn(text, onclick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.onclick = onclick;
    return btn;
}

function clearSubviewControls() {
    $('shop-controls')?.remove();
    $('collapser-controls')?.remove();
}

function returnToMain() {
    currentView = 'main';
    clearSubviewControls();
    $('systems-btn').textContent = 'Systems';
    const navBtn = $('collapserbay-nav-btn');
    if (navBtn) navBtn.textContent = 'Collapser Bay';
    showEngineToggle();
    drawScene();
}

function hideEngineToggle() {
    const et = $('engine-toggle');
    if (et) et.style.display = 'none';
}
function showEngineToggle() {
    const et = $('engine-toggle');
    if (et) et.style.display = 'inline-flex';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    const saved = loadSave();

    if (saved && saved.currentScene === 'starfield') {
        restoreState(saved);
        hide('void');
        hide('terminal');
        enterStarfield(true);
    } else {
        startIntroSequence();
    }

    // Wire up buttons
    $('name-submit').onclick = handleNameSubmit;
    $('name-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleNameSubmit();
    });

    $('save-btn').onclick = saveGame;
    $('wipe-btn').onclick = wipeSave;
    $('logbook-btn').onclick = showLogbook;

    $('fuel-btn').onclick = () => {
        fuel += currentClickGain();
        updateFuelDisplay();
        if (!fuelLoreShown) {
            addLoreMessage(LORE_MESSAGES[2]);
            fuelLoreShown = true;
        }
    };

    $('engine-switch').onchange = function() {
        lyConversionOn = this.checked;
        updateEngineLabel();
    };

    // Co-pilot action button: buy or toggle
    $('copilot-action-btn').onclick = () => {
        if (!coPilotPurchased) {
            if (fuel >= 100) {
                fuel -= 100;
                coPilotPurchased = true;
                updateFuelDisplay();
                addLoreMessage('[SHIP COPILOT ONLINE]');
                setupCoPilotSwitch();
                show('systems-btn');
            }
        } else {
            toggleCoPilot();
        }
    };

    // Systems button
    $('systems-btn').onclick = () => {
        if (currentView === 'shop') {
            returnToMain();
        } else {
            renderShopControls();
        }
    };

    // Collapser Bay nav button
    $('collapserbay-nav-btn').onclick = () => {
        if (!starCollapserBayOnline) return;
        if (currentView === 'collapser') {
            returnToMain();
        } else {
            renderCollapserBayControls();
        }
    };

    // Collapse button
    $('collapse-btn').onclick = () => {
        if (!starCollapserOnline) return;
        const now = Date.now();
        if (now < collapseCooldownUntil) return;
        const yld = collapserYieldBase * collapserEfficiencyLevel;
        stardust += yld;
        const baseMs = 10000;
        const reduceMs = Math.min(10, collapserCooldownUpgrades) * 1000;
        collapseCooldownUntil = now + Math.max(1000, baseMs - reduceMs);
        updateStardustUI();
        // Check if can buy collapser bay
        if (!starCollapserBayOnline && stardust >= 10) {
            ensureCollapserBayPurchase();
        }
    };
});

function ensureCollapserBayPurchase() {
    if (starCollapserBayOnline) return;
    // Add a purchase button in stardust section if not present
    if ($('bay-buy-btn')) return;
    const sec = $('stardust-section');
    if (!sec) return;
    const btn = document.createElement('button');
    btn.id = 'bay-buy-btn';
    btn.textContent = 'Buy Collapser Bay (10 Stardust)';
    btn.onclick = () => {
        if (stardust >= 10) {
            stardust -= 10;
            starCollapserBayOnline = true;
            addLoreMessage('[COLLAPSER BAY CONSTRUCTED — ACCESS PANEL ONLINE]');
            btn.remove();
            show('collapserbay-nav-btn');
            updateStardustUI();
        }
    };
    sec.appendChild(btn);
}
