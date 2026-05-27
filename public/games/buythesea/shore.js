// ═══════════════════════════════════════════════════════════════
//  SHORE / CLICKER SYSTEM
// ═══════════════════════════════════════════════════════════════

const shoreCanvas = document.getElementById('shore-canvas');
const shoreCtx = shoreCanvas.getContext('2d');
let shoreW = 0, shoreH = 0;

// Visual state for shore
const shoreVis = {
  ripples: [],
  clickParticles: [],
  waveOffset: 0,
  bubbles: [],
  flopFish: [],    // fish that flop out of the water
  seagulls: [],    // decorative seagulls
  kelp: [],        // swaying kelp
  _kelpSeeded: false,
  _seagullSeeded: false,
};

function resizeShoreCanvas() {
  const wrap = document.getElementById('shore-canvas-wrap');
  if (!wrap) return;
  shoreW = wrap.clientWidth || 800;
  shoreH = wrap.clientHeight || 500;
  shoreCanvas.width = shoreW;
  shoreCanvas.height = shoreH;
  // Re-seed decorative elements for new dimensions
  shoreVis.kelp = [];
  shoreVis.seagulls = [];
  shoreVis._kelpSeeded = false;
  shoreVis._seagullSeeded = false;
}

// ─── Shore Update ───

function updateShore(dt) {
  // Passive water generation from buildings
  const wps = getShoreWPS();
  if (wps > 0) {
    state.shore.water += wps * dt;
    state.shore.totalWater += wps * dt;
  }

  // Update visual effects
  shoreVis.waveOffset += dt * 0.8;

  for (let i = shoreVis.ripples.length - 1; i >= 0; i--) {
    shoreVis.ripples[i].timer -= dt;
    if (shoreVis.ripples[i].timer <= 0) shoreVis.ripples.splice(i, 1);
  }
  for (let i = shoreVis.clickParticles.length - 1; i >= 0; i--) {
    const p = shoreVis.clickParticles[i];
    p.timer -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 80 * dt; // gravity
    if (p.timer <= 0) shoreVis.clickParticles.splice(i, 1);
  }
  for (let i = shoreVis.bubbles.length - 1; i >= 0; i--) {
    const b = shoreVis.bubbles[i];
    b.y -= b.speed * dt;
    b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.3;
    if (b.y < -5) shoreVis.bubbles.splice(i, 1);
  }
  if (Math.random() < dt * 2) {
    shoreVis.bubbles.push({
      x: shoreW * 0.05 + Math.random() * shoreW * 0.9,
      y: shoreH * 0.15 + Math.random() * shoreH * 0.7,
      r: 1 + Math.random() * 2.5,
      speed: 10 + Math.random() * 20,
      opacity: 0.05 + Math.random() * 0.12,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.8 + Math.random() * 1.5,
    });
  }

  // Fish flopping out of water
  for (let i = shoreVis.flopFish.length - 1; i >= 0; i--) {
    const f = shoreVis.flopFish[i];
    f.timer -= dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.vy += 300 * dt; // gravity
    f.rot += f.rotSpeed * dt;
    if (f.timer <= 0) shoreVis.flopFish.splice(i, 1);
  }
  if (Math.random() < dt * 0.3) {
    const waterLine = shoreH * 0.12;
    shoreVis.flopFish.push({
      x: shoreW * 0.1 + Math.random() * shoreW * 0.8,
      y: waterLine,
      vx: (Math.random() - 0.5) * 60,
      vy: -120 - Math.random() * 80,
      rot: 0,
      rotSpeed: (Math.random() - 0.5) * 8,
      size: 6 + Math.random() * 8,
      color: ['#66ccff', '#88aaff', '#44ddaa', '#ffaa44'][Math.floor(Math.random() * 4)],
      timer: 1.2 + Math.random() * 0.5,
    });
  }

  // Seed kelp once
  if (!shoreVis._kelpSeeded && shoreW > 0) {
    shoreVis._kelpSeeded = true;
    for (let i = 0; i < 8; i++) {
      shoreVis.kelp.push({
        x: shoreW * 0.05 + Math.random() * shoreW * 0.9,
        height: 30 + Math.random() * 50,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.8,
      });
    }
  }

  // Seed seagulls once
  if (!shoreVis._seagullSeeded && shoreW > 0) {
    shoreVis._seagullSeeded = true;
    for (let i = 0; i < 3; i++) {
      shoreVis.seagulls.push({
        x: Math.random() * shoreW,
        y: shoreH * 0.02 + Math.random() * shoreH * 0.06,
        speed: 15 + Math.random() * 20,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 3 + Math.random() * 2,
      });
    }
  }

  // Update seagulls
  for (const g of shoreVis.seagulls) {
    g.x += g.speed * dt;
    g.wingPhase += g.wingSpeed * dt;
    if (g.x > shoreW + 30) g.x = -30;
  }

  // Check if coast should be unlocked
  if (!state.shore.coastUnlocked && state.shore.water >= 100) {
    state.shore.coastUnlocked = true;
    const descBtn = document.getElementById('btn-descend');
    if (descBtn) {
      descBtn.style.display = 'block';
      descBtn.classList.add('pulse-hint');
    }
  }

  // Update shore UI
  updateShoreUI();
}

// ─── Shore Drawing ───

function drawShore() {
  shoreCtx.clearRect(0, 0, shoreW, shoreH);

  // Sky gradient
  const skyH = shoreH * 0.12;
  const skyGrad = shoreCtx.createLinearGradient(0, 0, 0, skyH);
  skyGrad.addColorStop(0, '#000d1a');
  skyGrad.addColorStop(1, '#002233');
  shoreCtx.fillStyle = skyGrad;
  shoreCtx.fillRect(0, 0, shoreW, skyH);

  // Stars
  shoreCtx.save();
  shoreCtx.fillStyle = 'rgba(200,220,255,0.4)';
  for (let i = 0; i < 20; i++) {
    const sx = (i * 173 + 31) % shoreW;
    const sy = (i * 67 + 11) % Math.floor(skyH);
    const sr = 0.5 + (i % 3) * 0.3;
    shoreCtx.beginPath();
    shoreCtx.arc(sx, sy, sr, 0, Math.PI * 2);
    shoreCtx.fill();
  }
  shoreCtx.restore();

  // Moon
  shoreCtx.save();
  shoreCtx.fillStyle = '#446688';
  shoreCtx.shadowColor = '#88aacc';
  shoreCtx.shadowBlur = 40;
  shoreCtx.beginPath();
  shoreCtx.arc(shoreW * 0.85, skyH * 0.5, 14, 0, Math.PI * 2);
  shoreCtx.fill();
  shoreCtx.restore();

  // Seagulls
  for (const g of shoreVis.seagulls) {
    shoreCtx.save();
    shoreCtx.strokeStyle = 'rgba(180,200,220,0.4)';
    shoreCtx.lineWidth = 1.5;
    const wingY = Math.sin(g.wingPhase) * 4;
    shoreCtx.beginPath();
    shoreCtx.moveTo(g.x - 8, g.y + wingY);
    shoreCtx.quadraticCurveTo(g.x - 3, g.y - 2, g.x, g.y);
    shoreCtx.quadraticCurveTo(g.x + 3, g.y - 2, g.x + 8, g.y + wingY);
    shoreCtx.stroke();
    shoreCtx.restore();
  }

  // Ocean — fills most of the canvas (clickable area)
  const waterTop = skyH;
  const waterGrad = shoreCtx.createLinearGradient(0, waterTop, 0, shoreH);
  waterGrad.addColorStop(0, '#004455');
  waterGrad.addColorStop(0.15, '#003344');
  waterGrad.addColorStop(0.5, '#002233');
  waterGrad.addColorStop(1, '#001122');
  shoreCtx.fillStyle = waterGrad;
  shoreCtx.fillRect(0, waterTop, shoreW, shoreH - waterTop);

  // Wave surface lines
  shoreCtx.save();
  shoreCtx.strokeStyle = 'rgba(100,200,255,0.3)';
  shoreCtx.lineWidth = 2;
  for (let w = 0; w < 3; w++) {
    const waveY = waterTop + w * 3;
    shoreCtx.beginPath();
    for (let x = 0; x <= shoreW; x += 5) {
      const y = waveY + Math.sin(x * 0.02 + shoreVis.waveOffset + w * 1.5) * 4;
      if (x === 0) shoreCtx.moveTo(x, y);
      else shoreCtx.lineTo(x, y);
    }
    shoreCtx.stroke();
  }
  shoreCtx.restore();

  // Deep water caustic light patterns
  shoreCtx.save();
  shoreCtx.globalAlpha = 0.04;
  shoreCtx.fillStyle = '#66ccff';
  for (let i = 0; i < 12; i++) {
    const cx = (i * 197 + 50) % shoreW;
    const cy = shoreH * 0.4 + (i * 83) % Math.floor(shoreH * 0.4);
    const cr = 20 + (i % 4) * 15;
    const wobble = Math.sin(shoreVis.waveOffset * 0.5 + i) * 10;
    shoreCtx.beginPath();
    shoreCtx.ellipse(cx + wobble, cy, cr, cr * 0.6, i * 0.5, 0, Math.PI * 2);
    shoreCtx.fill();
  }
  shoreCtx.restore();

  // Kelp
  for (const k of shoreVis.kelp) {
    const baseY = shoreH - 5;
    const sway = Math.sin(shoreVis.waveOffset * k.speed + k.phase) * 12;
    shoreCtx.save();
    shoreCtx.strokeStyle = 'rgba(30,120,60,0.3)';
    shoreCtx.lineWidth = 3;
    shoreCtx.lineCap = 'round';
    shoreCtx.beginPath();
    shoreCtx.moveTo(k.x, baseY);
    shoreCtx.quadraticCurveTo(k.x + sway, baseY - k.height * 0.6, k.x + sway * 1.5, baseY - k.height);
    shoreCtx.stroke();
    // Kelp leaf blobs
    for (let j = 0.3; j <= 0.9; j += 0.3) {
      const lx = k.x + sway * j;
      const ly = baseY - k.height * j;
      shoreCtx.fillStyle = 'rgba(30,140,60,0.2)';
      shoreCtx.beginPath();
      shoreCtx.ellipse(lx + 4, ly, 5, 3, sway * 0.05, 0, Math.PI * 2);
      shoreCtx.fill();
    }
    shoreCtx.restore();
  }

  // Bubbles
  for (const b of shoreVis.bubbles) {
    shoreCtx.beginPath();
    shoreCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    shoreCtx.strokeStyle = `rgba(100,220,255,${b.opacity})`;
    shoreCtx.lineWidth = 0.5;
    shoreCtx.stroke();
  }

  // Click ripples
  for (const r of shoreVis.ripples) {
    const progress = 1 - r.timer / r.maxTimer;
    const radius = progress * 40;
    const alpha = (1 - progress) * 0.6;
    shoreCtx.save();
    shoreCtx.strokeStyle = `rgba(100,220,255,${alpha})`;
    shoreCtx.lineWidth = 2;
    shoreCtx.beginPath();
    shoreCtx.arc(r.x, r.y, radius, 0, Math.PI * 2);
    shoreCtx.stroke();
    shoreCtx.restore();
  }

  // Click particles (water drops)
  for (const p of shoreVis.clickParticles) {
    const alpha = Math.max(0, p.timer / p.maxTimer);
    shoreCtx.save();
    shoreCtx.globalAlpha = alpha;
    shoreCtx.fillStyle = '#66ccff';
    shoreCtx.shadowColor = '#66ccff';
    shoreCtx.shadowBlur = 6;
    shoreCtx.beginPath();
    shoreCtx.arc(p.x, p.y, 2 + p.size, 0, Math.PI * 2);
    shoreCtx.fill();
    shoreCtx.restore();
  }

  // Flopping fish
  for (const f of shoreVis.flopFish) {
    shoreCtx.save();
    shoreCtx.translate(f.x, f.y);
    shoreCtx.rotate(f.rot);
    shoreCtx.fillStyle = f.color;
    shoreCtx.globalAlpha = Math.min(1, f.timer * 2);
    // Fish body
    shoreCtx.beginPath();
    shoreCtx.ellipse(0, 0, f.size, f.size * 0.45, 0, 0, Math.PI * 2);
    shoreCtx.fill();
    // Tail
    shoreCtx.beginPath();
    shoreCtx.moveTo(-f.size, 0);
    shoreCtx.lineTo(-f.size - f.size * 0.6, -f.size * 0.4);
    shoreCtx.lineTo(-f.size - f.size * 0.6, f.size * 0.4);
    shoreCtx.closePath();
    shoreCtx.fill();
    shoreCtx.restore();
  }

  // "CLICK THE WATER" hint if no water yet
  if (state.shore.totalWater < 5) {
    shoreCtx.save();
    shoreCtx.font = '16px "Space Mono", monospace';
    shoreCtx.fillStyle = 'rgba(100,200,255,0.4)';
    shoreCtx.textAlign = 'center';
    shoreCtx.fillText('CLICK THE WATER', shoreW / 2, shoreH * 0.45);
    shoreCtx.restore();
  }

  // Flavor text at bottom
  shoreCtx.save();
  shoreCtx.font = '10px "Space Mono", monospace';
  shoreCtx.fillStyle = 'rgba(100,180,220,0.15)';
  shoreCtx.textAlign = 'center';
  shoreCtx.fillText('YEAR 2383 — OCEAN DRAINAGE INITIATIVE', shoreW / 2, shoreH - 8);
  shoreCtx.restore();
}

// ─── Shore Click Handler ───

function handleShoreClick(e) {
  const rect = shoreCanvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (shoreW / rect.width);
  const cy = (e.clientY - rect.top) * (shoreH / rect.height);

  const waterTop = shoreH * 0.12;

  // Only count clicks in the water area (below sky)
  if (cy >= waterTop) {
    const amount = getWaterPerClick();
    state.shore.water += amount;
    state.shore.totalWater += amount;

    // Visual feedback
    shoreVis.ripples.push({ x: cx, y: cy, timer: 0.6, maxTimer: 0.6 });
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      shoreVis.clickParticles.push({
        x: cx, y: cy,
        vx: (Math.random() - 0.5) * 80,
        vy: -30 - Math.random() * 60,
        timer: 0.5 + Math.random() * 0.3,
        maxTimer: 0.8,
        size: Math.random() * 2,
      });
    }

    audio.play('click');
    updateShoreUI();
  }
}

// ─── Shore UI Updates ───

// Tracks previous render state to avoid unnecessary DOM rebuilds
let _shoreBuildingsRendered = '';

function updateShoreUI() {
  const waterEl = document.getElementById('shore-water-count');
  if (waterEl) waterEl.textContent = fmt(Math.floor(state.shore.water));

  const wpsEl = document.getElementById('shore-wps');
  if (wpsEl) {
    const wps = getShoreWPS();
    wpsEl.textContent = wps > 0 ? `${wps.toFixed(1)}/s` : '';
  }

  // Only re-render buildings when state changes (not every frame)
  renderShoreBuildings();

  // Show/hide descend button
  const descBtn = document.getElementById('btn-descend');
  if (descBtn) {
    descBtn.style.display = state.shore.coastUnlocked ? 'block' : 'none';
  }

  // Show/hide conversion section (only after player has descended and returned)
  const convSection = document.getElementById('shore-convert-section');
  if (convSection) {
    convSection.style.display = state.shore.hasDescended ? 'flex' : 'none';
  }
}

function renderShoreBuildings() {
  const grid = document.getElementById('shore-buildings-grid');
  if (!grid) return;

  // Build a fingerprint of current state to detect changes
  const fingerprint = SHORE_BUILDINGS.map(b => {
    const owned = state.shore.buildings[b.id] || 0;
    const cost = shoreBuildingCost(b.id);
    const canAfford = state.shore.water >= cost ? 1 : 0;
    return `${b.id}:${owned}:${cost}:${canAfford}`;
  }).join('|');

  // Skip DOM rebuild if nothing changed
  if (fingerprint === _shoreBuildingsRendered) return;
  _shoreBuildingsRendered = fingerprint;

  let html = '';
  for (const b of SHORE_BUILDINGS) {
    const owned = state.shore.buildings[b.id] || 0;
    const cost = shoreBuildingCost(b.id);
    const canAfford = state.shore.water >= cost;
    const wps = b.wps * (1 + (state.prestige.upgrades.pearl_building_output || 0) * 0.05);

    html += `
      <div class="shore-building ${canAfford ? 'affordable' : ''}" data-building="${b.id}">
        <div class="shore-building-header">
          <span class="shore-building-name">${b.name}</span>
          <span class="shore-building-count">${owned}</span>
        </div>
        <div class="shore-building-desc">${b.desc}</div>
        <div class="shore-building-stats">
          <span class="shore-building-wps">${wps.toFixed(1)} water/s each</span>
          <span class="shore-building-cost">${fmt(cost)} water</span>
        </div>
      </div>
    `;
  }
  grid.innerHTML = html;

  // Use event delegation instead of per-element listeners
  grid.onclick = (e) => {
    const el = e.target.closest('.shore-building');
    if (el) buyShoreBuilding(el.dataset.building);
  };
}

function buyShoreBuilding(id) {
  const cost = shoreBuildingCost(id);
  if (state.shore.water < cost) return;
  state.shore.water -= cost;
  state.shore.buildings[id] = (state.shore.buildings[id] || 0) + 1;
  audio.play('click');
  updateShoreUI();
  checkAchievements();
}

// ─── Water to Gold Conversion ───

function convertWater(bulk) {
  const rate = getWaterConversionRate();
  const amount = bulk ? rate * 10 : rate; // 10x option
  const goldGained = bulk ? 10 : 1;

  if (state.shore.water < amount) return;
  state.shore.water -= amount;
  state.gold += goldGained;
  state.totalGoldEarned += goldGained;
  audio.play('click');
  updateShoreUI();
  updateAllGoldDisplays();
}

// ─── Achievements ───

function checkAchievements() {
  for (const ach of ACHIEVEMENTS) {
    if (state.achievementsCompleted[ach.id]) continue;
    if (ach.check()) {
      state.achievementsCompleted[ach.id] = true;
      applyAchievementReward(ach);
      showNotif(`ACHIEVEMENT: ${ach.name}`);
    }
  }
}

function applyAchievementReward(ach) {
  if (ach.reward.water) {
    state.shore.water += ach.reward.water;
    state.shore.totalWater += ach.reward.water;
  }
  if (ach.reward.gold) {
    state.gold += ach.reward.gold;
    state.totalGoldEarned += ach.reward.gold;
  }
  if (ach.reward.legendaryFish) {
    // Give a random legendary fish from unlocked zones
    const legendaries = Object.values(FISH).filter(f => f.rarity === 'LEGENDARY' && f.zone <= Math.max(...state.unlockedZones));
    if (legendaries.length > 0) {
      const fish = legendaries[Math.floor(Math.random() * legendaries.length)];
      const fishId = Object.keys(FISH).find(k => FISH[k] === fish);
      if (fishId) {
        state.inventory[fishId] = (state.inventory[fishId] || 0) + 1;
        state.catalogCaught[fishId] = (state.catalogCaught[fishId] || 0) + 1;
      }
    }
  }
  updateShoreUI();
  updateAllGoldDisplays();
}

function renderAchievements() {
  const el = document.getElementById('achievements-list');
  if (!el) return;
  let html = '';
  for (const ach of ACHIEVEMENTS) {
    const done = state.achievementsCompleted[ach.id];
    html += `
      <div class="achievement-item ${done ? 'achieved' : ''}">
        <div class="achievement-name">${done ? '✓ ' : ''}${ach.name}</div>
        <div class="achievement-desc">${ach.desc}</div>
        <div class="achievement-reward">REWARD: ${ach.rewardDesc}</div>
      </div>
    `;
  }
  el.innerHTML = html;
}

// ─── Init Shore Events ───

let _shoreEventsInitialized = false;

function initShoreEvents() {
  // Guard against duplicate initialization (called from multiple code paths)
  if (_shoreEventsInitialized) return;
  _shoreEventsInitialized = true;

  shoreCanvas.addEventListener('click', handleShoreClick);

  const descBtn = document.getElementById('btn-descend');
  if (descBtn) {
    descBtn.addEventListener('click', () => {
      state.shore.hasDescended = true;
      switchScreen('screen-fishing');
      cv.fish = []; cv.hook = null; cv.cooldown = 0;
      spawnFish(); spawnFish(); spawnFish();
      setTimeout(flashZoneOverlay, 400);
    });
  }

  const convertBtn = document.getElementById('btn-convert-water');
  if (convertBtn) {
    convertBtn.addEventListener('click', () => convertWater(false));
  }
  const convertBulkBtn = document.getElementById('btn-convert-water-bulk');
  if (convertBulkBtn) {
    convertBulkBtn.addEventListener('click', () => convertWater(true));
  }

  resizeShoreCanvas();
  window.addEventListener('resize', () => setTimeout(resizeShoreCanvas, 40));
}
