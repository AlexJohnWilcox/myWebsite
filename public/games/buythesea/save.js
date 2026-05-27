// ═══════════════════════════════════════════════════════════════
//  SAVE / LOAD
// ═══════════════════════════════════════════════════════════════

function exportSave() {
  return btoa(JSON.stringify({
    gold: Math.floor(state.gold),
    totalGoldEarned: Math.floor(state.totalGoldEarned),
    currentZone: state.currentZone,
    unlockedZones: state.unlockedZones,
    inventory: state.inventory,
    upgrades: state.upgrades,
    consumables: state.consumables,
    stats: state.stats,
    baitCooldown: state.baitCooldown,
    multiCastCooldown: state.multiCastCooldown,
    boatSettings: state.boatSettings,
    flags: state.flags,
    catalogCaught: state.catalogCaught,
    materials: state.materials,
    bossesDefeated: state.bossesDefeated,
    sfxVolume: state.sfxVolume,
    musicVolume: state.musicVolume,
    prestige: state.prestige,
    blender: state.blender,
    playTime: state.playTime,
    achievementsCompleted: state.achievementsCompleted,
  }));
}

function importSave(code) {
  try {
    const d = JSON.parse(atob(code.trim()));
    state.gold            = d.gold || 0;
    state.totalGoldEarned = d.totalGoldEarned || 0;
    state.currentZone     = Math.min(d.currentZone || 0, ZONES.length - 1);
    state.unlockedZones   = (d.unlockedZones || [0]).filter(z => z < ZONES.length);
    state.inventory       = d.inventory || {};
    state.upgrades        = { ...state.upgrades, ...d.upgrades };
    // Migrate salvaged_net to auto_hook if present
    if (d.upgrades && d.upgrades.salvaged_net && !d.upgrades.auto_hook) {
      state.upgrades.auto_hook = Math.min(d.upgrades.salvaged_net, 30);
    }
    delete state.upgrades.salvaged_net;
    // Migrate old high-level upgrades into tiers
    function migrateTier(base, tiers) {
      let total = state.upgrades[base] || 0;
      if (total <= 10) return;
      for (const tid of [base, ...tiers]) {
        const def = UPGRADES_MAP[tid];
        const cap = def ? def.max : 10;
        state.upgrades[tid] = Math.min(total, cap);
        total -= state.upgrades[tid];
      }
    }
    migrateTier('rod_speed', ['rod_speed_2', 'rod_speed_3']);
    migrateTier('faster_reel', ['faster_reel_2']);
    migrateTier('retract_speed', ['retract_speed_2']);
    migrateTier('targeting_scope', ['targeting_scope_2']);
    migrateTier('auto_hook_speed', ['auto_hook_speed_2']);
    migrateTier('auto_hook_reload', ['auto_hook_reload_2']);
    migrateTier('fish_density', ['fish_density_2', 'fish_density_3']);
    migrateTier('gold_boost', ['gold_boost_2']);
    migrateTier('luck_boost', ['luck_boost_2']);
    // Cap net upgrades to new max
    if (state.upgrades.net_slots > 3) state.upgrades.net_slots = 3;
    if (state.upgrades.net_size > 3) state.upgrades.net_size = 3;
    state.consumables     = { ...state.consumables, ...(d.consumables || {}) };
    delete state.consumables.worm;
    state.stats           = { ...state.stats, ...d.stats };
    state.baitCooldown    = d.baitCooldown || 0;
    state.multiCastCooldown = d.multiCastCooldown || 0;
    state.boatSettings    = { ...state.boatSettings, ...(d.boatSettings || {}) };
    state.flags           = { ...state.flags, ...d.flags };
    state.catalogCaught   = { ...state.catalogCaught, ...(d.catalogCaught || {}) };
    state.materials       = { ...state.materials, ...(d.materials || {}) };
    if (d.bossesDefeated) state.bossesDefeated = d.bossesDefeated;
    if (d.sfxVolume !== undefined) { state.sfxVolume = d.sfxVolume; if (typeof audio !== 'undefined') audio.setSfxVolume(d.sfxVolume); }
    if (d.musicVolume !== undefined) { state.musicVolume = d.musicVolume; if (typeof audio !== 'undefined') audio.setMusicVolume(d.musicVolume); }
    if (d.playTime !== undefined) state.playTime = d.playTime;
    if (d.prestige) {
      state.prestige = { ...state.prestige, ...d.prestige };
      state.prestige.upgrades = { ...state.prestige.upgrades, ...(d.prestige.upgrades || {}) };
    }
    if (d.blender) {
      state.blender = { ...state.blender, ...d.blender };
    }
    if (d.achievementsCompleted) {
      state.achievementsCompleted = { ...state.achievementsCompleted, ...d.achievementsCompleted };
    }
    cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.placedNets = [];
    cv.blackFish.active = false; cv.blackFish.spawnTimer = 60 + Math.random() * 90;
    state.feedingFrenzyTimer = 0; state.fishmongerBoonTimer = 0; state.treasureChestTimer = 0; state.labSaleTimer = 0; state.sellMultiplier = 1;
    updateZoneOverlay();
    applyFlagsToDOM();
    updateAllGoldDisplays();
    return true;
  } catch {
    return false;
  }
}

function saveToLocal() {
  try {
    localStorage.setItem('oceanIdleSave', exportSave());
    return true;
  } catch { return false; }
}

function loadLocalSave() {
  try {
    const code = localStorage.getItem('oceanIdleSave');
    if (!code) return false;
    return importSave(code);
  } catch { return false; }
}

function wipeSave() {
  localStorage.removeItem('oceanIdleSave');
  location.reload();
}

function startAutoSave() {
  setInterval(() => {
    if (saveToLocal()) showNotif('GAME SAVED');
  }, 60000);
}

function showNotif(text) {
  const area = document.getElementById('notif-area');
  if (!area) return;
  area.textContent = text;
  area.classList.remove('notif-fade');
  void area.offsetWidth;
  area.classList.add('notif-fade');
  setTimeout(() => { area.textContent = ''; }, 3000);
}

function applyFlagsToDOM() {
  const f = state.flags;
  if (f.shopUnlocked)     showBubble('btn-shop', false);
  if (f.upgradesUnlocked) showBubble('btn-upgrades', !f.upgradesVisited);
  if (f.atlasUnlocked)    showBubble('btn-atlas', !f.atlasVisited);
  if (f.boatUnlocked)     showBubble('btn-boat', !f.boatVisited);
  if (f.catalogUnlocked)  showBubble('btn-catalog', false);
  // Save buttons moved to menu
  if (f.baitVisible) {
    const b = document.getElementById('btn-bait');
    b.style.display = 'flex';
    if (!f.baitUsed) { b.classList.add('pulse-new'); addGuideArrow(b, 'right'); }
  }
  if (f.multiCastVisible) {
    const mc = document.getElementById('btn-multicast');
    mc.style.display = 'flex';
  }
  if (f.prestigeUnlocked) {
    document.getElementById('btn-prestige').style.display = 'flex';
    if (typeof updatePrestigeNavBtn === 'function') updatePrestigeNavBtn();
  }
  if (state.upgrades.harpoon >= 1 && typeof updateWeaponToggle === 'function') {
    updateWeaponToggle();
  }
  renderConsumablesPanel();
  if (typeof updateAutoHookUI === 'function') updateAutoHookUI();
  if (typeof updateAutoSellUI === 'function') updateAutoSellUI();
}
