// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════

let state = {
  gold: 0,
  totalGoldEarned: 0,
  currentZone: 0,
  unlockedZones: [0],
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
  playTime: 0,
  stats: { totalCaught: 0, totalCasts: 0, totalUpgradesBought: 0 },
  catalogCaught: {},
  materials: {},
  // Submarine
  subMode: false, // whether player is controlling the sub
  subX: 0.5,  // normalized 0-1
  subY: 0.5,
  // Achievements
  achievementsCompleted: {},
  baitTimer: 0,
  baitCooldown: 0,
  multiCastTimer: 0,
  multiCastCooldown: 0,
  autoHookTimer: 0,
  autoHookTarget: null,
  netZoneCooldown: 0,
  netCooldown: 0,
  boatSettings: { rodSpeedFactor: 1.0 },
  flags: {
    shopUnlocked:       false,
    upgradesUnlocked:   false,
    atlasUnlocked:      false,
    boatUnlocked:       false,
    upgradesVisited:    false,
    atlasVisited:       false,
    shopVisited:        false,
    boatVisited:        false,
    saveUnlocked:       false,
    baitVisible:        false,
    multiCastVisible:   false,
    consumablesSidebar: false,
    consumableBought:   false,
    firstUpgradeHinted: false,
    catalogUnlocked:    false,
    autoHookEnabled:    false,
    autoSellEnabled: false,
    autoBaitEnabled: false,
    autoMultiEnabled: false,
    prestigeUnlocked: false,
  },
  showMaxedUpgrades: false,
  feedingFrenzyTimer: 0,
  fishmongerBoonTimer: 0,
  treasureChestTimer: 0,
  labSaleTimer: 0,
  sellMultiplier: 1,
  weaponMode: 'rod', // 'rod' | 'harpoon'
  bossFight: null, // { targetZone, hp, maxHp, timer, bossData, x, y, dir, wobble, hitFlash }
  bossesDefeated: [], // zone IDs of defeated bosses
  sfxVolume: 0.5,
  musicVolume: 0.5,
  prestige: {
    pearls: 0,
    timesPrestiged: 0,
    upgrades: {
      infinite_kelp: 0,
      pearl_sell_boost: 0,
      pearl_rod_speed: 0,
      pearl_spawn_rate: 0,
      pearl_extra_tiers: 0,
      pearl_blender: 0,
      pearl_sub_speed: 0,
      pearl_zone_skip: 0,
    },
  },
  blender: { fish: 0, timer: 0, active: false },
};

// ─── Derived ───

function getRecastCooldown() {
  return Math.max(0.05, 2.5 - getUpgradeLevel('faster_reel') * 0.08);
}

function getCastSpeed() {
  const baseSpeed = 380;
  const maxSpeed = baseSpeed * (1 + getUpgradeLevel('rod_speed') * 0.06);
  return maxSpeed * state.boatSettings.rodSpeedFactor * getPrestigeRodSpeedMultiplier();
}

function getMaxFish() {
  return Math.ceil(ZONES[state.currentZone].maxFish * (1 + getUpgradeLevel('fish_density') * 0.06));
}

function getCatchRadius() {
  const base  = 36;
  const scope = base * getUpgradeLevel('targeting_scope') * 0.06;
  return base + scope;
}

function getNetRadius() {
  return 38 + (state.upgrades.net_size || 0) * 18;
}

function getMaxNets() {
  return 1 + (state.upgrades.net_slots || 0);
}

function getAutoHookInterval() {
  return Math.max(1, 30 - getUpgradeLevel('auto_hook_speed'));
}

function getAutoHookRecastCooldown() {
  return Math.max(0.05, 1.5 - getUpgradeLevel('auto_hook_reload') * 0.1);
}

// ═══════════════════════════════════════════════════════════════
//  Audio → audio.js  |  Utilities → utils.js
// ═══════════════════════════════════════════════════════════════
