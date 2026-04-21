const ZONE_SPECIALS = [null, cv.starfish, cv.sandDollar, cv.reefUrchin, cv.coralPearl, cv.sandFossil, cv.mineGem, cv.looseTooth, cv.cityRelic, cv.wallShard, cv.abyssCrystal, cv.passageKey, cv.sirenScale, cv.twilightOrb, cv.trenchBone];

// Cached DOM elements for hot-path lookups
const _screenFishing = document.getElementById('screen-fishing');
let _milestoneTimer = 0;

// ═══════════════════════════════════════════════════════════════
//  CREDITS
// ═══════════════════════════════════════════════════════════════
const CREDITS_HTML = `
<h3>MUSIC</h3>
<p>
"2nd Sonar Sense" by kandlaker — Pixabay Content License<br>
"Underwater" by mavopix — Pixabay Content License
</p>
<h3>SOUND EFFECTS</h3>
<p>
"Click Buttons - Button 6" by skyscraper_seven — Pixabay Content License<br>
"Get Item" by freesound_CrunchpixStudio — Pixabay Content License<br>
"Video Game Sword Swing SFX" by OxidVideos — Pixabay Content License<br>
"Pop Mouse" by SoundReality — Pixabay Content License<br>
"Pop Click" by SoundReality — Pixabay Content License<br>
"Pop Atmos" by SoundReality — Pixabay Content License<br>
"Pop Clean" by SoundReality — Pixabay Content License
</p>
<h3>FONTS</h3>
<p>
"Space Mono" by Colophon Foundry — Google Fonts (OFL)
</p>
<h3>DEVELOPMENT</h3>
<p>
Alex<br>
Claude by Anthropic
</p>
`;

// ═══════════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════════

function loop(timestamp) {
  const t  = timestamp / 1000;
  if (gamePaused) { currentT = t; requestAnimationFrame(loop); return; }
  const dt = Math.min(t - currentT, 0.25);
  currentT = t;
  update(dt, t);
  if (_screenFishing.classList.contains('active')) draw();
  // Update submarine WASD
  if (state.subMode && state.upgrades.submarine >= 1) {
    const subSpeed = 0.3 * (1 + (state.prestige.upgrades.pearl_sub_speed || 0) * 0.5);
    if (_keysDown['w'] || _keysDown['arrowup'])    state.subY = Math.max(0.05, state.subY - subSpeed * dt);
    if (_keysDown['s'] || _keysDown['arrowdown'])  state.subY = Math.min(0.85, state.subY + subSpeed * dt);
    if (_keysDown['a'] || _keysDown['arrowleft'])  state.subX = Math.max(0.05, state.subX - subSpeed * dt);
    if (_keysDown['d'] || _keysDown['arrowright']) state.subX = Math.min(0.95, state.subX + subSpeed * dt);
  }
  requestAnimationFrame(loop);
}

// Track WASD keys for submarine
const _keysDown = {};
document.addEventListener('keydown', (e) => { _keysDown[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { _keysDown[e.key.toLowerCase()] = false; });

function update(dt, t) {
  state.playTime += dt;
  const zone = ZONES[state.currentZone];

  // Blender
  if (state.blender && state.blender.active) {
    state.blender.timer -= dt;
    if (state.blender.timer <= 0) {
      state.blender.active = false;
      state.blender.timer = 0;
      state.blender.fish = 0;
      state.prestige.pearls += 10;
      showNotif('+10 PEARLS FROM BLENDER');
      updateBlenderUI();
      if (typeof updatePrestigeNavBtn === 'function') updatePrestigeNavBtn();
    }
  }

  // Boss fight mode — only update boss, harpoon, and bubbles
  if (state.bossFight) {
    updateBossFight(dt, t);
    // Still animate bubbles
    cv.bubbleTimer -= dt;
    if (cv.bubbleTimer <= 0) { spawnBubble(); cv.bubbleTimer = 0.28 + Math.random() * 0.55; }
    for (let i = cv.bubbles.length - 1; i >= 0; i--) {
      const b = cv.bubbles[i];
      b.y -= b.speed * dt;
      b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.5;
      if (b.y < -8) cv.bubbles.splice(i, 1);
    }
    for (let i = cv.bossHitFlashes.length - 1; i >= 0; i--) {
      cv.bossHitFlashes[i].timer -= dt;
      if (cv.bossHitFlashes[i].timer <= 0) cv.bossHitFlashes.splice(i, 1);
    }
    return;
  }

  for (let i = cv.fish.length - 1; i >= 0; i--) {
    const f = cv.fish[i];
    if (f.caught) {
      f.catchAnim = Math.min(1, f.catchAnim + dt * 2.8);
      if (f.catchAnim >= 1) cv.fish.splice(i, 1);
      continue;
    }
    const def = FISH[f.type];
    f.x += def.speed * (f.speedScale || 1) * f.dir * dt;
    // Fish vertical drift (#8)
    if (f.driftRate) {
      f.baseY += f.driftRate * dt;
      f.baseY = Math.max(canvasH * 0.08, Math.min(canvasH * 0.88, f.baseY));
    }
    f.currentY = def.wave
      ? f.baseY + Math.sin(t * def.wave.freq + f.waveOffset) * def.wave.amp
      : f.baseY;
    f.currentY = Math.max(36, Math.min(canvasH - 44, f.currentY));
    if ((f.dir === 1 && f.x > canvasW + 90) || (f.dir === -1 && f.x < -90)) cv.fish.splice(i, 1);
  }

  // Nets
  for (let i = cv.nets.length - 1; i >= 0; i--) {
    cv.nets[i].timer -= dt;
    if (cv.nets[i].timer <= 0) cv.nets.splice(i, 1);
  }

  // Ships (coast only)
  if (state.currentZone === 0) {
    cv.shipTimer -= dt;
    if (cv.shipTimer <= 0) {
      cv.shipTimer = 22 + Math.random() * 35;
      const dir = Math.random() < 0.5 ? 1 : -1;
      cv.ships.push({
        x: dir === 1 ? -200 : canvasW + 200,
        y: canvasH * 0.065 + Math.random() * canvasH * 0.02,
        dir, speed: 22 + Math.random() * 18,
        size: 0.7 + Math.random() * 0.5,
      });
    }
    for (let i = cv.ships.length - 1; i >= 0; i--) {
      cv.ships[i].x += cv.ships[i].dir * cv.ships[i].speed * dt;
      if (cv.ships[i].x > canvasW + 300 || cv.ships[i].x < -300) cv.ships.splice(i, 1);
    }
  }

  // Placed nets: catch fish that swim through
  for (const pn of cv.placedNets) {
    for (const f of cv.fish) {
      if (f.caught) continue;
      if (dist(pn.x, f.x, pn.y, f.currentY) < pn.radius) {
        catchFish(f.id, f.type);
      }
    }
  }

  cv.spawnTimer -= dt;
  if (cv.spawnTimer <= 0) {
    spawnFish();
    const densityReduction = 1 / (1 + getUpgradeLevel('fish_density') * 0.06);
    cv.spawnTimer = (3 + Math.random() * 2.0) * densityReduction * getPrestigeSpawnRateMultiplier();
  }

  // ── Ability cooldowns ──
  if (state.baitTimer > 0) {
    state.baitTimer = Math.max(0, state.baitTimer - dt);
  }
  if (state.baitCooldown > 0) {
    state.baitCooldown = Math.max(0, state.baitCooldown - dt);
    updateBaitBtn();
  }
  if (state.multiCastTimer > 0) {
    state.multiCastTimer = Math.max(0, state.multiCastTimer - dt);
  }
  if (state.multiCastCooldown > 0) {
    state.multiCastCooldown = Math.max(0, state.multiCastCooldown - dt);
    updateMultiCastBtn();
  }

  // ── Auto abilities: fire bait/multi-cast when off cooldown ──
  if (state.flags.autoBaitEnabled && state.upgrades.auto_bait > 0 && state.baitCooldown <= 0 && state.baitTimer <= 0) {
    useBait();
  }
  if (state.flags.autoMultiEnabled && state.upgrades.auto_multi > 0 && state.multiCastCooldown <= 0 && state.multiCastTimer <= 0) {
    useMultiCast();
  }

  // Auto-hook: casts toward cursor position
  if (state.flags.autoHookEnabled && state.upgrades.auto_hook > 0 && !cv.hook && cv.cooldown <= 0) {
    state.autoHookTimer += dt;
    if (state.autoHookTimer >= getAutoHookInterval()) {
      state.autoHookTimer = 0;
      let tx, ty;
      if (state.autoHookTarget) {
        tx = state.autoHookTarget.x;
        ty = state.autoHookTarget.y;
      } else {
        tx = canvasW / 2 + (Math.random() - 0.5) * canvasW * 0.4;
        ty = canvasH * 0.15 + Math.random() * canvasH * 0.3;
      }
      castHook(tx, ty);
      if (cv.hook) cv.hook.isAutoHook = true;
    }
    updateAutoHookUI();
  } else if (!state.flags.autoHookEnabled) {
    state.autoHookTimer = 0;
  }

  if (cv.hook) {
    const h = cv.hook;
    const SPEED = getCastSpeed();
    if (h.state === 'traveling') {
      const dx = h.tx - h.x, dy = h.ty - h.y;
      const d = dist(h.tx, h.x, h.ty, h.y);
      const step = SPEED * dt;
      if (step >= d) {
        h.x = h.tx; h.y = h.ty; h.state = 'lingering'; h.lingerTimer = 0;
      } else {
        h.x += (dx / d) * step; h.y += (dy / d) * step;
      }
      checkHookCollision(h.x, h.y);
    } else if (h.state === 'lingering') {
      h.lingerTimer += dt;
      // Fish magnet: pull nearby fish toward hook
      const magnetLvl = getUpgradeLevel('fish_magnet');
      if (magnetLvl > 0) {
        const magnetRadius = 80 + magnetLvl * 15;
        const magnetStrength = 30 + magnetLvl * 8;
        for (const f of cv.fish) {
          if (f.caught) continue;
          const d = dist(h.x, f.x, h.y, f.currentY);
          if (d < magnetRadius && d > 5) {
            // Common fish most susceptible, legendary barely moved
            const rarityMult = { COMMON: 1.0, UNCOMMON: 0.7, RARE: 0.4, EPIC: 0.15, LEGENDARY: 0.05 };
            const rm = rarityMult[FISH[f.type].rarity] || 1.0;
            const pull = magnetStrength * dt / d * rm;
            f.x += (h.x - f.x) * pull;
            f.baseY += (h.y - f.baseY) * pull;
          }
        }
      }
      checkHookCollision(h.x, h.y);
      if (h.lingerTimer >= 0.44) h.state = 'retracting';
    } else if (h.state === 'retracting') {
      const dx = h.ox - h.x, dy = h.oy - h.y;
      const d = dist(h.ox, h.x, h.oy, h.y);
      const retractMult = h.quickRetract ? (1 + (getUpgradeLevel('retract_speed') * 0.18)) : 1;
      const step = Math.max(SPEED, 600) * retractMult * dt;
      if (step >= d) {
        const wasAutoHook = cv.hook.isAutoHook;
        cv.hook = null;
        cv.cooldown = wasAutoHook ? getAutoHookRecastCooldown() : getRecastCooldown();
      }
      else { h.x += (dx / d) * step; h.y += (dy / d) * step; }
      checkHookCollision(h.x, h.y);
    }
  }

  // Extra hooks from multi-cast
  if (cv.extraHooks.length) {
    const SPEED = getCastSpeed();
    for (let i = cv.extraHooks.length - 1; i >= 0; i--) {
      const h = cv.extraHooks[i];
      if (h.state === 'traveling') {
        const dx = h.tx - h.x, dy = h.ty - h.y;
        const d = dist(h.tx, h.x, h.ty, h.y);
        const step = SPEED * dt;
        if (step >= d) { h.x = h.tx; h.y = h.ty; h.state = 'lingering'; h.lingerTimer = 0; }
        else { h.x += (dx / d) * step; h.y += (dy / d) * step; }
        checkHookCollision(h.x, h.y);
      } else if (h.state === 'lingering') {
        h.lingerTimer += dt;
        checkHookCollision(h.x, h.y);
        if (h.lingerTimer >= 0.44) h.state = 'retracting';
      } else if (h.state === 'retracting') {
        const dx = h.ox - h.x, dy = h.oy - h.y;
        const d = dist(h.ox, h.x, h.oy, h.y);
        const step = Math.max(SPEED, 600) * dt;
        if (step >= d) { cv.extraHooks.splice(i, 1); continue; }
        else { h.x += (dx / d) * step; h.y += (dy / d) * step; }
        checkHookCollision(h.x, h.y);
      }
    }
  }

  if (cv.cooldown > 0) cv.cooldown = Math.max(0, cv.cooldown - dt);

  cv.bubbleTimer -= dt;
  if (cv.bubbleTimer <= 0) { spawnBubble(); cv.bubbleTimer = 0.28 + Math.random() * 0.55; }
  for (let i = cv.bubbles.length - 1; i >= 0; i--) {
    const b = cv.bubbles[i];
    b.y -= b.speed * dt;
    b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.5;
    if (b.y < -8) cv.bubbles.splice(i, 1);
  }

  for (let i = cv.catchFlashes.length - 1; i >= 0; i--) {
    cv.catchFlashes[i].timer -= dt;
    if (cv.catchFlashes[i].timer <= 0) cv.catchFlashes.splice(i, 1);
  }

  cv.ambientTimer -= dt;
  if (cv.ambientTimer <= 0 && zone.ambientMessages.length) {
    cv.ambientTimer = 36 + Math.random() * 52;
  }

  if (state.currentZone === 0) updateCrab(dt);
  else {
    const zs = ZONE_SPECIALS[state.currentZone];
    if (zs) updateZoneSpecial(zs, dt);
  }

  // Net placement cooldown timer
  if (state.netZoneCooldown > 0) {
    state.netZoneCooldown = Math.max(0, state.netZoneCooldown - dt);
  }
  if (state.netCooldown > 0) {
    state.netCooldown = Math.max(0, state.netCooldown - dt);
    updatePlaceNetBtn();
  }

  // Black fish event
  updateBlackFish(dt);

  // Fishmonger's boon: sell rate multiplier
  if (state.fishmongerBoonTimer > 0) {
    state.fishmongerBoonTimer = Math.max(0, state.fishmongerBoonTimer - dt);
    state.sellMultiplier = state.fishmongerBoonTimer > 0 ? (3 + getUpgradeLevel('bf_sell_multiplier') * 0.2) : 1;
  }

  // Treasure chest: all fish spawn golden
  if (state.treasureChestTimer > 0) {
    state.treasureChestTimer = Math.max(0, state.treasureChestTimer - dt);
  }

  // Lab sale: 30% cheaper upgrades
  if (state.labSaleTimer > 0) {
    state.labSaleTimer = Math.max(0, state.labSaleTimer - dt);
  }

  // Throttle milestone checks to every ~0.5s instead of every frame
  _milestoneTimer += dt;
  if (_milestoneTimer >= 0.5) {
    _milestoneTimer = 0;
    checkMilestones();
  }
}

// ═══════════════════════════════════════════════════════════════
//  BLACK FISH EVENT
// ═══════════════════════════════════════════════════════════════

function updateBlackFish(dt) {
  const bf = cv.blackFish;
  if (!bf.active) {
    // bf_spawn_rate reduces spawn timer by 5% per level
    bf.spawnTimer -= dt * (1 + getUpgradeLevel('bf_spawn_rate') * 0.05);
    if (bf.spawnTimer <= 0) {
      bf.active = true;
      bf.phase = 'fading_in';
      bf.phaseTimer = 3;
      bf.x = 0.15 + Math.random() * 0.7;
      bf.y = 0.15 + Math.random() * 0.55;
      bf.dir = Math.random() < 0.5 ? 1 : -1;
      bf.wobbleOffset = Math.random() * Math.PI * 2;
      bf.alpha = 0;
    }
    return;
  }
  bf.wobbleOffset += dt * 1.2;
  if (bf.phase === 'fading_in') {
    bf.phaseTimer -= dt;
    bf.alpha = Math.min(1, 1 - bf.phaseTimer / 3);
    if (bf.phaseTimer <= 0) { bf.phase = 'visible'; bf.phaseTimer = 5; bf.alpha = 1; }
  } else if (bf.phase === 'visible') {
    bf.phaseTimer -= dt;
    bf.alpha = 1;
    if (bf.phaseTimer <= 0) { bf.phase = 'fading_out'; bf.phaseTimer = 2; }
  } else if (bf.phase === 'fading_out') {
    bf.phaseTimer -= dt;
    bf.alpha = Math.max(0, bf.phaseTimer / 2);
    if (bf.phaseTimer <= 0) {
      bf.active = false;
      bf.phase = 'none';
      bf.spawnTimer = 60 + Math.random() * 90;
    }
  }
}

function clickBlackFish(cx, cy) {
  const bf = cv.blackFish;
  if (!bf.active || bf.alpha < 0.2) return false;
  const bfx = bf.x * canvasW;
  const bfy = bf.y * canvasH;
  if (dist(cx, bfx, cy, bfy) > 40) return false;

  // Clicked! Play rare fish sound and pick random effect
  audio.play('catch_rare');
  bf.active = false;
  bf.phase = 'none';
  bf.spawnTimer = 90 + Math.random() * 120;

  const baseDur = 10 + getUpgradeLevel('bf_effect_duration') * 1.5;
  const sellMult = 3 + getUpgradeLevel('bf_sell_multiplier') * 0.2;
  const frenzyCount = 8 + getUpgradeLevel('bf_frenzy_count') * 2;
  const roll = Math.random();
  if (roll < 0.4) {
    // Fishmonger's Boon: sell multiplier for duration (40%)
    state.fishmongerBoonTimer = baseDur;
    state.sellMultiplier = sellMult;
    showBlackFishBanner('✧ FISHMONGER\'S BOON!', `${sellMult.toFixed(1)}x sell price for ${Math.round(baseDur)}s`, '#ffcc44');
  } else if (roll < 0.8) {
    // Treasure Chest: all spawns are golden for duration (40%)
    state.treasureChestTimer = baseDur;
    showBlackFishBanner('★ TREASURE CHEST!', `All fish spawn golden for ${Math.round(baseDur)}s`, '#ffee44');
  } else {
    // Feeding Frenzy: spawn fish immediately (20%)
    for (let i = 0; i < frenzyCount; i++) spawnFish(true);
    showBlackFishBanner('⚡ FEEDING FRENZY!', `${frenzyCount} fish spawned!`, '#00ffaa');
  }
  return true;
}

function showBlackFishBanner(title, subtitle, color) {
  const el = document.getElementById('black-fish-banner');
  el.querySelector('.bf-banner-title').textContent = title;
  el.querySelector('.bf-banner-title').style.color = color;
  el.querySelector('.bf-banner-title').style.textShadow = `0 0 30px ${color}, 0 0 60px ${color}`;
  el.querySelector('.bf-banner-sub').textContent = subtitle;
  el.classList.remove('bf-banner-fade');
  el.style.display = 'flex';
  // Force reflow to restart animation
  void el.offsetWidth;
  el.classList.add('bf-banner-fade');
  setTimeout(() => { el.style.display = 'none'; }, 2500);
}

// ═══════════════════════════════════════════════════════════════
//  BOSS FIGHT
// ═══════════════════════════════════════════════════════════════

function updateBossFight(dt, t) {
  const bf = state.bossFight;
  if (!bf) return;

  // Timer countdown
  bf.timer -= dt;
  bf.wobble += dt * 1.5;

  // Boss stays centered, small up/down bob for realism (no dodging)
  const boss = bf.bossData;
  bf.x = canvasW * 0.5;
  bf.y = canvasH * 0.4 + Math.sin(bf.wobble * 0.5) * 15;

  // Hit flash decay
  if (bf.hitFlash > 0) bf.hitFlash = Math.max(0, bf.hitFlash - dt * 4);

  // Harpoon movement
  if (cv.harpoon) {
    const h = cv.harpoon;
    const SPEED = getHarpoonCastSpeed();
    if (h.state === 'traveling') {
      const dx = h.tx - h.x, dy = h.ty - h.y;
      const d = dist(h.tx, h.x, h.ty, h.y);
      const step = SPEED * dt;
      if (step >= d) {
        h.x = h.tx; h.y = h.ty; h.state = 'retracting';
      } else {
        h.x += (dx / d) * step; h.y += (dy / d) * step;
      }
      // Check hit on boss
      const bossY = bf.y + Math.sin(bf.wobble) * 12;
      if (dist(h.x, bf.x, h.y, bossY) < boss.size * 0.8) {
        const dmg = getHarpoonDamage();
        bf.hp -= dmg;
        bf.hitFlash = 1;
        cv.bossHitFlashes.push({
          x: h.x + (Math.random() - 0.5) * 30,
          y: h.y - 10,
          timer: 0.8,
          text: `-${dmg}`,
        });
        h.state = 'retracting';
      }
    } else if (h.state === 'retracting') {
      const dx = h.ox - h.x, dy = h.oy - h.y;
      const d = dist(h.ox, h.x, h.oy, h.y);
      const step = Math.max(SPEED, 600) * dt;
      if (step >= d) {
        cv.harpoon = null;
      } else {
        h.x += (dx / d) * step; h.y += (dy / d) * step;
      }
    }
  }

  // Boss defeated
  if (bf.hp <= 0) {
    state.bossesDefeated.push(bf.targetZone);
    state.bossFight = null;
    cv.harpoon = null;
    state.weaponMode = 'rod';
    updateWeaponToggle();
    // Actually travel to the zone
    state.currentZone = bf.targetZone;
    cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.spawnTimer = 0;
    cv.placedNets = [];
    updateZoneOverlay();
    // Boss drops gold proportional to zone
    const bossGold = Math.floor(ZONES[bf.targetZone].unlockCost * 0.15);
    state.gold += bossGold;
    state.totalGoldEarned += bossGold;
    updateAllGoldDisplays();
    showBlackFishBanner('⚔ BOSS DEFEATED!', `+${fmt(bossGold)}✧`, ZONES[bf.targetZone].color);
    setTimeout(flashZoneOverlay, 400);
    spawnFish(); spawnFish(); spawnFish();
    return;
  }

  // Timer expired — boss wins
  if (bf.timer <= 0) {
    const penalty = Math.floor(state.gold * 0.1);
    state.gold -= penalty;
    if (state.gold < 0) state.gold = 0;
    state.bossFight = null;
    cv.harpoon = null;
    state.weaponMode = 'rod';
    updateWeaponToggle();
    updateAllGoldDisplays();
    // Return to previous zone
    cv.fish = []; cv.hook = null; cv.cooldown = 0; cv.spawnTimer = 0;
    showBlackFishBanner('✖ BOSS SURVIVED', `Lost ${fmt(penalty)}✧ · returned to ${ZONES[state.currentZone].name}`, '#ff4444');
    spawnFish(); spawnFish(); spawnFish();
    return;
  }
}

function castHarpoon(cx, cy) {
  if (!state.bossFight) return;
  if (cv.harpoon) return; // one at a time
  const origin = (typeof getHookOrigin === 'function') ? getHookOrigin() : { x: canvasW / 2, y: canvasH - 30 };
  cv.harpoon = {
    x: origin.x, y: origin.y, tx: cx, ty: cy, ox: origin.x, oy: origin.y,
    state: 'traveling',
  };
  audio.play('cast');
}

// ═══════════════════════════════════════════════════════════════
//  BLENDER
// ═══════════════════════════════════════════════════════════════

function updateBlenderUI() {
  const section = document.getElementById('blender-section');
  if (!section) return;
  const unlocked = state.prestige.upgrades.pearl_blender >= 1;
  section.style.display = unlocked ? 'block' : 'none';
  if (!unlocked) return;

  const statusEl = document.getElementById('blender-status');
  const barEl = document.getElementById('blender-bar');
  const btnEl = document.getElementById('btn-blend');

  if (state.blender && state.blender.active) {
    const remaining = Math.max(0, state.blender.timer);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    statusEl.textContent = `BLENDING... ${mins}:${secs.toString().padStart(2, '0')} remaining`;
    barEl.style.width = ((1 - remaining / 3600) * 100) + '%';
    btnEl.disabled = true;
    btnEl.textContent = 'BLENDING...';
  } else {
    statusEl.textContent = 'EMPTY';
    barEl.style.width = '0%';
    btnEl.disabled = false;
    btnEl.textContent = 'BLEND 10 FISH \u2192 10 \u25C6';
  }
}

function startBlend() {
  if (state.blender && state.blender.active) return;
  // Count total fish in inventory
  let totalFish = 0;
  const fishEntries = [];
  for (const [key, count] of Object.entries(state.inventory)) {
    if (count > 0 && FISH[key]) {
      totalFish += count;
      fishEntries.push({ key, count });
    }
  }
  if (totalFish < 10) {
    showNotif('NEED 10 FISH TO BLEND');
    return;
  }
  // Remove 10 fish, starting from most common
  fishEntries.sort((a, b) => b.count - a.count);
  let toRemove = 10;
  for (const entry of fishEntries) {
    if (toRemove <= 0) break;
    const remove = Math.min(entry.count, toRemove);
    state.inventory[entry.key] -= remove;
    if (state.inventory[entry.key] <= 0) delete state.inventory[entry.key];
    toRemove -= remove;
  }
  state.blender = { fish: 10, timer: 3600, active: true };
  showNotif('BLENDER STARTED');
  updateBlenderUI();
}

// ═══════════════════════════════════════════════════════════════
//  EVENT WIRING
// ═══════════════════════════════════════════════════════════════

document.getElementById('btn-shop').addEventListener('click',     () => switchScreen('screen-shop'));
document.getElementById('btn-upgrades').addEventListener('click', () => switchScreen('screen-upgrades'));
document.getElementById('btn-atlas').addEventListener('click',    () => switchScreen('screen-atlas'));
document.getElementById('btn-boat').addEventListener('click',     () => switchScreen('screen-boat'));
document.getElementById('btn-catalog').addEventListener('click', () => switchScreen('screen-catalog'));

// Achievements
let _achievementsReturnScreen = 'screen-fishing';
document.getElementById('btn-achievements-fishing').addEventListener('click', () => {
  _achievementsReturnScreen = 'screen-fishing';
  renderAchievements();
  switchScreen('screen-achievements');
});
document.getElementById('btn-back-achievements').addEventListener('click', () => switchScreen(_achievementsReturnScreen));

// Submarine toggle
document.getElementById('btn-sub-rod').addEventListener('click', () => {
  state.subMode = false;
  document.getElementById('btn-sub-rod').classList.add('weapon-active');
  document.getElementById('btn-sub-mode').classList.remove('weapon-active');
});
document.getElementById('btn-sub-mode').addEventListener('click', () => {
  state.subMode = true;
  document.getElementById('btn-sub-mode').classList.add('weapon-active');
  document.getElementById('btn-sub-rod').classList.remove('weapon-active');
});

document.getElementById('btn-back-shop').addEventListener('click',     () => { document.getElementById('btn-back-shop').classList.remove('pulse-hint', 'pulse-strong'); switchScreen('screen-fishing'); });
document.getElementById('btn-back-upgrades').addEventListener('click', () => { document.getElementById('btn-back-upgrades').classList.remove('pulse-hint'); switchScreen('screen-fishing'); });
document.getElementById('btn-back-atlas').addEventListener('click',    () => switchScreen('screen-fishing'));
document.getElementById('btn-back-boat').addEventListener('click',     () => switchScreen('screen-fishing'));
document.getElementById('btn-blend').addEventListener('click', startBlend);
document.getElementById('btn-back-catalog').addEventListener('click', () => switchScreen('screen-fishing'));

// ─── Prestige ───
document.getElementById('btn-prestige').addEventListener('click', () => {
  const pearls = getPearlsForRun();
  document.getElementById('prestige-fish-count').textContent = fmt(Math.floor(state.totalGoldEarned));
  document.getElementById('prestige-pearl-count').textContent = pearls;
  document.getElementById('prestige-modal').style.display = 'flex';
});

document.getElementById('prestige-confirm-no').addEventListener('click', () => {
  document.getElementById('prestige-modal').style.display = 'none';
});

document.getElementById('prestige-confirm-yes').addEventListener('click', () => {
  document.getElementById('prestige-modal').style.display = 'none';
  showPrestigeAnimation(() => {
    performPrestige();
    switchScreen('screen-prestige');
    renderPrestigeStore();
  });
});

document.getElementById('btn-prestige-return').addEventListener('click', () => {
  switchScreen('screen-fishing');
  cv.fish = []; cv.hook = null; cv.cooldown = 0;
  spawnFish(); spawnFish(); spawnFish();
  setTimeout(flashZoneOverlay, 400);
});

document.getElementById('btn-bait').addEventListener('click', () => { document.getElementById('btn-bait').classList.remove('pulse-new'); useBait(); });
document.getElementById('btn-multicast').addEventListener('click', () => { document.getElementById('btn-multicast').classList.remove('pulse-new'); useMultiCast(); });
document.getElementById('btn-place-net').addEventListener('click', () => {
  const btn = document.getElementById('btn-place-net');
  if (state.netCooldown > 0) return;
  if (cv.placedNets.length >= getMaxNets()) return;
  if (state.activeConsumable === 'place_net') {
    state.activeConsumable = null;
    btn.classList.remove('active');
  } else {
    state.activeConsumable = 'place_net';
    btn.classList.add('active');
  }
});
document.getElementById('btn-place-net').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (cv.placedNets.length === 0) return;
  cv.placedNets = [];
  state.netCooldown = 120;
  state.activeConsumable = null;
  document.getElementById('btn-place-net').classList.remove('active');
  updatePlaceNetBtn();
});

document.getElementById('btn-sell-all').addEventListener('click', sellAll);

// Auto-hook toggle in nav bar
document.getElementById('auto-hook-checkbox').addEventListener('change', (e) => {
  state.flags.autoHookEnabled = e.target.checked;
  state.autoHookTimer = 0;
  updateAutoHookUI();
});

// Weapon toggle
document.getElementById('btn-weapon-rod').addEventListener('click', () => {
  state.weaponMode = 'rod';
  updateWeaponToggle();
});
document.getElementById('btn-weapon-harpoon').addEventListener('click', () => {
  state.weaponMode = 'harpoon';
  updateWeaponToggle();
});

document.getElementById('auto-sell-checkbox').addEventListener('change', (e) => {
  state.flags.autoSellEnabled = e.target.checked;
  updateAutoSellUI();
});

document.getElementById('auto-bait-checkbox').addEventListener('change', (e) => {
  state.flags.autoBaitEnabled = e.target.checked;
});
document.getElementById('auto-multi-checkbox').addEventListener('change', (e) => {
  state.flags.autoMultiEnabled = e.target.checked;
});

function updateAutoHookUI() {
  const cb = document.getElementById('auto-hook-checkbox');
  const label = document.getElementById('auto-hook-label');
  const bar = document.getElementById('auto-hook-bar');
  const timerEl = document.getElementById('auto-hook-timer');
  if (state.upgrades.auto_hook > 0) {
    bar.style.display = 'flex';
  }
  cb.checked = state.flags.autoHookEnabled;
  label.textContent = state.flags.autoHookEnabled ? `AUTO ${Math.ceil(getAutoHookInterval())}s` : 'AUTO';
  label.classList.toggle('active', state.flags.autoHookEnabled);
  if (timerEl) {
    if (state.flags.autoHookEnabled && state.upgrades.auto_hook > 0 && !cv.hook && cv.cooldown <= 0) {
      const interval = getAutoHookInterval();
      const remaining = Math.ceil(interval - state.autoHookTimer);
      timerEl.textContent = `${remaining}s`;
      timerEl.style.display = 'block';
    } else {
      timerEl.style.display = 'none';
    }
  }
}

function updateAutoSellUI() {
  const cb = document.getElementById('auto-sell-checkbox');
  const label = document.getElementById('auto-sell-label');
  const bar = document.getElementById('auto-sell-bar');
  if (state.upgrades.auto_sell > 0) {
    bar.style.display = 'flex';
  }
  cb.checked = state.flags.autoSellEnabled;
  label.classList.toggle('active', state.flags.autoSellEnabled);
}

document.getElementById('modal-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('save-textarea').value).then(() => {
    const b = document.getElementById('modal-copy');
    b.textContent = 'COPIED!';
    setTimeout(() => { b.textContent = 'COPY TO CLIPBOARD'; }, 2000);
  });
});
document.getElementById('modal-save-close').addEventListener('click',  () => { document.getElementById('save-modal').style.display = 'none'; });
document.getElementById('modal-load-close').addEventListener('click',  () => { document.getElementById('load-modal').style.display = 'none'; });
document.getElementById('modal-import-btn').addEventListener('click',  () => {
  if (importSave(document.getElementById('load-textarea').value)) {
    document.getElementById('load-modal').style.display = 'none';
    document.getElementById('load-textarea').value = '';
    // If still on title screen, start the game
    const titleScreen = document.getElementById('screen-title');
    if (titleScreen.style.display !== 'none') {
      if (!audio.ctx) { audio._initPromise = audio.init(); audio._initPromise.then(() => audio.startMusic()); }
      else if (audio._initPromise) audio._initPromise.then(() => audio.startMusic());
      else audio.startMusic();
      titleScreen.classList.add('title-fade-out');
      setTimeout(() => {
        titleScreen.style.display = 'none';
        document.getElementById('screen-fishing').classList.add('active');
        init();
        requestAnimationFrame(loop);
        spawnFish(); spawnFish(); spawnFish();
        setTimeout(flashZoneOverlay, 400);
      }, 800);
    }
  }
});

// ─── Menu ───
let menuOpen = false;
const menuCv = {
  fish: [],
  kelp: [],
  bubbles: [],
  animId: null,
  lastT: 0,
};

function initMenuScene() {
  const mc = document.getElementById('menu-canvas');
  const mW = window.innerWidth;
  const mH = window.innerHeight;
  mc.width = mW;
  mc.height = mH;

  // Spawn a few subtle fish
  menuCv.fish = [];
  const count = 4 + Math.floor(Math.random() * 3); // 4-6 fish
  const fishColors = [
    { color: '#00cc66', glow: '#00ff88' },
    { color: '#88ccff', glow: '#aaddff' },
    { color: '#006644', glow: '#009966' },
    { color: '#557788', glow: '#7799aa' },
    { color: '#338866', glow: '#44aa88' },
  ];
  for (let i = 0; i < count; i++) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const fc = fishColors[Math.floor(Math.random() * fishColors.length)];
    menuCv.fish.push({
      x: dir === 1 ? -60 - Math.random() * 200 : mW + 60 + Math.random() * 200,
      y: mH * 0.12 + Math.random() * mH * 0.65,
      dir,
      speed: 15 + Math.random() * 25,
      size: 10 + Math.random() * 12,
      waveOffset: Math.random() * Math.PI * 2,
      waveAmp: 3 + Math.random() * 5,
      waveFreq: 1.5 + Math.random() * 1.5,
      color: fc.color,
      glow: fc.glow,
      alpha: 0.08 + Math.random() * 0.12,
    });
  }

  // Generate kelp stalks along bottom
  menuCv.kelp = [];
  const kelpCount = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < kelpCount; i++) {
    menuCv.kelp.push({
      x: mW * 0.03 + (mW * 0.94) * (i / (kelpCount - 1)) + (Math.random() - 0.5) * 40,
      height: 60 + Math.random() * 100,
      segments: 4 + Math.floor(Math.random() * 3),
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.6 + Math.random() * 0.8,
      width: 3 + Math.random() * 3,
      alpha: 0.06 + Math.random() * 0.08,
    });
  }

  // A few ambient bubbles
  menuCv.bubbles = [];
  for (let i = 0; i < 8; i++) {
    menuCv.bubbles.push({
      x: Math.random() * mW,
      y: Math.random() * mH,
      r: 1 + Math.random() * 2.5,
      speed: 8 + Math.random() * 15,
      opacity: 0.03 + Math.random() * 0.06,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.8 + Math.random() * 1.5,
    });
  }

  menuCv.lastT = performance.now() / 1000;
}

function drawMenuScene(ts) {
  if (!menuOpen) { menuCv.animId = null; return; }
  const mc = document.getElementById('menu-canvas');
  const mctx = mc.getContext('2d');
  const mW = mc.width;
  const mH = mc.height;
  const t = ts / 1000;
  const dt = Math.min(t - menuCv.lastT, 0.1);
  menuCv.lastT = t;

  mctx.clearRect(0, 0, mW, mH);

  // Draw kelp
  for (const k of menuCv.kelp) {
    mctx.save();
    mctx.globalAlpha = k.alpha;
    mctx.strokeStyle = '#00cc66';
    mctx.lineWidth = k.width;
    mctx.lineCap = 'round';
    mctx.shadowColor = '#00ff88';
    mctx.shadowBlur = 6;
    mctx.beginPath();
    const baseY = mH;
    mctx.moveTo(k.x, baseY);
    const segH = k.height / k.segments;
    for (let s = 1; s <= k.segments; s++) {
      const sway = Math.sin(t * k.swaySpeed + k.swayOffset + s * 0.8) * (8 + s * 3);
      const sy = baseY - segH * s;
      const sx = k.x + sway;
      mctx.lineTo(sx, sy);
    }
    mctx.stroke();

    // Leaf blobs on segments
    for (let s = 1; s <= k.segments; s++) {
      if (s % 2 === 0) continue;
      const sway = Math.sin(t * k.swaySpeed + k.swayOffset + s * 0.8) * (8 + s * 3);
      const sy = baseY - segH * s;
      const sx = k.x + sway;
      const leafDir = s % 3 === 0 ? 1 : -1;
      mctx.fillStyle = '#00aa55';
      mctx.beginPath();
      mctx.ellipse(sx + leafDir * 8, sy, 6, 3, leafDir * 0.4, 0, Math.PI * 2);
      mctx.fill();
    }
    mctx.restore();
  }

  // Draw fish
  for (const f of menuCv.fish) {
    f.x += f.dir * f.speed * dt;
    const wy = f.y + Math.sin(t * f.waveFreq + f.waveOffset) * f.waveAmp;

    // Respawn if off screen
    if (f.dir === 1 && f.x > mW + 100) {
      f.x = -80 - Math.random() * 100;
      f.y = mH * 0.12 + Math.random() * mH * 0.65;
    } else if (f.dir === -1 && f.x < -100) {
      f.x = mW + 80 + Math.random() * 100;
      f.y = mH * 0.12 + Math.random() * mH * 0.65;
    }

    mctx.save();
    mctx.globalAlpha = f.alpha;
    mctx.translate(f.x, wy);
    mctx.scale(f.dir, 1);

    // Body
    mctx.fillStyle = f.color;
    mctx.shadowColor = f.glow;
    mctx.shadowBlur = 10;
    mctx.beginPath();
    mctx.ellipse(0, 0, f.size, f.size * 0.42, 0, 0, Math.PI * 2);
    mctx.fill();

    // Tail
    mctx.beginPath();
    mctx.moveTo(-f.size * 0.8, 0);
    mctx.lineTo(-f.size * 1.5, -f.size * 0.4);
    mctx.lineTo(-f.size * 1.5, f.size * 0.4);
    mctx.closePath();
    mctx.fill();

    // Eye
    mctx.shadowBlur = 0;
    mctx.fillStyle = f.glow;
    mctx.globalAlpha = f.alpha * 1.5;
    mctx.beginPath();
    mctx.arc(f.size * 0.4, -f.size * 0.08, f.size * 0.1, 0, Math.PI * 2);
    mctx.fill();

    mctx.restore();
  }

  // Draw bubbles
  for (const b of menuCv.bubbles) {
    b.y -= b.speed * dt;
    b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.3;
    if (b.y < -10) { b.y = mH + 10; b.x = Math.random() * mW; }
    mctx.beginPath();
    mctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    mctx.strokeStyle = `rgba(0,255,136,${b.opacity})`;
    mctx.lineWidth = 0.5;
    mctx.stroke();
  }

  menuCv.animId = requestAnimationFrame(drawMenuScene);
}

function formatPlayTime(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

function openMenu() {
  menuOpen = true;
  gamePaused = true;
  document.getElementById('menu-modal').style.display = 'flex';
  document.getElementById('menu-restart-confirm').style.display = 'none';
  document.getElementById('menu-credits-body').style.display = 'none';
  document.getElementById('menu-credits-content').innerHTML = CREDITS_HTML;
  document.getElementById('menu-playtime').textContent = formatPlayTime(state.playTime);
  initMenuScene();
  menuCv.animId = requestAnimationFrame(drawMenuScene);
}
function closeMenu() {
  menuOpen = false;
  gamePaused = false;
  currentT = performance.now() / 1000;
  document.getElementById('menu-modal').style.display = 'none';
  if (menuCv.animId) { cancelAnimationFrame(menuCv.animId); menuCv.animId = null; }
}

document.getElementById('btn-menu').addEventListener('click', openMenu);
document.getElementById('menu-close').addEventListener('click', closeMenu);

document.getElementById('menu-save-local').addEventListener('click', () => {
  if (saveToLocal()) {
    const btn = document.getElementById('menu-save-local');
    btn.textContent = 'SAVED!';
    setTimeout(() => { btn.textContent = 'SAVE GAME'; }, 1500);
  }
});

document.getElementById('menu-export').addEventListener('click', () => {
  closeMenu();
  document.getElementById('save-textarea').value = exportSave();
  document.getElementById('save-modal').style.display = 'flex';
});

document.getElementById('menu-import').addEventListener('click', () => {
  closeMenu();
  document.getElementById('load-modal').style.display = 'flex';
});

document.getElementById('menu-restart').addEventListener('click', () => {
  document.getElementById('menu-restart-confirm').style.display = 'flex';
});

document.getElementById('menu-restart-yes').addEventListener('click', () => {
  wipeSave();
});

document.getElementById('menu-credits-toggle').addEventListener('click', () => {
  const body = document.getElementById('menu-credits-body');
  body.style.display = body.style.display === 'none' ? 'block' : 'none';
});

let _sfxPreviewInterval = null;
document.getElementById('menu-sfx-slider').addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  document.getElementById('menu-sfx-val').textContent = val;
  audio.setSfxVolume(val / 100);
  if (!_sfxPreviewInterval) {
    audio.play('click');
    _sfxPreviewInterval = setInterval(() => audio.play('click'), 1000);
  }
});
document.getElementById('menu-sfx-slider').addEventListener('change', () => {
  if (_sfxPreviewInterval) { clearInterval(_sfxPreviewInterval); _sfxPreviewInterval = null; }
});

document.getElementById('menu-music-slider').addEventListener('input', (e) => {
  const val = parseInt(e.target.value);
  document.getElementById('menu-music-val').textContent = val;
  audio.setMusicVolume(val / 100);
});

// ─── Global button click sound ───
document.addEventListener('mousedown', (e) => {
  if (e.target.closest('button') || e.target.closest('.toggle-switch')) {
    if (!audio.ctx) {
      audio._initPromise = audio.init().then(() => audio.play('click'));
    } else {
      audio.play('click');
    }
  }
}, true);

// ─── Dev mode ───
let _devBuffer = '';
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (menuOpen) { closeMenu(); return; }
    if (document.getElementById('save-modal').style.display !== 'none') {
      document.getElementById('save-modal').style.display = 'none'; return;
    }
    if (document.getElementById('load-modal').style.display !== 'none') {
      document.getElementById('load-modal').style.display = 'none'; return;
    }
    if (document.getElementById('prestige-modal').style.display !== 'none') {
      document.getElementById('prestige-modal').style.display = 'none'; return;
    }
    if (!document.getElementById('screen-fishing').classList.contains('active')) {
      switchScreen('screen-fishing');
    } else {
      openMenu();
    }
    return;
  }
  if (e.key.length === 1) {
    _devBuffer = (_devBuffer + e.key.toLowerCase()).slice(-8);
    if (_devBuffer.endsWith('lol')) {
      state.gold += 1000000;
      updateAllGoldDisplays();
      checkMilestones();
      _devBuffer = '';
    }
    if (_devBuffer.endsWith('gold')) {
      // Force spawn a golden fish
      const pool = getSpawnPool(state.currentZone);
      const weights = pool.weights;
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total, typeId = pool.fish[0];
      for (let i = 0; i < pool.fish.length; i++) { r -= weights[i]; if (r <= 0) { typeId = pool.fish[i]; break; } }
      const dir = Math.random() < 0.5 ? 1 : -1;
      const baseY = canvasH * 0.1 + Math.random() * canvasH * 0.76;
      const sizeScale = 0.7 + Math.random() * 0.6;
      cv.fish.push({
        id: cv.fishIdCounter++, type: typeId,
        x: dir === 1 ? -80 : canvasW + 80,
        baseY, currentY: baseY, dir,
        waveOffset: Math.random() * Math.PI * 2,
        caught: false, catchAnim: 0, sizeScale, speedScale: 0.8 + Math.random() * 0.4,
        golden: true,
      });
      _devBuffer = '';
    }
    if (_devBuffer.endsWith('frenzy')) {
      const count = 8 + getUpgradeLevel('bf_frenzy_count') * 2;
      for (let i = 0; i < count; i++) spawnFish(true);
      showBlackFishBanner('⚡ FEEDING FRENZY!', `${count} fish spawned!`, '#00ffaa');
      _devBuffer = '';
    }
    if (_devBuffer.endsWith('boon')) {
      state.fishmongerBoonTimer = 10;
      state.sellMultiplier = 3;
      showBlackFishBanner('✧ FISHMONGER\'S BOON!', '3x sell price for 10s', '#ffcc44');
      _devBuffer = '';
    }
    if (_devBuffer.endsWith('chest')) {
      state.treasureChestTimer = 10;
      showBlackFishBanner('★ TREASURE CHEST!', 'All fish spawn golden for 10s', '#ffee44');
      _devBuffer = '';
    }
    if (_devBuffer.endsWith('upgrades')) {
      for (const def of UPGRADES_DEF) {
        state.upgrades[def.id] = def.max;
      }
      for (const def of CONSUMABLES_DEF) {
        state.consumables[def.id] = 10;
      }
      state.stats.totalUpgradesBought = 999;
      state.stats.totalCaught = 5000;
      state.prestige.pearls += 50;
      state.unlockedZones = ZONES.map((_, i) => i);
      state.bossesDefeated = ZONES.map((_, i) => i).filter(i => i > 0);
      updateAllGoldDisplays();
      _devBuffer = '';
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  cv.mouseX = (e.clientX - rect.left) * (canvasW / rect.width);
  cv.mouseY = (e.clientY - rect.top)  * (canvasH / rect.height);
  cv.inCanvas = true;
});
canvas.addEventListener('mouseleave', () => { cv.inCanvas = false; });
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvasW / rect.width);
  const cy = (e.clientY - rect.top)  * (canvasH / rect.height);

  // Boss fight — only harpoon works
  if (state.bossFight) {
    castHarpoon(cx, cy);
    return;
  }

  // Clicking while auto-hook is on sets the target location
  if (state.flags.autoHookEnabled) {
    state.autoHookTarget = { x: cx, y: cy };
    cv.catchFlashes.push({ x: cx, y: cy, timer: 1.2, text: 'AUTO TARGET SET', color: '#44ffaa' });
    return;
  }

  if (clickBlackFish(cx, cy)) return;
  if (clickZoneSpecial(cx, cy)) return;
  const ac = state.activeConsumable;
  if (ac === 'place_net') { placeNet(cx, cy); return; }
  if (ac === 'small_net' || ac === 'big_net') { throwNet(cx, cy, ac); return; }

  // Harpoon mode outside boss — does nothing to fish
  if (state.weaponMode === 'harpoon') return;
  castHook(cx, cy);
});
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvasW / rect.width);
  const cy = (e.clientY - rect.top)  * (canvasH / rect.height);

  // Right-click on placed net to remove it and start 2 min cooldown
  for (let i = cv.placedNets.length - 1; i >= 0; i--) {
    const pn = cv.placedNets[i];
    if (dist(cx, pn.x, cy, pn.y) < pn.radius) {
      cv.placedNets.splice(i, 1);
      state.netCooldown = 120;
      updatePlaceNetBtn();
      return;
    }
  }

  // Right-click retract hook
  if (state.upgrades.instant_retract >= 1 && cv.hook && cv.hook.state !== 'retracting') {
    cv.hook.quickRetract = true;
    cv.hook.state = 'retracting';
  }
});

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  TITLE SCREEN
// ═══════════════════════════════════════════════════════════════

function initTitleScreen() {
  const tc = document.getElementById('title-canvas');
  const tctx = tc.getContext('2d');
  let tW, tH;

  function resizeTitle() {
    tW = window.innerWidth;
    tH = window.innerHeight;
    tc.width = tW;
    tc.height = tH;
  }
  resizeTitle();
  window.addEventListener('resize', resizeTitle);

  const bubbles = [];
  for (let i = 0; i < 40; i++) {
    bubbles.push({
      x: Math.random() * tW,
      y: Math.random() * tH,
      r: 1 + Math.random() * 4,
      speed: 10 + Math.random() * 25,
      opacity: 0.04 + Math.random() * 0.12,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.8 + Math.random() * 2,
    });
  }

  let titleT = 0;
  function drawTitle(ts) {
    const t = ts / 1000;
    const dt = Math.min(t - titleT, 0.1);
    titleT = t;

    // Background gradient
    const bg = tctx.createLinearGradient(0, 0, 0, tH);
    bg.addColorStop(0, '#001108');
    bg.addColorStop(0.4, '#001a0a');
    bg.addColorStop(0.7, '#00120a');
    bg.addColorStop(1, '#000805');
    tctx.fillStyle = bg;
    tctx.fillRect(0, 0, tW, tH);

    // Subtle grid
    tctx.strokeStyle = 'rgba(0,60,30,0.08)';
    tctx.lineWidth = 0.5;
    for (let x = 50; x < tW; x += 50) {
      tctx.beginPath(); tctx.moveTo(x, 0); tctx.lineTo(x, tH); tctx.stroke();
    }
    for (let y = 50; y < tH; y += 50) {
      tctx.beginPath(); tctx.moveTo(0, y); tctx.lineTo(tW, y); tctx.stroke();
    }

    // Light rays from top
    tctx.save();
    for (let i = 0; i < 4; i++) {
      const rx = tW * (0.15 + i * 0.22 + Math.sin(t * 0.15 + i * 1.6) * 0.04);
      const w = tW * 0.06;
      const rayGrad = tctx.createLinearGradient(rx, 0, rx, tH * 0.7);
      rayGrad.addColorStop(0, 'rgba(0,255,136,0.06)');
      rayGrad.addColorStop(1, 'rgba(0,255,136,0)');
      tctx.fillStyle = rayGrad;
      tctx.beginPath();
      tctx.moveTo(rx - w * 0.3, 0);
      tctx.lineTo(rx + w, tH * 0.7);
      tctx.lineTo(rx - w, tH * 0.7);
      tctx.closePath();
      tctx.fill();
    }
    tctx.restore();

    // Bubbles
    for (const b of bubbles) {
      b.y -= b.speed * dt;
      b.x += Math.sin(b.wobble += b.wobbleSpeed * dt) * 0.4;
      if (b.y < -10) { b.y = tH + 10; b.x = Math.random() * tW; }
      tctx.beginPath();
      tctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      tctx.strokeStyle = `rgba(0,255,136,${b.opacity})`;
      tctx.lineWidth = 0.5;
      tctx.stroke();
    }

    // Floating particles
    tctx.save();
    for (let i = 0; i < 15; i++) {
      const px = (tW * ((i * 0.618 + 0.05) % 1.0));
      const py = ((t * 12 * (0.3 + (i % 4) * 0.15) + i * tH / 15) % tH);
      const alpha = 0.05 + Math.abs(Math.sin(t * 0.5 + i)) * 0.1;
      tctx.fillStyle = `rgba(0,255,136,${alpha})`;
      tctx.beginPath();
      tctx.arc(px, py, 1.5, 0, Math.PI * 2);
      tctx.fill();
    }
    tctx.restore();

    if (document.getElementById('screen-title').style.display !== 'none') {
      requestAnimationFrame(drawTitle);
    }
  }

  requestAnimationFrame(drawTitle);
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

let gamePaused = false;

function init() {
  resizeCanvas();
  window.addEventListener('resize', () => setTimeout(resizeCanvas, 40));
  updateZoneOverlay();

  checkMilestones();
  updateAllGoldDisplays();

  currentT = performance.now() / 1000;

  // Auto-save every minute
  startAutoSave();

  // Pause when window is not maximized/focused
  function checkPause() {
    const isMax = document.visibilityState === 'visible' &&
      window.innerWidth >= screen.availWidth * 0.8 &&
      window.innerHeight >= screen.availHeight * 0.8;
    const pauseEl = document.getElementById('pause-overlay');
    if (!isMax && !gamePaused) {
      gamePaused = true;
      pauseEl.style.display = 'flex';
    } else if (isMax && gamePaused && !menuOpen) {
      gamePaused = false;
      pauseEl.style.display = 'none';
      currentT = performance.now() / 1000;
    }
  }
  window.addEventListener('resize', checkPause);
  document.addEventListener('visibilitychange', checkPause);
  setInterval(checkPause, 1000);
}

initTitleScreen();

document.getElementById('btn-title-import').addEventListener('click', () => {
  document.getElementById('load-modal').style.display = 'flex';
});

// Try loading local auto-save on start — skip title if save exists
const hadLocalSave = loadLocalSave();

if (hadLocalSave) {
  // Skip title screen, go straight to game
  document.getElementById('screen-title').style.display = 'none';
  document.getElementById('screen-fishing').classList.add('active');
  // Audio requires user interaction, set up a one-time click handler
  const startAudioOnce = () => {
    if (!audio.ctx) { audio._initPromise = audio.init(); audio._initPromise.then(() => audio.startMusic()); }
    else if (audio._initPromise) audio._initPromise.then(() => audio.startMusic());
    else audio.startMusic();
    document.removeEventListener('click', startAudioOnce);
    document.removeEventListener('keydown', startAudioOnce);
  };
  document.addEventListener('click', startAudioOnce);
  document.addEventListener('keydown', startAudioOnce);
  // Update sliders to match loaded audio prefs
  document.getElementById('menu-sfx-slider').value = Math.round(state.sfxVolume * 100);
  document.getElementById('menu-sfx-val').textContent = Math.round(state.sfxVolume * 100);
  document.getElementById('menu-music-slider').value = Math.round(state.musicVolume * 100);
  document.getElementById('menu-music-val').textContent = Math.round(state.musicVolume * 100);
  init();
  requestAnimationFrame(loop);
  spawnFish(); spawnFish(); spawnFish();
  setTimeout(flashZoneOverlay, 400);
}

document.getElementById('btn-enter').addEventListener('click', () => {
  if (!audio.ctx) { audio._initPromise = audio.init(); audio._initPromise.then(() => audio.startMusic()); }
  else if (audio._initPromise) audio._initPromise.then(() => audio.startMusic());
  else audio.startMusic();
  const titleScreen = document.getElementById('screen-title');
  titleScreen.classList.add('title-fade-out');
  setTimeout(() => {
    titleScreen.style.display = 'none';
    document.getElementById('screen-fishing').classList.add('active');
    init();
    requestAnimationFrame(loop);
    spawnFish(); spawnFish(); spawnFish();
    setTimeout(flashZoneOverlay, 400);
  }, 800);
});
