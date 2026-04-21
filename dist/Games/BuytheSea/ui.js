// ═══════════════════════════════════════════════════════════════
//  ECONOMY
// ═══════════════════════════════════════════════════════════════

function upgradeCost(id) {
  const def = UPGRADES_MAP[id];
  const level = state.upgrades[id];
  if (id === 'rod_speed' && level === 0) return 0;
  // Fixed cost array
  if (def.costs) {
    let cost = def.costs[level] || def.costs[def.costs.length - 1];
    if (state.labSaleTimer > 0) cost = Math.ceil(cost * 0.7);
    return cost;
  }
  const mult = def.costMult || 1.12;
  let cost = Math.ceil(def.baseCost * Math.pow(mult, level));
  if (state.labSaleTimer > 0) cost = Math.ceil(cost * 0.7);
  return cost;
}

function getGoldMultiplier() {
  return (1 + getUpgradeLevel('gold_boost') * 0.05) * getPrestigeSellMultiplier();
}

function buyUpgrade(id) {
  const def  = UPGRADES_MAP[id];
  const cost = upgradeCost(id);
  if (state.upgrades[id] >= getEffectiveMax(id) || state.gold < cost) return;
  state.gold -= cost;
  state.upgrades[id]++;
  state.stats.totalUpgradesBought++;
  audio.play('upgrade');

  // Auto_hook first purchase — show toggle with guide arrow (default off)
  if (id === 'auto_hook' && state.upgrades.auto_hook === 1) {
    if (typeof updateAutoHookUI === 'function') {
      updateAutoHookUI();
      const bar = document.getElementById('auto-hook-bar');
      if (bar) {
        bar.classList.add('pulse-hint');
        addGuideArrow(bar);
      }
    }
  }
  // Update auto hook label when upgrading speed/reload
  if ((id.startsWith('auto_hook_speed') || id.startsWith('auto_hook_reload')) && typeof updateAutoHookUI === 'function') {
    updateAutoHookUI();
  }
  if (id === 'auto_sell' && state.upgrades.auto_sell === 1) {
    if (typeof updateAutoSellUI === 'function') updateAutoSellUI();
  }
  // Update net button when upgrading net slots/size
  if (id === 'net_place' || id === 'net_slots' || id === 'net_size') {
    updatePlaceNetBtn();
  }

  updateAllGoldDisplays();
  renderUpgrades();
  checkMilestones();
}

function placeNet(cx, cy) {
  if (state.upgrades.net_place < 1) return;
  if (state.netCooldown > 0) return;
  const maxNets = getMaxNets();
  const radius = getNetRadius();
  if (cv.placedNets.length >= maxNets) return;
  cv.placedNets.push({ x: cx, y: cy, radius });
  state.activeConsumable = null;
  document.getElementById('btn-place-net').classList.remove('active');
  updatePlaceNetBtn();
}

function updatePlaceNetBtn() {
  const btn = document.getElementById('btn-place-net');
  if (state.upgrades.net_place >= 1) {
    btn.style.display = 'flex';
    const maxNets = getMaxNets();
    if (state.netCooldown > 0) {
      btn.textContent = `NET ${Math.ceil(state.netCooldown)}s`;
      btn.classList.add('cooldown');
      btn.classList.remove('active');
      btn.title = `NET COOLDOWN (${Math.ceil(state.netCooldown)}s)`;
    } else {
      btn.textContent = `NET ${cv.placedNets.length}/${maxNets}`;
      btn.classList.remove('cooldown');
      btn.title = `PLACE NET (${cv.placedNets.length}/${maxNets})`;
    }
  }
}

function useBait() {
  if (state.baitCooldown > 0 || state.upgrades.bait_bomb < 1) return;
  state.flags.baitUsed = true;
  state.baitTimer   = 5;
  state.baitCooldown = 300 - state.upgrades.bait_cooldown * 30;
  const fishCount = 18 + state.upgrades.bait_strength * 6;
  const interval = (5 * 1000) / fishCount;
  for (let i = 0; i < fishCount; i++) setTimeout(() => spawnFish(), i * interval);
  updateBaitBtn();
}

function useMultiCast() {
  if (state.multiCastCooldown > 0 || state.upgrades.multi_cast < 1) return;
  const duration = 15 + state.upgrades.multi_duration * 3;
  state.multiCastTimer = duration;
  state.multiCastCooldown = 180 - state.upgrades.multi_cooldown * 15;
  updateMultiCastBtn();
}

function sellFish(typeId) {
  const count = state.inventory[typeId] || 0;
  if (!count) return;
  const earned = Math.ceil(count * FISH[typeId].goldValue * getGoldMultiplier() * (state.sellMultiplier || 1));
  state.gold += earned;
  state.totalGoldEarned += earned;
  delete state.inventory[typeId];
  audio.play('sell');
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function sellGoldenFish(goldenId) {
  const count = state.inventory[goldenId] || 0;
  if (!count) return;
  const baseId = goldenId.replace('golden_', '');
  const earned = Math.ceil(count * FISH[baseId].goldValue * 10 * getGoldMultiplier() * (state.sellMultiplier || 1));
  state.gold += earned;
  state.totalGoldEarned += earned;
  delete state.inventory[goldenId];
  audio.play('sell');
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function sellAll() {
  let total = 0, count = 0;
  const mult = (state.sellMultiplier || 1) * getGoldMultiplier();
  for (const [id, qty] of Object.entries(state.inventory)) {
    if (id.startsWith('golden_')) {
      const baseId = id.replace('golden_', '');
      total += qty * FISH[baseId].goldValue * 10 * mult;
    } else {
      total += qty * FISH[id].goldValue * mult;
    }
    count += qty; delete state.inventory[id];
  }
  if (!count) return;
  total = Math.ceil(total);
  state.gold += total;
  state.totalGoldEarned += total;
  audio.play('sell');
  if (!state.flags.sellAllUsed) {
    state.flags.sellAllUsed = true;
    const backBtn = document.getElementById('btn-back-shop');
    backBtn.classList.add('pulse-strong');
  }
  checkMilestones();
  updateAllGoldDisplays();
  renderShop();
}

function purchaseZone(zoneId) {
  const zone = ZONES[zoneId];
  if (!zone || state.gold < zone.unlockCost) return;
  state.gold -= zone.unlockCost;
  state.unlockedZones.push(zoneId);
  updateAllGoldDisplays();
  audio.play('catch_rare');
  // Don't auto-travel — player clicks again to travel, which triggers boss fight
  renderAtlas();
}

// ─── Milestones ───

function checkMilestones() {
  const f = state.flags;

  if (!f.shopUnlocked && state.stats.totalCaught >= 3) {
    f.shopUnlocked = true;
    showBubble('btn-shop', true);
  }
  if (!f.upgradesUnlocked && state.gold >= 15) {
    f.upgradesUnlocked = true;
    showBubble('btn-upgrades', true);
  }
  if (!f.saveUnlocked && state.totalGoldEarned >= 200) {
    f.saveUnlocked = true;
  }

  if (!f.atlasUnlocked && state.upgrades.atlas_access >= 1) {
    f.atlasUnlocked = true;
    showBubble('btn-atlas', true);
  }
  if (!f.boatUnlocked && state.upgrades.boat_access >= 1) {
    f.boatUnlocked = true;
    showBubble('btn-boat', true);
  }
  if (!f.catalogUnlocked && state.upgrades.catalog_access >= 1) {
    f.catalogUnlocked = true;
    showBubble('btn-catalog', true);
  }

  if (!f.baitVisible && state.upgrades.bait_bomb >= 1) {
    f.baitVisible = true;
    const b = document.getElementById('btn-bait');
    b.style.display = 'flex';
    b.classList.add('pulse-new');
    b.offsetHeight;
    addGuideArrow(b, 'right');
  }
  if (f.baitVisible && !f.baitUsed) {
    const b = document.getElementById('btn-bait');
    if (!b.querySelector('.guide-arrow')) addGuideArrow(b, 'right');
  }

  if (state.upgrades.auto_sell >= 1) {
    document.getElementById('auto-sell-bar').style.display = 'flex';
  }

  // Net placement button
  if (state.upgrades.net_place >= 1) {
    const nb = document.getElementById('btn-place-net');
    if (nb.style.display === 'none') {
      nb.style.display = 'flex';
      nb.classList.add('pulse-new');
      addGuideArrow(nb, 'right');
    }
    updatePlaceNetBtn();
  }

  if (!f.multiCastVisible && state.upgrades.multi_cast >= 1) {
    f.multiCastVisible = true;
    const mc = document.getElementById('btn-multicast');
    mc.style.display = 'flex';
    mc.classList.add('pulse-new');
    mc.offsetHeight;
  }

  // Weapon toggle: show once harpoon is bought
  if (state.upgrades.harpoon >= 1) {
    document.getElementById('weapon-toggle').style.display = 'flex';
  }

  // Prestige button: show once sandbank boss is defeated (entered playable area of the reef)
  if (state.bossesDefeated.includes(3) && !state.flags.prestigeUnlocked) {
    state.flags.prestigeUnlocked = true;
  }
  if (state.flags.prestigeUnlocked) {
    const pb = document.getElementById('btn-prestige');
    if (pb.style.display === 'none') pb.style.display = 'flex';
    updatePrestigeNavBtn();
  }

  // Auto ability toggles
  if (state.upgrades.auto_bait >= 1) {
    document.getElementById('auto-bait-toggle').style.display = 'flex';
    document.getElementById('auto-bait-checkbox').checked = state.flags.autoBaitEnabled;
  }
  if (state.upgrades.auto_multi >= 1) {
    document.getElementById('auto-multi-toggle').style.display = 'flex';
    document.getElementById('auto-multi-checkbox').checked = state.flags.autoMultiEnabled;
  }

  // Submarine toggle
  if (state.upgrades.submarine >= 1) {
    document.getElementById('sub-toggle').style.display = 'flex';
  }

  // Check achievements
  checkAchievements();
}

// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════

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
  if (ach.reward.gold) {
    state.gold += ach.reward.gold;
    state.totalGoldEarned += ach.reward.gold;
  }
  if (ach.reward.legendaryFish) {
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

// ═══════════════════════════════════════════════════════════════
//  UI HELPERS
// ═══════════════════════════════════════════════════════════════

function updateBaitBtn() {
  const btn = document.getElementById('btn-bait');
  if (!state.flags.baitVisible) return;
  if (state.baitCooldown > 0) {
    btn.classList.add('cooldown');
    btn.classList.remove('pulse-new');
    btn.textContent = Math.ceil(state.baitCooldown);
    btn.title = `BAIT (${Math.ceil(state.baitCooldown)}s)`;
  } else {
    btn.classList.remove('cooldown');
    btn.textContent = 'B';
    btn.title = 'BAIT';
  }
}

function updateMultiCastBtn() {
  const btn = document.getElementById('btn-multicast');
  if (state.upgrades.multi_cast < 1) return;
  if (state.multiCastCooldown > 0) {
    btn.classList.add('cooldown');
    btn.classList.remove('pulse-new');
    btn.textContent = Math.ceil(state.multiCastCooldown);
    btn.title = `MULTI-CAST (${Math.ceil(state.multiCastCooldown)}s)`;
  } else {
    btn.classList.remove('cooldown');
    btn.textContent = 'M';
    btn.title = 'MULTI-CAST';
  }
}

function showBubble(id, unread) {
  const btn = document.getElementById(id);
  btn.style.display = 'block';
  btn.offsetHeight;
  btn.classList.add('revealed');
  if (unread) {
    btn.classList.add('unread');
    addGuideArrow(btn);
  }
}

function addGuideArrow() {}

function updateAllGoldDisplays() {
  const g = fmt(Math.floor(state.gold));
  ['gold-fishing', 'gold-shop', 'gold-upgrades', 'gold-atlas', 'gold-boat', 'gold-catalog', 'gold-achievements'].forEach(id => {
    const elem = document.getElementById(id);
    if (!elem) return;
    elem.textContent = g;
  });
}

function updateZoneOverlay() {
  const zone = ZONES[state.currentZone];
  document.getElementById('zone-overlay-code').textContent = zone.code;
  document.getElementById('zone-overlay-name').textContent = zone.name;
  document.getElementById('fishing-zone-label').textContent = zone.name;
}

function flashZoneOverlay() {
  const el = document.getElementById('zone-overlay');
  el.classList.remove('zone-flash');
  el.offsetHeight;
  el.classList.add('zone-flash');
}

// ─── Screen management ───

const ALL_SCREENS = ['screen-fishing', 'screen-shop', 'screen-upgrades', 'screen-atlas', 'screen-boat', 'screen-catalog', 'screen-prestige', 'screen-achievements'];

function switchScreen(to) {
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.add('flash');
  setTimeout(() => {
    ALL_SCREENS.forEach(id => {
      document.getElementById(id).classList.toggle('active', id === to);
    });
    overlay.classList.remove('flash');

    // Music crossfade: lab track for atlas, main track for everything else
    if (to === 'screen-atlas') audio.switchMusic('lab');
    else audio.switchMusic('main');

    if (to === 'screen-shop') {
      document.getElementById('btn-shop').classList.remove('unread');
      state.flags.shopVisited = true;
      renderShop();
    }
    if (to === 'screen-upgrades') {
      document.getElementById('btn-upgrades').classList.remove('unread');
      const firstVisit = !state.flags.upgradesVisited;
      state.flags.upgradesVisited = true;
      renderUpgrades();
      if (firstVisit && !state.flags.firstUpgradeHinted) {
        state.flags.firstUpgradeHinted = true;
        const firstCard = document.querySelector('.upg-card');
        if (firstCard) {
          firstCard.classList.add('pulse-hint');
          addGuideArrow(firstCard);
        }
      }
    }
    if (to === 'screen-atlas') {
      document.getElementById('btn-atlas').classList.remove('unread');
      state.flags.atlasVisited = true;
      renderAtlas();
    }
    if (to === 'screen-boat') {
      document.getElementById('btn-boat').classList.remove('unread');
      state.flags.boatVisited = true;
      renderBoat();
      if (typeof updateBlenderUI === 'function') updateBlenderUI();
    }
    if (to === 'screen-catalog') {
      document.getElementById('btn-catalog').classList.remove('unread');
      renderCatalog();
    }
    if (to === 'screen-prestige') {
      renderPrestigeStore();
    }
    if (to === 'screen-achievements') {
      renderAchievements();
    }
  }, 180);
}

// ─── Travel animation ───

function travelToZone(zoneId) {
  // Can't travel while net cooldown is active
  if (state.netCooldown > 0) {
    cv.catchFlashes.push({
      x: canvasW / 2, y: canvasH / 2, timer: 2.0,
      text: `NET COOLDOWN: ${Math.ceil(state.netCooldown)}s`, color: '#ff4466',
    });
    return;
  }

  // Check if boss fight is needed (going to higher zone, boss not defeated, boss exists)
  const needsBoss = zoneId > state.currentZone && BOSSES[zoneId] && !state.bossesDefeated.includes(zoneId);

  // Block if boss needed but no harpoon
  if (needsBoss && state.upgrades.harpoon < 1) {
    cv.catchFlashes.push({
      x: canvasW / 2, y: canvasH / 2, timer: 2.0,
      text: 'HARPOON REQUIRED FOR BOSS FIGHT', color: '#ff4466',
    });
    return;
  }

  const overlay  = document.getElementById('travel-overlay');
  const depthEl  = document.getElementById('travel-depth');
  const labelEl  = document.getElementById('travel-label');
  const zone     = ZONES[zoneId];
  const fromD    = ZONES[state.currentZone].depth;
  const toD      = zone.depth;
  const goingDown = toD > fromD;

  labelEl.textContent = goingDown ? `DESCENDING TO ${zone.name}...` : `ASCENDING TO ${zone.name}...`;
  document.getElementById('travel-sub').textContent = goingDown ? 'PRESSURE RISING' : 'PRESSURE DROPPING';

  // Start crossfading back to main music during travel (keep atlas music for boss fights)
  if (!needsBoss) audio.switchMusic('main');

  let depth = fromD;
  depthEl.textContent = `${Math.round(depth)}m`;
  overlay.classList.add('active');

  const sign = goingDown ? 1 : -1;
  const timer = setInterval(() => {
    const diff = Math.abs(toD - depth);
    depth += sign * Math.max(1, diff * 0.045 + 1.5);
    if ((goingDown && depth >= toD) || (!goingDown && depth <= toD)) {
      depth = toD;
      depthEl.textContent = `${Math.round(depth)}m`;
      clearInterval(timer);

      if (needsBoss) {
        // Start boss fight — stay in current zone visually
        cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.spawnTimer = 9999;
        cv.placedNets = [];
        cv.harpoon = null;
        const bossData = BOSSES[zoneId];
        state.bossFight = {
          targetZone: zoneId,
          hp: bossData.hp,
          maxHp: bossData.hp,
          timer: 30,
          bossData: bossData,
          x: canvasW / 2,
          y: canvasH * 0.4,
          dir: -1,
          wobble: 0,
          hitFlash: 0,
        };
        // Force harpoon mode
        state.weaponMode = 'harpoon';
        updateWeaponToggle();
        setTimeout(() => {
          overlay.classList.remove('active');
          setTimeout(() => { switchScreen('screen-fishing'); }, 500);
        }, 800);
      } else {
        state.currentZone = zoneId;
        cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.spawnTimer = 0;
        if (cv.placedNets.length > 0) {
          state.netCooldown = 120;
        }
        cv.placedNets = [];
        updateZoneOverlay();
        setTimeout(() => {
          overlay.classList.remove('active');
          setTimeout(() => { switchScreen('screen-fishing'); flashZoneOverlay(); }, 500);
        }, 800);
      }
    } else {
      depthEl.textContent = `${Math.round(depth)}m`;
    }
  }, 28);
}

function updateWeaponToggle() {
  const toggle = document.getElementById('weapon-toggle');
  if (state.upgrades.harpoon >= 1) toggle.style.display = 'flex';
  document.getElementById('btn-weapon-rod').classList.toggle('weapon-active', state.weaponMode === 'rod');
  document.getElementById('btn-weapon-harpoon').classList.toggle('weapon-active', state.weaponMode === 'harpoon');
}

// ═══════════════════════════════════════════════════════════════
//  SHOP RENDERING
// ═══════════════════════════════════════════════════════════════

function renderShop() {
  renderInventory();
  updateSellAllBtn();
  renderFishmongerArt();
}

function renderFishmongerArt() {
  const container = document.getElementById('fishmonger-art');
  if (!container) return;
  container.innerHTML = '';
  const shopRight = document.getElementById('shop-right');
  const artH = Math.max(500, shopRight.clientHeight || 600);
  const W = 380;
  const cx = W / 2;
  const c = document.createElement('canvas');
  c.width = W; c.height = artH;
  container.appendChild(c);
  const x = c.getContext('2d');

  x.fillStyle = '#010a04';
  x.fillRect(0, 0, W, artH);

  const counterY = 310;
  x.fillStyle = '#0a1a0a';
  x.fillRect(10, counterY, W - 20, 60);
  x.strokeStyle = '#00cc8844';
  x.lineWidth = 1;
  x.strokeRect(10, counterY, W - 20, 60);
  x.fillStyle = '#0e2a12';
  x.fillRect(12, counterY + 2, W - 24, 5);

  x.fillStyle = '#061208';
  x.fillRect(cx - 50, 160, 100, 150);

  x.fillStyle = '#0a2a10';
  x.fillRect(cx - 42, 210, 84, 100);
  x.strokeStyle = '#00885544';
  x.strokeRect(cx - 42, 210, 84, 100);

  x.fillStyle = '#0c1e0c';
  x.beginPath();
  x.arc(cx, 140, 42, 0, Math.PI * 2);
  x.fill();

  x.fillStyle = '#00ff88';
  x.shadowColor = '#00ff88';
  x.shadowBlur = 12;
  x.beginPath(); x.arc(cx - 14, 135, 4.5, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(cx + 14, 135, 4.5, 0, Math.PI * 2); x.fill();
  x.shadowBlur = 0;

  x.fillStyle = '#00886644';
  x.fillRect(cx - 44, 102, 88, 16);

  x.fillStyle = '#061208';
  x.fillRect(cx - 80, 220, 32, 85);
  x.fillRect(cx + 48, 220, 32, 85);

  x.fillStyle = '#0c1e0c';
  x.beginPath(); x.arc(cx - 64, counterY - 4, 14, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(cx + 64, counterY - 4, 14, 0, Math.PI * 2); x.fill();

  const fishColors = ['#00cc66', '#88ccff', '#ff4466', '#cc44ff', '#ffcc44'];
  const fishXs = [50, 120, 190, 260, 330];
  for (let i = 0; i < 5; i++) {
    const fy = 45 + Math.sin(i * 1.5) * 12;
    x.strokeStyle = '#004422';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(fishXs[i], 8); x.lineTo(fishXs[i], fy); x.stroke();
    x.strokeStyle = '#00885544';
    x.beginPath(); x.arc(fishXs[i], fy + 5, 5, 0, Math.PI); x.stroke();
    x.fillStyle = fishColors[i];
    x.shadowColor = fishColors[i];
    x.shadowBlur = 8;
    x.beginPath();
    x.ellipse(fishXs[i], fy + 22, 18, 9, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(fishXs[i] - 16, fy + 22);
    x.lineTo(fishXs[i] - 28, fy + 12);
    x.lineTo(fishXs[i] - 28, fy + 32);
    x.closePath();
    x.fill();
    x.shadowBlur = 0;
    x.fillStyle = '#000';
    x.beginPath(); x.arc(fishXs[i] + 8, fy + 19, 2.5, 0, Math.PI * 2); x.fill();
  }

  x.strokeStyle = '#003a20';
  x.lineWidth = 1;
  x.beginPath(); x.moveTo(20, 90); x.lineTo(W - 20, 90); x.stroke();

  x.fillStyle = '#001a0a';
  for (const jx of [40, 100, 280, 340]) {
    x.fillRect(jx - 10, 68, 20, 22);
    x.strokeStyle = '#00cc6622';
    x.strokeRect(jx - 10, 68, 20, 22);
  }

  x.fillStyle = '#060e06';
  x.fillRect(0, counterY + 60, W, artH - counterY - 60);
  x.strokeStyle = '#003a20';
  x.lineWidth = 0.5;
  for (let lx = 0; lx < W; lx += 45) {
    x.beginPath(); x.moveTo(lx, counterY + 60); x.lineTo(lx, artH); x.stroke();
  }

  x.fillStyle = 'rgba(0,204,221,0.06)';
  x.fillRect(10, counterY - 2, W - 20, 4);
}

function drawInventoryFish(canvas, typeId, isGolden) {
  const fCtx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const def = FISH[typeId];
  if (!def) return;
  const rc = RARITY_COLORS[def.rarity];
  const sz = Math.min(def.size, 20) * 3;

  // Golden aura
  if (isGolden) {
    fCtx.save();
    fCtx.globalAlpha = 0.2;
    fCtx.fillStyle = '#ffee44';
    fCtx.shadowColor = '#ffee44';
    fCtx.shadowBlur = 30;
    fCtx.beginPath();
    fCtx.arc(cx, cy, sz * 2, 0, Math.PI * 2);
    fCtx.fill();
    fCtx.restore();
  }

  fCtx.save();
  fCtx.translate(cx, cy);

  const shape = def.shape || 'fish';
  fCtx.shadowColor = rc.glow;
  fCtx.shadowBlur = 10;
  fCtx.fillStyle = rc.color;

  if (shape === 'eel') {
    fCtx.strokeStyle = rc.color;
    fCtx.lineWidth = sz * 0.3;
    fCtx.lineCap = 'round';
    fCtx.beginPath();
    fCtx.moveTo(sz, 0);
    for (let i = 1; i <= 6; i++) {
      const p = i / 6;
      fCtx.lineTo(sz - sz * 2 * p, Math.sin(p * 4) * sz * 0.4 * p);
    }
    fCtx.stroke();
    fCtx.shadowBlur = 0;
    fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.8, -sz * 0.1, sz * 0.08, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'shark') {
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 1.2, sz * 0.35, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath();
    fCtx.moveTo(-sz, 0); fCtx.lineTo(-sz * 1.6, -sz * 0.5); fCtx.lineTo(-sz * 1.2, 0);
    fCtx.lineTo(-sz * 1.6, sz * 0.5); fCtx.closePath(); fCtx.fill();
    fCtx.beginPath();
    fCtx.moveTo(-sz * 0.1, -sz * 0.35); fCtx.lineTo(sz * 0.3, -sz * 0.9); fCtx.lineTo(sz * 0.6, -sz * 0.35);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.6, -sz * 0.08, sz * 0.06, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'blob') {
    fCtx.beginPath(); fCtx.arc(0, 0, sz * 0.8, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath();
    fCtx.moveTo(-sz * 0.7, 0); fCtx.lineTo(-sz * 1.2, -sz * 0.4); fCtx.lineTo(-sz * 1.2, sz * 0.4);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.2, -sz * 0.2, sz * 0.06, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath(); fCtx.arc(sz * 0.45, sz * 0.05, sz * 0.06, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'flat') {
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 1.1, sz * 0.2, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath();
    fCtx.moveTo(-sz, 0); fCtx.lineTo(-sz * 1.5, -sz * 0.45); fCtx.lineTo(-sz * 1.5, sz * 0.45);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.6, -sz * 0.04, sz * 0.06, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'slim') {
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 1.0, sz * 0.22, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath();
    fCtx.moveTo(-sz * 0.9, 0); fCtx.lineTo(-sz * 1.5, -sz * 0.3); fCtx.lineTo(-sz * 1.5, sz * 0.3);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.55, 0, sz * 0.08, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'jaw') {
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 0.8, sz * 0.4, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.fillStyle = '#000500';
    fCtx.beginPath(); fCtx.ellipse(sz * 0.4, sz * 0.15, sz * 0.4, sz * 0.2, 0.3, 0, Math.PI * 2); fCtx.fill();
    fCtx.fillStyle = rc.color;
    fCtx.beginPath();
    fCtx.moveTo(-sz * 0.6, 0); fCtx.lineTo(-sz * 1.2, -sz * 0.4); fCtx.lineTo(-sz * 1.2, sz * 0.4);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.05, -sz * 0.2, sz * 0.1, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'crab') {
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 0.8, sz * 0.5, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.strokeStyle = rc.color; fCtx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const lx = -sz * 0.3 + i * sz * 0.3;
      fCtx.beginPath(); fCtx.moveTo(lx, sz * 0.3); fCtx.lineTo(lx - 3, sz * 0.7); fCtx.stroke();
      fCtx.beginPath(); fCtx.moveTo(lx, -sz * 0.3); fCtx.lineTo(lx - 3, -sz * 0.7); fCtx.stroke();
    }
    fCtx.beginPath(); fCtx.ellipse(sz * 0.7, -sz * 0.3, sz * 0.22, sz * 0.15, -0.3, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath(); fCtx.ellipse(sz * 0.7, sz * 0.3, sz * 0.22, sz * 0.15, 0.3, 0, Math.PI * 2); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.2, -sz * 0.15, sz * 0.05, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath(); fCtx.arc(sz * 0.2, sz * 0.15, sz * 0.05, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'clown') {
    fCtx.fillStyle = '#ff8833';
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 0.8, sz * 0.4, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.fillStyle = '#ffffff'; fCtx.globalAlpha = 0.6;
    fCtx.fillRect(-sz * 0.08, -sz * 0.4, sz * 0.1, sz * 0.8);
    fCtx.globalAlpha = 1;
    fCtx.fillStyle = '#ff6622';
    fCtx.beginPath();
    fCtx.moveTo(-sz * 0.65, 0); fCtx.lineTo(-sz * 1.1, -sz * 0.35); fCtx.lineTo(-sz * 1.1, sz * 0.35);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = '#fff';
    fCtx.beginPath(); fCtx.arc(sz * 0.38, -sz * 0.08, sz * 0.05, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'puffer') {
    fCtx.beginPath(); fCtx.arc(0, 0, sz * 0.7, 0, Math.PI * 2); fCtx.fill();
    fCtx.strokeStyle = rc.color; fCtx.lineWidth = 1;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
      fCtx.beginPath();
      fCtx.moveTo(Math.cos(a) * sz * 0.6, Math.sin(a) * sz * 0.6);
      fCtx.lineTo(Math.cos(a) * sz * 0.95, Math.sin(a) * sz * 0.95);
      fCtx.stroke();
    }
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.28, -sz * 0.15, sz * 0.06, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'jellyfish') {
    fCtx.globalAlpha = 0.6;
    fCtx.beginPath(); fCtx.ellipse(0, -sz * 0.1, sz * 0.7, sz * 0.5, 0, Math.PI, 0); fCtx.fill();
    fCtx.globalAlpha = 1;
    fCtx.strokeStyle = rc.color; fCtx.lineWidth = 1; fCtx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const tx = (i - 1.5) * sz * 0.3;
      fCtx.beginPath(); fCtx.moveTo(tx, 0);
      fCtx.quadraticCurveTo(tx + Math.sin(i) * 5, sz * 0.35, tx + Math.sin(i) * 8, sz * 0.7);
      fCtx.stroke();
    }
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(-sz * 0.15, -sz * 0.15, sz * 0.04, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath(); fCtx.arc(sz * 0.15, -sz * 0.15, sz * 0.04, 0, Math.PI * 2); fCtx.fill();
  } else if (shape === 'angler') {
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz * 0.9, sz * 0.45, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.fillStyle = '#000500';
    fCtx.beginPath(); fCtx.ellipse(sz * 0.45, sz * 0.08, sz * 0.45, sz * 0.3, 0.2, 0, Math.PI * 2); fCtx.fill();
    fCtx.fillStyle = '#fff'; fCtx.shadowColor = '#fff'; fCtx.shadowBlur = 15;
    fCtx.beginPath(); fCtx.arc(sz * 0.2, -sz * 0.6, 3, 0, Math.PI * 2); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.05, -sz * 0.15, sz * 0.08, 0, Math.PI * 2); fCtx.fill();
  } else {
    // Default fish shape
    fCtx.beginPath(); fCtx.ellipse(0, 0, sz, sz * 0.4, 0, 0, Math.PI * 2); fCtx.fill();
    fCtx.beginPath();
    fCtx.moveTo(-sz * 0.8, 0); fCtx.lineTo(-sz * 1.4, -sz * 0.4); fCtx.lineTo(-sz * 1.4, sz * 0.4);
    fCtx.closePath(); fCtx.fill();
    fCtx.shadowBlur = 0; fCtx.fillStyle = rc.eye;
    fCtx.beginPath(); fCtx.arc(sz * 0.4, -sz * 0.08, sz * 0.06, 0, Math.PI * 2); fCtx.fill();
  }

  fCtx.restore();
}

function renderInventory() {
  const el = document.getElementById('inventory-grid');
  el.innerHTML = '';

  const entries = Object.entries(state.inventory)
    .filter(([id, c]) => c > 0 && !id.startsWith('golden_'))
    .sort(([a], [b]) => RARITY_ORDER[FISH[a].rarity] - RARITY_ORDER[FISH[b].rarity]);

  const goldenEntries = Object.entries(state.inventory)
    .filter(([id, c]) => c > 0 && id.startsWith('golden_'))
    .sort(([a], [b]) => {
      const aBase = a.replace('golden_', ''), bBase = b.replace('golden_', '');
      return RARITY_ORDER[FISH[aBase].rarity] - RARITY_ORDER[FISH[bBase].rarity];
    });

  if (!entries.length && !goldenEntries.length) {
    el.innerHTML = '<div class="inv-empty">// FISH HOLD EMPTY</div>';
    return;
  }

  // Golden fish first (special display)
  for (const [goldenId, count] of goldenEntries) {
    const baseId = goldenId.replace('golden_', '');
    const def = FISH[baseId]; if (!def) continue;
    const goldValue = def.goldValue * 10;
    const total = count * goldValue;

    const card = document.createElement('div');
    card.className = 'inv-card rarity-golden';
    card.innerHTML = `
      <div class="inv-card-top">
        <div class="inv-card-top-left">
          <div class="inv-fish-name" style="color:#ffcc44">★ ${def.name}</div>
          <div class="inv-rarity-tag" style="color:#ffcc44">GOLDEN</div>
        </div>
        <div class="inv-card-top-right">
          <button class="sell-btn" data-type="${goldenId}">SELL ALL</button>
          <div class="inv-value" style="color:#ffcc44">${goldValue}✧ each · = ${total}✧</div>
        </div>
      </div>
      <div class="inv-card-fish"><canvas class="inv-fish-canvas" width="360" height="120"></canvas></div>
      <div class="inv-card-bottom">
        <div class="inv-count" style="color:#ffcc44">${count}</div>
        <div class="inv-fish-desc">${def.desc || ''}</div>
      </div>
    `;
    card.querySelector('.sell-btn').addEventListener('click', () => sellGoldenFish(goldenId));
    const fishCanvas = card.querySelector('.inv-fish-canvas');
    drawInventoryFish(fishCanvas, baseId, true);
    el.appendChild(card);
  }

  for (const [typeId, count] of entries) {
    const def   = FISH[typeId]; if (!def) continue;
    const total = count * def.goldValue;
    const rar   = def.rarity.toLowerCase();

    const card = document.createElement('div');
    card.className = `inv-card rarity-${rar}`;
    card.innerHTML = `
      <div class="inv-card-top">
        <div class="inv-card-top-left">
          <div class="inv-fish-name">${def.name}</div>
          <div class="inv-rarity-tag">${def.rarity}</div>
        </div>
        <div class="inv-card-top-right">
          <button class="sell-btn" data-type="${typeId}">SELL ALL</button>
          <div class="inv-value">${def.goldValue}✧ each · = ${total}✧</div>
        </div>
      </div>
      <div class="inv-card-fish"><canvas class="inv-fish-canvas" width="360" height="120"></canvas></div>
      <div class="inv-card-bottom">
        <div class="inv-count">${count}</div>
        <div class="inv-fish-desc">${def.desc || ''}</div>
      </div>
    `;
    card.querySelector('.sell-btn').addEventListener('click', () => sellFish(typeId));
    const fishCanvas = card.querySelector('.inv-fish-canvas');
    drawInventoryFish(fishCanvas, typeId, false);
    el.appendChild(card);
  }
}

function updateSellAllBtn() {
  const btn = document.getElementById('btn-sell-all');
  btn.style.display = '';
  const mult = (state.sellMultiplier || 1) * getGoldMultiplier();
  const total = Math.ceil(Object.entries(state.inventory)
    .reduce((s, [id, q]) => {
      if (id.startsWith('golden_')) {
        const baseId = id.replace('golden_', '');
        return s + q * (FISH[baseId]?.goldValue || 0) * 10 * mult;
      }
      return s + q * (FISH[id]?.goldValue || 0) * mult;
    }, 0));
  const boonTag = (state.sellMultiplier || 1) > 1 ? ` (${state.sellMultiplier}x!)` : '';
  btn.textContent = total > 0 ? `[ SELL ALL — ${total}✧${boonTag} ]` : '[ SELL ALL ]';
  if (!state.flags.sellAllUsed && total > 0) {
    btn.classList.add('pulse-hint');
  } else {
    btn.classList.remove('pulse-hint');
  }
}

// ═══════════════════════════════════════════════════════════════
//  CONSUMABLES SIDEBAR
// ═══════════════════════════════════════════════════════════════

function buyConsumable(id) {
  const def = CONSUMABLES_MAP[id];
  if (!def || state.gold < def.cost) return;
  state.gold -= def.cost;
  state.consumables[id] = (state.consumables[id] || 0) + 1;
  state.flags.consumableBought = true;
  audio.play('upgrade');
  updateAllGoldDisplays();
  renderUpgrades();
  renderConsumablesPanel();
}

function renderConsumablesPanel() {
  const bar = document.getElementById('consumables-bar');
  if (!bar) return;
  bar.innerHTML = '';
  let anyOwned = false;
  for (const def of CONSUMABLES_DEF) {
    const owned = state.consumables[def.id] || 0;
    if (owned <= 0) continue;
    anyOwned = true;
    const isActive = state.activeConsumable === def.id;
    const btn = document.createElement('button');
    btn.className = `consumable-nav-btn${isActive ? ' active' : ''}`;
    btn.title = def.name;
    const iconChar = def.id === 'small_net' ? 'S' : (def.id === 'big_net' ? 'B' : 'BF');
    btn.innerHTML = `<span class="consumable-nav-icon">${iconChar}</span>${owned > 0 ? `<span class="consumable-nav-count">${owned}x</span>` : ''}`;
    btn.addEventListener('click', () => {
      if (def.id === 'black_fish_bait') {
        // Immediate use: spawn a black fish
        if ((state.consumables.black_fish_bait || 0) <= 0) return;
        state.consumables.black_fish_bait--;
        const bf = cv.blackFish;
        bf.active = true;
        bf.phase = 'fading_in';
        bf.phaseTimer = 3;
        bf.x = 0.15 + Math.random() * 0.7;
        bf.y = 0.15 + Math.random() * 0.55;
        bf.dir = Math.random() < 0.5 ? 1 : -1;
        bf.wobbleOffset = Math.random() * Math.PI * 2;
        bf.alpha = 0;
        cv.catchFlashes.push({ x: bf.x * canvasW, y: bf.y * canvasH, timer: 1.6, text: 'BLACK FISH SUMMONED!', color: '#aa44ff' });
        renderConsumablesPanel();
        return;
      }
      state.activeConsumable = (state.activeConsumable === def.id) ? null : def.id;
      renderConsumablesPanel();
    });
    bar.appendChild(btn);
  }
  if (anyOwned) {
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════
//  UPGRADES RENDERING — SKILL TREE
// ═══════════════════════════════════════════════════════════════

let activeUpgradeTab = 0;

function getCategoryState(catName) {
  const caught = state.stats.totalCaught || 0;
  const T = PROGRESSION_THRESHOLDS;
  switch (catName) {
    case 'LINE CONTROL':  return { visible: true, unlocked: true };
    case 'AUTOMATION':    return { visible: true, unlocked: caught >= T.AUTOMATION, threshold: T.AUTOMATION };
    case 'ABILITIES':     return { visible: true, unlocked: caught >= T.ABILITIES, threshold: T.ABILITIES };
    case 'NAVIGATION':    return { visible: true, unlocked: caught >= T.NAVIGATION, threshold: T.NAVIGATION };
    case 'BLACK FISH':    return { visible: true, unlocked: caught >= T.BLACK_FISH, threshold: T.BLACK_FISH };
    case 'HARPOON':       return { visible: true, unlocked: caught >= T.AUTOMATION, threshold: T.AUTOMATION };
    case 'CONSUMABLES':   return { visible: true, unlocked: caught >= T.CONSUMABLES, threshold: T.CONSUMABLES };
    default: return { visible: false, unlocked: false };
  }
}

function getVisibleCategories() {
  return UPGRADE_CATEGORIES.filter(cat => getCategoryState(cat.name).visible);
}

function getUpgradeTier(level) {
  if (level >= 10) return 5;
  if (level >= 8) return 4;
  if (level >= 6) return 3;
  if (level >= 4) return 2;
  if (level >= 2) return 1;
  return 0;
}

function getChildren(parentId) {
  return UPGRADES_DEF.filter(d => d.parent === parentId);
}

function getLuckBoostDesc(def) {
  const pool = getSpawnPool(state.currentZone);
  const totals = { COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
  let totalWeight = 0;
  for (let i = 0; i < pool.fish.length; i++) {
    const r = FISH[pool.fish[i]].rarity;
    totals[r] += pool.weights[i];
    totalWeight += pool.weights[i];
  }
  const pct = (r) => totalWeight > 0 ? (totals[r] / totalWeight * 100).toFixed(1) : '0';
  return `COM ${pct('COMMON')}% · UNC ${pct('UNCOMMON')}% · RARE ${pct('RARE')}% · EPIC ${pct('EPIC')}% · LEG ${pct('LEGENDARY')}%`;
}

function buildTreeNode(id, isRoot) {
  const def = UPGRADES_MAP[id];
  const owned = state.upgrades[id] || 0;
  const effMax = getEffectiveMax(id);
  const maxed = owned >= effMax;
  const parentDef = def.parent ? UPGRADES_MAP[def.parent] : null;
  // Tier nodes require parent maxed; other children just need parent >= 1
  const isTierChild = parentDef && def.tierOf && parentDef.tierOf === def.tierOf;
  const isLocked = parentDef && (isTierChild
    ? (state.upgrades[def.parent] || 0) < getEffectiveMax(def.parent)
    : (state.upgrades[def.parent] || 0) < 1);
  const cost = upgradeCost(id);
  const canBuy = !isLocked && !maxed && state.gold >= cost;
  const tier = getUpgradeTier(owned);
  const children = getChildren(id);

  const li = document.createElement('li');
  if (isLocked) li.classList.add('tree-locked');

  const node = document.createElement('div');
  node.className = `tree-node${isRoot ? ' tree-root' : ''}${maxed ? ' tree-maxed' : ''}${canBuy ? ' tree-can-buy' : ''}${isLocked ? ' tree-node-locked' : ''}`;
  if (tier > 0) node.setAttribute('data-tier', tier);

  let descHtml = def.desc;
  if (id.startsWith('luck_boost')) descHtml += `<br><span class="tree-rates">${getLuckBoostDesc(def)}</span>`;
  if (id.startsWith('gold_boost') && getUpgradeLevel('gold_boost') > 0) descHtml += `<br><span class="tree-rates">TOTAL: +${getUpgradeLevel('gold_boost') * 5}%</span>`;

  if (isLocked) {
    const parentName = UPGRADES_MAP[def.parent].name;
    node.innerHTML = `
      <div class="tree-node-name">${def.name}</div>
      <div class="tree-node-desc-small">${descHtml}</div>
      <div class="tree-node-lock">REQUIRES ${parentName}</div>
    `;
  } else if (maxed) {
    node.innerHTML = `
      <div class="tree-node-name">${def.name}</div>
      <div class="tree-node-desc">${descHtml}</div>
      <div class="tree-node-level">${owned} / ${effMax}</div>
      <div class="tree-node-max">MAX</div>
    `;
  } else {
    node.innerHTML = `
      <div class="tree-node-name">${def.name}</div>
      ${isRoot ? `<div class="tree-node-desc">${descHtml}</div>` : `<div class="tree-node-desc-small">${descHtml}</div>`}
      <div class="tree-node-level">${owned} / ${effMax}</div>
      <button class="tree-node-btn" ${canBuy ? '' : 'disabled'}>${cost === 0 ? 'FREE' : fmt(cost) + '✧'}</button>
    `;
    const btn = node.querySelector('.tree-node-btn');
    if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); buyUpgrade(id); });
  }

  li.appendChild(node);

  // Render children if this node is visible (show one level ahead)
  if (children.length > 0 && !isLocked) {
    const ul = document.createElement('ul');
    for (const child of children) {
      ul.appendChild(buildTreeNode(child.id, false));
    }
    li.appendChild(ul);
  }

  return li;
}

let _previousVisibleTabNames = null;

function renderUpgradeTabs() {
  const tabsEl = document.getElementById('upgrades-tabs');
  tabsEl.innerHTML = '';
  const visibleCats = getVisibleCategories();
  if (!visibleCats.length) return;
  if (activeUpgradeTab >= visibleCats.length) activeUpgradeTab = 0;

  const currentNames = visibleCats.map(c => c.name);
  const newTabs = _previousVisibleTabNames
    ? currentNames.filter(n => !_previousVisibleTabNames.includes(n))
    : [];
  _previousVisibleTabNames = currentNames;

  visibleCats.forEach((cat, i) => {
    const catState = getCategoryState(cat.name);
    const btn = document.createElement('button');
    const isNew = newTabs.includes(cat.name);
    const isLocked = !catState.unlocked;
    btn.className = `upg-tab${i === activeUpgradeTab && !isLocked ? ' active' : ''}${isNew && !isLocked ? ' tab-new' : ''}${isLocked ? ' tab-locked' : ''}`;
    if (isLocked) {
      const caught = state.stats.totalCaught || 0;
      btn.textContent = `${cat.name} (${caught}/${catState.threshold})`;
      btn.disabled = true;
    } else {
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        btn.classList.remove('tab-new');
        activeUpgradeTab = i;
        renderUpgrades();
      });
    }
    if (isNew && !isLocked) btn.classList.add('pulse-hint');
    tabsEl.appendChild(btn);
  });
}

function renderUpgrades() {
  renderUpgradeTabs();
  const el = document.getElementById('upgrades-grid');
  el.innerHTML = '';

  const visibleCats = getVisibleCategories();
  if (!visibleCats.length) {
    el.innerHTML = '<div class="upg-empty">// NO UPGRADES AVAILABLE YET</div>';
    return;
  }

  let cat = visibleCats[activeUpgradeTab] || visibleCats[0];
  const catState = getCategoryState(cat.name);
  if (!catState.unlocked) {
    const firstUnlocked = visibleCats.findIndex(c => getCategoryState(c.name).unlocked);
    if (firstUnlocked >= 0) {
      activeUpgradeTab = firstUnlocked;
      cat = visibleCats[activeUpgradeTab];
    } else {
      el.innerHTML = '<div class="upg-empty">// NO UPGRADES AVAILABLE YET</div>';
      return;
    }
  }

  // Consumables: flat grid, not a tree
  if (cat.special === 'consumables') {
    const catDiv = document.createElement('div');
    catDiv.className = 'upg-category';
    const header = document.createElement('div');
    header.className = 'upg-category-header';
    header.textContent = 'CONSUMABLES — single-use items';
    catDiv.appendChild(header);
    const grid = document.createElement('div');
    grid.className = 'upg-category-grid';
    for (const def of CONSUMABLES_DEF) {
      const owned = state.consumables[def.id] || 0;
      const canBuy = state.gold >= def.cost;
      const card = document.createElement('div');
      card.className = `upg-card${canBuy ? ' can-buy' : ''}`;
      card.innerHTML = `
        <div class="upg-card-top">
          <div class="upg-name">${def.name}</div>
          <div class="upg-desc">${def.desc}</div>
        </div>
        <div class="upg-card-bottom">
          <div class="upg-level">owned: ${owned}</div>
          <button class="upg-btn" data-id="${def.id}" ${canBuy ? '' : 'disabled'}>${fmt(def.cost)}✧ each</button>
        </div>
      `;
      card.querySelector('.upg-btn').addEventListener('click', () => buyConsumable(def.id));
      grid.appendChild(card);
    }
    catDiv.appendChild(grid);
    el.appendChild(catDiv);
    return;
  }

  // Skill tree rendering
  const treeContainer = document.createElement('div');
  treeContainer.className = 'skill-trees';

  for (const rootId of cat.roots) {
    const tree = document.createElement('ul');
    tree.className = 'skill-tree';
    tree.appendChild(buildTreeNode(rootId, true));
    treeContainer.appendChild(tree);
  }

  el.appendChild(treeContainer);
}

// ═══════════════════════════════════════════════════════════════
//  ATLAS RENDERING
// ═══════════════════════════════════════════════════════════════

// Item 10: zone colors, only zones 0-3, item 17: much bigger font
function renderAtlas() {
  const el = document.getElementById('atlas-chart');
  el.innerHTML = '';

  // Net cooldown warning
  if (state.netCooldown > 0) {
    const warning = document.createElement('div');
    warning.className = 'atlas-cooldown-warning';
    warning.textContent = `NET COOLDOWN: ${Math.ceil(state.netCooldown)}s — Cannot travel while cooldown is active.`;
    el.appendChild(warning);
  }

  let lastTier = '';
  for (let i = 0; i < ZONES.length; i++) {
    const zone     = ZONES[i];

    // Tier separator
    if (zone.tier !== lastTier) {
      lastTier = zone.tier;
      const tierDiv = document.createElement('div');
      tierDiv.className = 'atlas-tier-label';
      tierDiv.textContent = `── ${zone.tier} ZONES ──`;
      el.appendChild(tierDiv);
    }

    const zoneId   = zone.id;
    const unlocked = state.unlockedZones.includes(zoneId);
    const isCur    = state.currentZone === zoneId;
    const prevUnlocked = zoneId === 0 || state.unlockedZones.includes(zoneId - 1);
    const canBuy   = !unlocked && zone.unlockCost && state.gold >= zone.unlockCost && zone.implemented && prevUnlocked;

    const nodeDiv = document.createElement('div');
    nodeDiv.className = `atlas-node ${isCur ? 'current' : unlocked ? 'visited' : 'locked'}`;

    const nameRevealed = (unlocked || isCur) || (zone.unlockCost && state.gold >= zone.unlockCost * 0.8) || (zoneId > 0 && state.unlockedZones.includes(zoneId - 1));

    let actionBlock = '';
    if (isCur && state.bossFight) {
      actionBlock = `<div class="atlas-here-label">[ YOU ARE HERE ]</div><button class="descend-btn atlas-retreat-btn" data-zone="${zoneId}">⚓ RETREAT HERE</button>`;
    } else if (isCur) {
      actionBlock = `<div class="atlas-here-label">[ YOU ARE HERE ]</div>`;
    } else if (unlocked) {
      const bossNeeded = zoneId > state.currentZone && BOSSES[zoneId] && !state.bossesDefeated.includes(zoneId);
      const hasHarpoon = state.upgrades.harpoon >= 1;
      if (bossNeeded && !hasHarpoon) {
        actionBlock = `<button class="descend-btn" data-zone="${zoneId}">TRAVEL HERE</button><div class="atlas-boss-warn">⚔ BOSS FIGHT — HARPOON REQUIRED</div>`;
      } else if (bossNeeded) {
        actionBlock = `<button class="descend-btn" data-zone="${zoneId}">TRAVEL HERE</button><div class="atlas-boss-warn">⚔ BOSS: ${BOSSES[zoneId].name}</div>`;
      } else {
        actionBlock = `<button class="descend-btn" data-zone="${zoneId}">TRAVEL HERE</button>`;
      }
    } else if (!prevUnlocked) {
      actionBlock = `<div class="atlas-lock-info">[ UNLOCK PREVIOUS ZONE FIRST ]</div>`;
    } else if (zone.implemented) {
      actionBlock = `
        <div class="atlas-lock-info">Requires <strong>${fmt(zone.unlockCost)}✧</strong> to unlock · you have <strong>${fmt(Math.floor(state.gold))}✧</strong></div>
        <button class="descend-btn" data-zone="${zoneId}" ${canBuy ? '' : 'disabled'}>DESCEND — ${fmt(zone.unlockCost)}✧</button>
      `;
    } else {
      actionBlock = `<div class="atlas-lock-info">[ NOT YET CHARTED ]</div>`;
    }

    // Item 10: per-zone color
    const zoneColor = zone.color || '#00cc88';

    nodeDiv.innerHTML = `
      <div class="atlas-node-left">
        <div class="atlas-dot" style="border-color:${isCur ? zoneColor : ''}; ${isCur ? `background:${zoneColor}` : unlocked ? `background:${zoneColor}55` : ''}"></div>
        ${i < ZONES.length - 1 ? '<div class="atlas-connector-line"></div>' : ''}
      </div>
      <div class="atlas-node-right">
        <div class="atlas-zone-id">${zone.code}</div>
        <div class="atlas-zone-name${nameRevealed && !unlocked && !isCur ? ' atlas-name-preview' : ''}" style="color:${unlocked || isCur ? zoneColor : ''}">${nameRevealed ? zone.name : '???'}</div>
        <div class="atlas-zone-depth">~${zone.depth}m depth</div>
        ${actionBlock}
      </div>
    `;

    el.appendChild(nodeDiv);

    if (i < ZONES.length - 1) {
      const conn = document.createElement('div');
      conn.className = 'atlas-connector';
      const diff = ZONES[i + 1].depth - zone.depth;
      conn.innerHTML = `
        <div style="width:2px;height:28px;background:var(--border);margin-left:11px"></div>
        <div class="atlas-connector-label">+${diff}m</div>
      `;
      el.appendChild(conn);
    }

    const retreatBtn = nodeDiv.querySelector('.atlas-retreat-btn');
    if (retreatBtn) {
      retreatBtn.addEventListener('click', () => {
        // Cancel boss fight, return to current zone
        state.bossFight = null;
        cv.harpoon = null;
        state.weaponMode = 'rod';
        updateWeaponToggle();
        cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.spawnTimer = 0;
        switchScreen('screen-fishing');
        spawnFish(); spawnFish(); spawnFish();
        showBlackFishBanner('⚓ RETREATED', `Returned to ${ZONES[state.currentZone].name}`, '#ffcc44');
      });
    }
    const btn = nodeDiv.querySelector('.descend-btn:not(.atlas-retreat-btn)');
    if (btn) {
      const zId = parseInt(btn.dataset.zone);
      if (zId === 1 && canBuy) btn.classList.add('pulse-first');
      btn.addEventListener('click', () => {
        if (state.unlockedZones.includes(zId)) travelToZone(zId);
        else purchaseZone(zId);
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  BOAT RENDERING (item 20: show materials)
// ═══════════════════════════════════════════════════════════════

function renderBoat() {
  const el = document.getElementById('boat-settings');
  el.innerHTML = '';

  const hasRodSpeed = getUpgradeLevel('rod_speed') > 0;
  const hasMaterials = Object.values(state.materials).some(v => v > 0);

  if (!hasRodSpeed && !hasMaterials) {
    el.innerHTML = '<div class="boat-empty">// NOTHING INSTALLED YET<br><br>Purchase FASTER ROD from Upgrades<br>to unlock cast speed tuning.</div>';
    return;
  }

  if (hasRodSpeed) {
    const header = document.createElement('div');
    header.className = 'boat-section-header';
    header.textContent = 'ROD CONFIGURATION';
    el.appendChild(header);

    const rodLvl = getUpgradeLevel('rod_speed');
    const maxPct = 100 + rodLvl * 6;
    const minPct = Math.round((150 / (450 * (1 + rodLvl * 0.06))) * 100);
    const curPct = Math.round(state.boatSettings.rodSpeedFactor * 100);

    const setting = document.createElement('div');
    setting.className = 'boat-setting';
    setting.innerHTML = `
      <div class="boat-setting-label">CAST SPEED</div>
      <div class="boat-setting-desc">Adjust your rod's cast speed. Lower speeds give more control. Max speed scales with FASTER ROD level (currently ${maxPct}%).</div>
      <div class="boat-slider-row">
        <input type="range" class="boat-slider" id="slider-rod-speed"
          min="${minPct}" max="100" step="1" value="${curPct}">
        <span class="boat-slider-val" id="rod-speed-val">${curPct}%</span>
      </div>
      <div class="boat-slider-labels">
        <span>SLOW (${minPct}%)</span><span>FAST (100%)</span>
      </div>
    `;
    el.appendChild(setting);

    setting.querySelector('#slider-rod-speed').addEventListener('input', (e) => {
      const v = parseInt(e.target.value);
      state.boatSettings.rodSpeedFactor = v / 100;
      setting.querySelector('#rod-speed-val').textContent = `${v}%`;
    });
  }

  // Item 20: Materials display
  if (hasMaterials) {
    const matHeader = document.createElement('div');
    matHeader.className = 'boat-section-header';
    matHeader.textContent = 'MATERIALS';
    matHeader.style.marginTop = '28px';
    el.appendChild(matHeader);

    const matGrid = document.createElement('div');
    matGrid.className = 'materials-grid';
    for (const [matId, mat] of Object.entries(MATERIALS)) {
      const count = state.materials[matId] || 0;
      if (count <= 0) continue;
      const matCard = document.createElement('div');
      matCard.className = 'material-card';
      matCard.innerHTML = `
        <div class="material-name">${mat.name}</div>
        <div class="material-desc">${mat.desc}</div>
        <div class="material-count">×${count}</div>
      `;
      matGrid.appendChild(matCard);
    }
    el.appendChild(matGrid);
  }

}

// ═══════════════════════════════════════════════════════════════
//  CATALOG RENDERING
// ═══════════════════════════════════════════════════════════════

let catalogSort = 'rarity';

function renderCatalog() {
  const el = document.getElementById('catalog-content-inner');
  if (!el) return;
  el.innerHTML = '';

  const controls = document.createElement('div');
  controls.className = 'catalog-controls';
  controls.innerHTML = `
    <button class="catalog-sort-btn${catalogSort === 'rarity' ? ' active' : ''}" data-sort="rarity">SORT: RARITY</button>
    <button class="catalog-sort-btn${catalogSort === 'zone' ? ' active' : ''}" data-sort="zone">SORT: ZONE</button>
  `;
  controls.querySelectorAll('.catalog-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      catalogSort = btn.dataset.sort;
      renderCatalog();
    });
  });
  el.appendChild(controls);

  const allFish = Object.entries(FISH);
  let sorted;
  if (catalogSort === 'zone') {
    sorted = allFish.sort(([,a], [,b]) => a.zone - b.zone || RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
  } else {
    sorted = allFish.sort(([,a], [,b]) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || a.zone - b.zone);
  }

  const discovered = sorted.filter(([id]) => (state.catalogCaught[id] || 0) > 0).length;
  const summary = document.createElement('div');
  summary.className = 'catalog-summary';
  summary.textContent = `SPECIES DISCOVERED: ${discovered} / ${sorted.length}`;
  el.appendChild(summary);

  const grid = document.createElement('div');
  grid.className = 'catalog-grid';

  for (const [fishId, def] of sorted) {
    const caught = state.catalogCaught[fishId] || 0;
    const known = caught > 0;
    const rc = RARITY_COLORS[def.rarity];
    const zoneName = ZONES[def.zone]?.name || '???';

    const card = document.createElement('div');
    card.className = `catalog-card${known ? '' : ' catalog-unknown'} rarity-${def.rarity.toLowerCase()}`;
    card.innerHTML = known ? `
      <div class="catalog-card-header">
        <span class="catalog-fish-name" style="color:${rc.color}">${def.name}</span>
        <span class="catalog-rarity" style="color:${rc.color}">${def.rarity}</span>
      </div>
      <div class="catalog-card-body">
        <div class="catalog-desc">${def.desc}</div>
        <div class="catalog-meta">
          <span>${zoneName}</span>
          <span>${def.goldValue}✧</span>
          <span>caught: ${caught}</span>
        </div>
      </div>
    ` : `
      <div class="catalog-card-header">
        <span class="catalog-fish-name">???</span>
        <span class="catalog-rarity">${def.rarity}</span>
      </div>
      <div class="catalog-card-body">
        <div class="catalog-desc">[ NOT YET ENCOUNTERED ]</div>
        <div class="catalog-meta"><span>${zoneName}</span></div>
      </div>
    `;
    grid.appendChild(card);
  }

  el.appendChild(grid);
}

// ═══════════════════════════════════════════════════════════════
//  PRESTIGE SYSTEM
// ═══════════════════════════════════════════════════════════════

function updatePrestigeNavBtn() {
  const btn = document.getElementById('btn-prestige');
  if (!btn) return;
  const pearls = getPearlsForRun();
  const progress = (state.totalGoldEarned % 10000) / 10000;
  document.getElementById('prestige-nav-count').textContent = pearls;
  document.getElementById('prestige-nav-bar').style.width = (progress * 100) + '%';
}

function renderPrestigeStore() {
  const el = document.getElementById('prestige-tree');
  if (!el) return;
  el.innerHTML = '';
  document.getElementById('prestige-pearls').textContent = state.prestige.pearls;

  const tree = document.createElement('div');
  tree.className = 'prestige-tree-layout';

  const rootDef = PRESTIGE_UPGRADES_DEF[0]; // infinite_kelp
  const children = PRESTIGE_UPGRADES_DEF.filter(d => d.parent === 'infinite_kelp');

  // Render root node (center)
  const rootNode = createPrestigeNode(rootDef, 'prestige-root');
  tree.appendChild(rootNode);

  // Render children in a grid layout (too many for a ring now)
  const childContainer = document.createElement('div');
  childContainer.className = 'prestige-children-grid';

  children.forEach((def) => {
    const node = createPrestigeNode(def);
    childContainer.appendChild(node);
  });

  tree.appendChild(childContainer);
  el.appendChild(tree);
}

function createPrestigeNode(def, extraClass) {
  const level = state.prestige.upgrades[def.id] || 0;
  const maxed = level >= def.max;
  const cost = maxed ? null : prestigeUpgradeCost(def.id);
  const canAfford = !maxed && state.prestige.pearls >= cost;

  const parentDef = def.parent ? PRESTIGE_UPGRADES_MAP[def.parent] : null;
  const isLocked = parentDef && (state.prestige.upgrades[def.parent] || 0) < parentDef.max;

  const node = document.createElement('div');
  node.className = 'prestige-node' +
    (maxed ? ' prestige-maxed' : '') +
    (canAfford && !isLocked ? ' prestige-affordable' : '') +
    (isLocked ? ' prestige-locked' : '') +
    (extraClass ? ` ${extraClass}` : '');

  node.innerHTML = `
    <div class="prestige-node-name">${def.name}</div>
    <div class="prestige-node-desc">${def.desc}</div>
    ${def.max > 1 ? `<div class="prestige-node-level">${level} / ${def.max}</div>` : ''}
    ${maxed ? '<div class="prestige-node-status">MAXED</div>' :
      isLocked ? '<div class="prestige-node-status">LOCKED</div>' :
      `<div class="prestige-node-cost">${cost} ◆</div>`}
  `;

  if (!maxed && !isLocked && canAfford) {
    node.addEventListener('click', () => {
      buyPrestigeUpgrade(def.id);
      renderPrestigeStore();
    });
  }
  return node;
}

function buyPrestigeUpgrade(id) {
  const def = PRESTIGE_UPGRADES_MAP[id];
  const level = state.prestige.upgrades[id] || 0;
  if (level >= def.max) return;
  const cost = prestigeUpgradeCost(id);
  if (state.prestige.pearls < cost) return;
  state.prestige.pearls -= cost;
  state.prestige.upgrades[id] = level + 1;
  audio.play('catch_rare');
}

function performPrestige() {
  const pearls = getPearlsForRun();
  state.prestige.pearls += pearls;
  state.prestige.timesPrestiged++;

  // Save prestige data, catalog, achievements before reset
  const savedPrestige = JSON.parse(JSON.stringify(state.prestige));
  const savedCatalog = JSON.parse(JSON.stringify(state.catalogCaught));
  const savedAchievements = JSON.parse(JSON.stringify(state.achievementsCompleted));
  const savedSfx = state.sfxVolume;
  const savedMusic = state.musicVolume;

  // Reset everything to defaults
  const defaults = {
    gold: 0, totalGoldEarned: 0, currentZone: 0, unlockedZones: [0],
    inventory: {},
    upgrades: {
      rod_speed: 0, rod_speed_2: 0, rod_speed_3: 0,
      faster_reel: 0, faster_reel_2: 0,
      instant_retract: 0, retract_speed: 0, retract_speed_2: 0,
      targeting_scope: 0, targeting_scope_2: 0,
      fish_magnet: 0, fish_magnet_2: 0,
      net_place: 0, net_slots: 0, net_size: 0,
      auto_hook: 0,
      auto_hook_speed: 0, auto_hook_speed_2: 0,
      auto_hook_reload: 0, auto_hook_reload_2: 0,
      fish_density: 0, fish_density_2: 0, fish_density_3: 0,
      gold_boost: 0, gold_boost_2: 0,
      luck_boost: 0, luck_boost_2: 0, legendary_slow: 0,
      auto_sell: 0,
      harpoon: 0, harpoon_damage: 0, harpoon_damage_2: 0, harpoon_speed: 0, harpoon_speed_2: 0,
      bait_bomb: 0, bait_cooldown: 0, bait_strength: 0, auto_bait: 0,
      multi_cast: 0, multi_cooldown: 0, multi_duration: 0, multi_rods: 0, auto_multi: 0,
      bf_spawn_rate: 0, bf_spawn_rate_2: 0, bf_effect_duration: 0, bf_sell_multiplier: 0, bf_frenzy_count: 0,
      atlas_access: 0, boat_access: 0, catalog_access: 0,
      submarine: 0,
    },
    consumables: { small_net: 0, big_net: 0, black_fish_bait: 0 },
    activeConsumable: null,
    stats: { totalCaught: 0, totalCasts: 0, totalUpgradesBought: 0 },
    materials: {},
    subMode: false, subX: 0.5, subY: 0.5,
    baitTimer: 0, baitCooldown: 0,
    multiCastTimer: 0, multiCastCooldown: 0,
    autoHookTimer: 0, autoHookTarget: null, netZoneCooldown: 0, netCooldown: 0,
    boatSettings: { rodSpeedFactor: 1.0 },
    flags: {
      shopUnlocked: false, upgradesUnlocked: false,
      atlasUnlocked: false, boatUnlocked: false,
      upgradesVisited: false, atlasVisited: false,
      shopVisited: false, boatVisited: false,
      saveUnlocked: false, baitVisible: false,
      multiCastVisible: false, consumablesSidebar: false,
      consumableBought: false, firstUpgradeHinted: false,
      catalogUnlocked: false, autoHookEnabled: false,
      autoSellEnabled: false, autoBaitEnabled: false,
      autoMultiEnabled: false, prestigeUnlocked: false,
    },
    playTime: 0,
    showMaxedUpgrades: false,
    weaponMode: 'rod', bossFight: null, bossesDefeated: [],
    feedingFrenzyTimer: 0, fishmongerBoonTimer: 0,
    treasureChestTimer: 0, labSaleTimer: 0, sellMultiplier: 1,
    blender: { fish: 0, timer: 0, active: false },
  };

  Object.assign(state, defaults);

  // Restore preserved data
  state.prestige = savedPrestige;
  state.catalogCaught = savedCatalog;
  state.achievementsCompleted = savedAchievements;
  state.sfxVolume = savedSfx;
  state.musicVolume = savedMusic;

  // Apply zone skip prestige upgrade
  const zoneSkipLevel = state.prestige.upgrades.pearl_zone_skip || 0;
  if (zoneSkipLevel > 0) {
    for (let z = 1; z <= Math.min(zoneSkipLevel, 10); z++) {
      if (z < ZONES.length) {
        if (!state.unlockedZones.includes(z)) state.unlockedZones.push(z);
        if (!state.bossesDefeated.includes(z)) state.bossesDefeated.push(z);
      }
    }
  }

  // Reset canvas state
  cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.placedNets = [];
  cv.blackFish.active = false; cv.blackFish.spawnTimer = 60 + Math.random() * 90;

  // Hide all nav buttons
  document.getElementById('btn-shop').style.display = 'none';
  document.getElementById('btn-upgrades').style.display = 'none';
  document.getElementById('btn-atlas').style.display = 'none';
  document.getElementById('btn-boat').style.display = 'none';
  document.getElementById('btn-catalog').style.display = 'none';
  document.getElementById('btn-bait').style.display = 'none';
  document.getElementById('btn-multicast').style.display = 'none';
  document.getElementById('btn-place-net').style.display = 'none';
  document.getElementById('btn-prestige').style.display = 'none';
  document.getElementById('weapon-toggle').style.display = 'none';
  document.getElementById('auto-hook-bar').style.display = 'none';
  document.getElementById('auto-sell-bar').style.display = 'none';
  document.getElementById('auto-bait-toggle').style.display = 'none';
  document.getElementById('auto-multi-toggle').style.display = 'none';
  document.getElementById('sub-toggle').style.display = 'none';

  updateZoneOverlay();
  updateAllGoldDisplays();
}

function showPrestigeAnimation(callback) {
  const overlay = document.getElementById('prestige-anim-overlay');
  const canvas = document.getElementById('prestige-anim-canvas');
  overlay.style.display = 'flex';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: W / 2 + (Math.random() - 0.5) * 40,
      y: H / 2 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: 2 + Math.random() * 4,
      alpha: 0.8 + Math.random() * 0.2,
      hue: 160 + Math.random() * 40,
    });
  }

  let phase = 0; // 0=gather, 1=flash, 2=expand
  let timer = 0;
  const startT = performance.now() / 1000;

  function animate(ts) {
    const t = ts / 1000;
    const dt = Math.min(t - (startT + timer), 0.05);
    timer = t - startT;

    ctx.fillStyle = `rgba(0,0,0,${phase === 1 ? 0.0 : 0.15})`;
    ctx.fillRect(0, 0, W, H);

    if (phase === 0 && timer < 1.5) {
      // Swirl inward
      for (const p of particles) {
        const dx = W / 2 - p.x, dy = H / 2 - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const pull = 0.03 + timer * 0.04;
        p.vx += dx * pull * 0.01 + dy * 0.005;
        p.vy += dy * pull * 0.01 - dx * 0.005;
        p.vx *= 0.96; p.vy *= 0.96;
        p.x += p.vx; p.y += p.vy;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 80%, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fill();
      }
    } else if (phase === 0) {
      phase = 1;
    }

    if (phase === 1) {
      // Flash
      const flashProgress = (timer - 1.5) / 0.5;
      if (flashProgress < 1) {
        const alpha = flashProgress < 0.3 ? flashProgress / 0.3 : 1 - (flashProgress - 0.3) / 0.7;
        ctx.fillStyle = `rgba(0,255,180,${alpha * 0.9})`;
        ctx.fillRect(0, 0, W, H);
      } else {
        phase = 2;
      }
    }

    if (phase === 2) {
      // Expand & fade
      const expandProgress = (timer - 2.0) / 1.5;
      if (expandProgress < 1) {
        const radius = expandProgress * Math.max(W, H);
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, radius, 0, Math.PI * 2);
        const alpha = 1 - expandProgress;
        ctx.fillStyle = `rgba(0,${Math.floor(40 + 80 * alpha)},${Math.floor(20 + 40 * alpha)},${alpha * 0.3})`;
        ctx.fill();

        for (const p of particles) {
          const dx = p.x - W / 2, dy = p.y - H / 2;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          p.x += (dx / d) * 12; p.y += (dy / d) * 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - expandProgress), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha * (1 - expandProgress)})`;
          ctx.shadowBlur = 0;
          ctx.fill();
        }
      } else {
        overlay.style.display = 'none';
        callback();
        return;
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
