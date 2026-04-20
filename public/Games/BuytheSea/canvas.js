// ═══════════════════════════════════════════════════════════════
//  CANVAS / LIVE STATE
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');
let canvasW = 0, canvasH = 0, currentT = 0;

const cv = {
  fish: [], hook: null, cooldown: 0,
  mouseX: 0, mouseY: 0, inCanvas: false,
  spawnTimer: 0,
  bubbles: [], bubbleTimer: 0,
  catchFlashes: [],
  ambientTimer: 28,
  fishIdCounter: 0,
  crab: { active: false, rockIdx: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 45 },
  starfish: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  sandDollar: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  reefUrchin: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 45 },
  coralPearl: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  sandFossil: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  mineGem: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  looseTooth: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  cityRelic: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  wallShard: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  screenShake: { x: 0, y: 0 },
  nets: [],
  placedNets: [],
  ships: [], shipTimer: 15,
  abyssCrystal: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  passageKey: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  sirenScale: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 50 },
  twilightOrb: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 55 },
  trenchBone: { active: false, fx: 0, fy: 0, peekAnim: 0, peekDir: 0, lingerTimer: 0, spawnTimer: 60 },
  blackFish: {
    active: false, phase: 'none', // 'fading_in' | 'visible' | 'fading_out'
    x: 0, y: 0, alpha: 0,
    phaseTimer: 0, spawnTimer: 60 + Math.random() * 90,
    dir: 1, wobbleOffset: 0,
  },
  extraHooks: [],
  harpoon: null, // { x, y, tx, ty, ox, oy, state: 'traveling'|'retracting' }
  bossHitFlashes: [],
};

function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  canvasW = wrap.clientWidth  || 800;
  canvasH = wrap.clientHeight || 500;
  canvas.width  = canvasW;
  canvas.height = canvasH;
}

// ═══════════════════════════════════════════════════════════════
//  CANVAS DRAWING
// ═══════════════════════════════════════════════════════════════

function draw() {
  ctx.clearRect(0, 0, canvasW, canvasH);

  const skyH = canvasH * 0.08;
  if (state.currentZone === 0) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, skyH);
    skyGrad.addColorStop(0, '#001122'); skyGrad.addColorStop(1, '#003333');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, canvasW, skyH);
    const bg = ctx.createLinearGradient(0, skyH, 0, canvasH);
    bg.addColorStop(0, '#009966'); bg.addColorStop(0.4, '#006644'); bg.addColorStop(1, '#002e1a');
    ctx.fillStyle = bg; ctx.fillRect(0, skyH, canvasW, canvasH - skyH);
    ctx.strokeStyle = '#006644'; ctx.lineWidth = 0.5;
  } else if (state.currentZone <= 2) {
    const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
    bg.addColorStop(0, '#006644'); bg.addColorStop(0.5, '#004433'); bg.addColorStop(1, '#001e10');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#004422'; ctx.lineWidth = 0.5;
  } else {
    const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
    bg.addColorStop(0, '#003322'); bg.addColorStop(0.5, '#001e10'); bg.addColorStop(1, '#000e05');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.strokeStyle = '#002214'; ctx.lineWidth = 0.5;
  }
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  if (state.currentZone === 0) {
    drawCoastBackground();
    drawWaterSurface(skyH);
    for (const ship of cv.ships) drawShip(ship);
    if (cv.crab.active) {
      const rock = COAST_ROCKS[cv.crab.rockIdx];
      drawCrab(rock.fx * canvasW, canvasH * rock.fy - 18, cv.crab.peekAnim);
    }
  } else if (state.currentZone === 1) {
    drawShallowsBackground();
    if (cv.starfish.active) drawClickStarfish(cv.starfish);
  } else if (state.currentZone === 2) {
    drawSandbankBackground();
    if (cv.sandDollar.active) drawClickSandDollar(cv.sandDollar);
  } else if (state.currentZone === 3) {
    drawReefBackground();
    if (cv.reefUrchin && cv.reefUrchin.active) drawClickReefUrchin(cv.reefUrchin);
  } else if (state.currentZone === 4) {
    drawCoralSprawlBackground();
    if (cv.coralPearl && cv.coralPearl.active) drawClickCoralPearl(cv.coralPearl);
  } else if (state.currentZone === 5) {
    drawSandDunesBackground();
    if (cv.sandFossil && cv.sandFossil.active) drawClickSandFossil(cv.sandFossil);
  } else if (state.currentZone === 6) {
    drawOldMineBackground();
    if (cv.mineGem && cv.mineGem.active) drawClickMineGem(cv.mineGem);
  } else if (state.currentZone === 7) {
    drawSharkDenBackground();
    if (cv.looseTooth && cv.looseTooth.active) drawClickLooseTooth(cv.looseTooth);
  } else if (state.currentZone === 8) {
    drawAbandonedCityBackground();
    if (cv.cityRelic && cv.cityRelic.active) drawClickCityRelic(cv.cityRelic);
  } else if (state.currentZone === 9) {
    drawSeawallBackground();
    if (cv.wallShard && cv.wallShard.active) drawClickWallShard(cv.wallShard);
  } else if (state.currentZone === 10) {
    drawAbyssBackground();
    if (cv.abyssCrystal && cv.abyssCrystal.active) drawClickAbyssCrystal(cv.abyssCrystal);
  } else if (state.currentZone === 11) {
    drawHiddenPassageBackground();
    if (cv.passageKey && cv.passageKey.active) drawClickPassageKey(cv.passageKey);
  } else if (state.currentZone === 12) {
    drawMermaidsLairBackground();
    if (cv.sirenScale && cv.sirenScale.active) drawClickSirenScale(cv.sirenScale);
  } else if (state.currentZone === 13) {
    drawTwilightDepthsBackground();
    if (cv.twilightOrb && cv.twilightOrb.active) drawClickTwilightOrb(cv.twilightOrb);
  } else if (state.currentZone === 14) {
    drawMidnightTrenchBackground();
    if (cv.trenchBone && cv.trenchBone.active) drawClickTrenchBone(cv.trenchBone);
  }

  if (cv.screenShake.x !== 0 || cv.screenShake.y !== 0) {
    ctx.save();
    ctx.translate(cv.screenShake.x, cv.screenShake.y);
  }

  for (const b of cv.bubbles) {
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,255,136,${b.opacity})`; ctx.lineWidth = 0.5; ctx.stroke();
  }

  // Boss fight mode
  if (state.bossFight) {
    drawBoss();
    if (cv.harpoon) drawHarpoon(cv.harpoon);
    drawBossHUD();
    for (const fl of cv.bossHitFlashes) {
      const alpha = Math.min(1, fl.timer * 2);
      const rise = (0.8 - fl.timer) * 40;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 15px "Space Mono",monospace';
      ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 14;
      ctx.textAlign = 'center';
      ctx.fillText(fl.text, fl.x, fl.y - rise);
      ctx.restore();
    }
  } else {
    for (const pn of cv.placedNets) drawPlacedNet(pn);
    if (cv.inCanvas && !cv.hook && cv.cooldown <= 0) drawReticle(cv.mouseX, cv.mouseY);
    for (const f of cv.fish) drawFish(f);
    if (cv.hook) drawHook(cv.hook);
    for (const eh of cv.extraHooks) drawHook(eh);
    for (const net of cv.nets) drawNet(net);
  }

  // Black fish
  if (cv.blackFish.active && !state.bossFight) drawBlackFish();

  if (cv.screenShake.x !== 0 || cv.screenShake.y !== 0) ctx.restore();

  // Rod hub or submarine
  if (state.subMode && state.upgrades.submarine >= 1) {
    drawSubmarine();
  } else {
    drawRodHub();
  }

  for (const fl of cv.catchFlashes) {
    const alpha = Math.min(1, fl.timer * 1.3);
    const rise  = (1.6 - fl.timer) * 44;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 13px "Space Mono",monospace';
    ctx.fillStyle = fl.color; ctx.shadowColor = fl.color; ctx.shadowBlur = 14;
    ctx.textAlign = 'center';
    ctx.fillText(fl.text, Math.max(100, Math.min(canvasW - 100, fl.x)), fl.y - rise - 14);
    ctx.restore();
  }

  if (cv.cooldown > 0 && !state.bossFight) {
    const frac = cv.cooldown / getRecastCooldown();
    const bw = 160, bx = canvasW / 2 - bw / 2, by = canvasH - 78;
    ctx.fillStyle = '#001a08'; ctx.fillRect(bx, by, bw, 7);
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#00ff88'; ctx.fillRect(bx, by, bw * (1 - frac), 7);
    ctx.shadowBlur = 0;
    ctx.font = '10px "Space Mono"'; ctx.fillStyle = '#005530'; ctx.textAlign = 'center';
    ctx.fillText('RELOADING...', canvasW / 2, by - 6);
  }

  // Item 13: show multi-cast remaining time
  if (state.multiCastTimer > 0) {
    ctx.save();
    ctx.font = 'bold 12px "Space Mono"';
    ctx.fillStyle = '#bb77ff'; ctx.shadowColor = '#bb77ff'; ctx.shadowBlur = 10;
    ctx.textAlign = 'center';
    ctx.fillText(`MULTI-CAST: ${Math.ceil(state.multiCastTimer)}s`, canvasW / 2, 28);
    ctx.restore();
  }

  // Black fish effect timers
  let effectY = 48;
  if (state.fishmongerBoonTimer > 0) {
    ctx.save();
    ctx.font = 'bold 13px "Space Mono"';
    ctx.fillStyle = '#ffcc44'; ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.fillText(`✧ FISHMONGER'S BOON ${(state.sellMultiplier || 1).toFixed(1)}x: ${Math.ceil(state.fishmongerBoonTimer)}s`, canvasW / 2, effectY);
    ctx.restore();
    effectY += 20;
  }
  if (state.treasureChestTimer > 0) {
    ctx.save();
    ctx.font = 'bold 13px "Space Mono"';
    ctx.fillStyle = '#ffee44'; ctx.shadowColor = '#ffee44'; ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.fillText(`★ TREASURE CHEST: ${Math.ceil(state.treasureChestTimer)}s`, canvasW / 2, effectY);
    ctx.restore();
    effectY += 20;
  }
  if (state.labSaleTimer > 0) {
    ctx.save();
    ctx.font = 'bold 13px "Space Mono"';
    ctx.fillStyle = '#bb77ff'; ctx.shadowColor = '#bb77ff'; ctx.shadowBlur = 12;
    ctx.textAlign = 'center';
    ctx.fillText(`⬡ LAB SALE -30%: ${Math.ceil(state.labSaleTimer)}s`, canvasW / 2, effectY);
    ctx.restore();
  }

}

// ═══════════════════════════════════════════════════════════════
//  FISH DRAWING
// ═══════════════════════════════════════════════════════════════

function drawBlackFish() {
  const bf = cv.blackFish;
  const bx = bf.x * canvasW;
  const by = bf.y * canvasH;
  const wobbleY = Math.sin(bf.wobbleOffset) * 8;
  const wobbleX = Math.cos(bf.wobbleOffset * 0.7) * 4;
  const fx = bx + wobbleX;
  const fy = by + wobbleY;
  const sz = 22;

  ctx.save();
  ctx.globalAlpha = bf.alpha * 0.85;

  // Dark aura
  const pulse = 0.5 + Math.sin(currentT * 3) * 0.3;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.shadowColor = '#220033';
  ctx.shadowBlur = 30 + pulse * 15;
  ctx.beginPath();
  ctx.arc(fx, fy, sz * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Fish body — dark silhouette
  ctx.shadowColor = '#4400aa';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#0a0010';
  ctx.translate(fx, fy);
  ctx.scale(bf.dir, 1);
  ctx.beginPath();
  ctx.ellipse(0, 0, sz, sz * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0);
  ctx.lineTo(-sz * 1.6, -sz * 0.45);
  ctx.lineTo(-sz * 1.6, sz * 0.45);
  ctx.closePath();
  ctx.fill();

  // Eye — glowing purple
  ctx.shadowColor = '#aa44ff';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#aa44ff';
  ctx.beginPath();
  ctx.arc(sz * 0.4, -sz * 0.08, sz * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Inner eye
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sz * 0.42, -sz * 0.1, sz * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  BOSS DRAWING
// ═══════════════════════════════════════════════════════════════

function drawBoss() {
  const bf = state.bossFight;
  if (!bf) return;
  const boss = bf.bossData;
  const bx = bf.x;
  const by = bf.y + Math.sin(bf.wobble) * 12;
  const sz = boss.size;

  ctx.save();

  // Aura
  const pulse = 0.4 + Math.sin(currentT * 2) * 0.2;
  ctx.fillStyle = boss.color + '15';
  ctx.shadowColor = boss.color;
  ctx.shadowBlur = 40 + pulse * 20;
  ctx.beginPath();
  ctx.arc(bx, by, sz * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.shadowBlur = 20;
  ctx.fillStyle = boss.color + 'cc';
  ctx.translate(bx, by);
  ctx.scale(bf.dir, 1);

  // Main body ellipse
  ctx.beginPath();
  ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head plate
  ctx.fillStyle = boss.color;
  ctx.beginPath();
  ctx.ellipse(sz * 0.5, 0, sz * 0.35, sz * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.fillStyle = boss.color + 'aa';
  ctx.beginPath();
  ctx.moveTo(-sz * 0.8, 0);
  ctx.lineTo(-sz * 1.5, -sz * 0.5);
  ctx.quadraticCurveTo(-sz * 1.7, 0, -sz * 1.5, sz * 0.5);
  ctx.closePath();
  ctx.fill();

  // Dorsal fin
  ctx.beginPath();
  ctx.moveTo(-sz * 0.2, -sz * 0.45);
  ctx.lineTo(sz * 0.1, -sz * 0.85);
  ctx.lineTo(sz * 0.4, -sz * 0.4);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sz * 0.55, -sz * 0.1, sz * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#110022';
  ctx.beginPath();
  ctx.arc(sz * 0.57, -sz * 0.1, sz * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Teeth/spikes
  ctx.fillStyle = boss.color;
  ctx.shadowBlur = 0;
  for (let i = 0; i < 4; i++) {
    const tx = sz * 0.7 + i * 4;
    ctx.beginPath();
    ctx.moveTo(tx, sz * 0.15);
    ctx.lineTo(tx + 3, sz * 0.3);
    ctx.lineTo(tx - 2, sz * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Hit flash (white overlay on damage)
  if (bf.hitFlash > 0) {
    ctx.save();
    ctx.globalAlpha = bf.hitFlash * 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(bx, by, sz * 1.2, sz * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawBossHUD() {
  const bf = state.bossFight;
  if (!bf) return;
  const boss = bf.bossData;

  // Health bar at top
  const barW = Math.min(canvasW * 0.6, 500);
  const barH = 16;
  const barX = (canvasW - barW) / 2;
  const barY = 20;
  const hpFrac = bf.hp / bf.maxHp;

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.strokeStyle = boss.color + '88';
  ctx.lineWidth = 2;
  ctx.fillRect(barX, barY, barW, barH);
  ctx.strokeRect(barX, barY, barW, barH);

  // Fill
  const grad = ctx.createLinearGradient(barX, barY, barX + barW * hpFrac, barY);
  grad.addColorStop(0, boss.color);
  grad.addColorStop(1, boss.color + '88');
  ctx.fillStyle = grad;
  ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpFrac, barH - 2);

  // Glow
  ctx.shadowColor = boss.color;
  ctx.shadowBlur = 10;
  ctx.fillRect(barX + 1, barY + 1, (barW - 2) * hpFrac, barH - 2);
  ctx.shadowBlur = 0;

  // Boss name
  ctx.save();
  ctx.font = 'bold 12px "Space Mono",monospace';
  ctx.fillStyle = boss.color;
  ctx.shadowColor = boss.color;
  ctx.shadowBlur = 8;
  ctx.textAlign = 'center';
  ctx.fillText(boss.name, canvasW / 2, barY - 5);
  ctx.restore();

  // HP text
  ctx.save();
  ctx.font = '10px "Space Mono",monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(bf.hp)} / ${bf.maxHp}`, canvasW / 2, barY + barH + 14);
  ctx.restore();

  // Timer
  ctx.save();
  const timerColor = bf.timer <= 10 ? '#ff4444' : '#ffcc44';
  ctx.font = 'bold 14px "Space Mono",monospace';
  ctx.fillStyle = timerColor;
  ctx.shadowColor = timerColor;
  ctx.shadowBlur = 10;
  ctx.font = 'bold 28px "Space Mono",monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(bf.timer)}s`, canvasW / 2, canvasH / 2);
  ctx.restore();
}

function drawHarpoon(h) {
  ctx.save();
  const angle = Math.atan2(h.ty - h.oy, h.tx - h.ox);

  ctx.translate(h.x, h.y);
  ctx.rotate(angle);

  // Shaft
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ffaa44';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(10, 0);
  ctx.stroke();

  // Harpoon head
  ctx.fillStyle = '#ffaa44';
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(6, -5);
  ctx.lineTo(8, 0);
  ctx.lineTo(6, 5);
  ctx.closePath();
  ctx.fill();

  // Barbs
  ctx.strokeStyle = '#ffaa44';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(6, -5);
  ctx.lineTo(2, -2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, 5);
  ctx.lineTo(2, 2);
  ctx.stroke();

  ctx.restore();

  // Trail line
  ctx.save();
  ctx.strokeStyle = 'rgba(255,170,68,0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(h.ox, h.oy);
  ctx.lineTo(h.x, h.y);
  ctx.stroke();
  ctx.restore();
}

function drawFish(f) {
  // Golden fish: draw pulsing outer aura before the fish itself
  if (f.golden) {
    ctx.save();
    const pulse = 0.6 + Math.sin(currentT * 4 + f.waveOffset) * 0.4;
    ctx.globalAlpha = 0.25 * pulse;
    ctx.fillStyle = '#ffee44';
    ctx.shadowColor = '#ffee44';
    ctx.shadowBlur = 50;
    ctx.beginPath();
    ctx.arc(f.x, f.currentY, (FISH[f.type].size || 20) * (f.sizeScale || 1) * 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Star sparkles around golden fish
    ctx.globalAlpha = 0.7 * pulse;
    ctx.font = 'bold 10px "Space Mono"';
    ctx.fillStyle = '#ffee88';
    ctx.shadowBlur = 12;
    for (let i = 0; i < 3; i++) {
      const angle = currentT * 2.5 + i * (Math.PI * 2 / 3) + f.waveOffset;
      const dist = (FISH[f.type].size || 20) * (f.sizeScale || 1) * 1.6;
      const sx = f.x + Math.cos(angle) * dist;
      const sy = f.currentY + Math.sin(angle) * dist * 0.6;
      ctx.fillText('*', sx - 3, sy + 4);
    }
    ctx.restore();
  }

  const shape = FISH[f.type].shape || 'fish';
  if (shape === 'eel')    return drawEel(f);
  if (shape === 'shark')  return drawShark(f);
  if (shape === 'blob')   return drawBlob(f);
  if (shape === 'flat')   return drawFlat(f);
  if (shape === 'slim')   return drawSlim(f);
  if (shape === 'jaw')    return drawJaw(f);
  if (shape === 'clown')  return drawClown(f);
  if (shape === 'puffer') return drawPuffer(f);
  if (shape === 'crab')      return drawCrabFish(f);
  if (shape === 'jellyfish') return drawJellyfish(f);
  if (shape === 'angler')    return drawAngler(f);
  drawDefaultFish(f);
}

function fishTransform(f) {
  const alpha = f.caught ? Math.max(0, 1 - f.catchAnim) : 1;
  const yOff  = f.caught ? -f.catchAnim * 36 : 0;
  const baseSc = f.sizeScale || 1;
  const sc    = f.caught ? baseSc * (1 + f.catchAnim * 0.5) : baseSc;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  ctx.scale(sc * f.dir, sc);
  return { alpha, sc, golden: f.golden };
}

function drawDefaultFish(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.43, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0); ctx.lineTo(-sz * 1.65, -sz * 0.46); ctx.lineTo(-sz * 1.65, sz * 0.46);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.1, -sz * 0.43); ctx.lineTo(sz * 0.2, -sz * 0.88); ctx.lineTo(sz * 0.5, -sz * 0.43);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = '#000a03';
  ctx.beginPath(); ctx.arc(sz * 0.44, -sz * 0.1, sz * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = rc.eye; ctx.shadowBlur = 8; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.44, -sz * 0.1, sz * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSlim(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 10; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.2, sz * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 1.1, 0); ctx.lineTo(-sz * 2.0, -sz * 0.35); ctx.lineTo(-sz * 2.0, sz * 0.35);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.7, 0, sz * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawJaw(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000500';
  ctx.beginPath(); ctx.ellipse(sz * 0.6, sz * 0.2, sz * 0.55, sz * 0.25, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(sz * 0.55, sz * 0.08, sz * 0.5, sz * 0.15, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 0.8, 0); ctx.lineTo(-sz * 1.6, -sz * 0.5); ctx.lineTo(-sz * 1.6, sz * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.25, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawEel(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const alpha = f.caught ? Math.max(0, 1 - f.catchAnim) : 1;
  const yOff  = f.caught ? -f.catchAnim * 36 : 0;
  const baseSc = f.sizeScale || 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  ctx.scale(f.dir * baseSc, baseSc);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 10; ctx.strokeStyle = rc.color;
  ctx.lineWidth = sz * 0.32;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const segs = 8, len = sz * 2.8;
  ctx.moveTo(len * 0.5, 0);
  for (let i = 1; i <= segs; i++) {
    const p = i / segs;
    const wx = Math.sin(currentT * 3.5 + p * 4 + f.waveOffset) * sz * 0.6 * p;
    ctx.lineTo(len * 0.5 - len * p, wx);
  }
  ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(len * 0.45, -sz * 0.1, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawShark(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 16; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.4, sz * 0.38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 1.3, 0);
  ctx.lineTo(-sz * 2.2, -sz * 0.65); ctx.lineTo(-sz * 1.6, 0);
  ctx.lineTo(-sz * 2.2,  sz * 0.65); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 0.2, -sz * 0.38);
  ctx.lineTo(sz * 0.4, -sz * 1.2);
  ctx.lineTo(sz * 0.8, -sz * 0.38);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha * 0.7;
  ctx.beginPath();
  ctx.moveTo(0, sz * 0.2);
  ctx.lineTo(-sz * 0.4, sz * 0.85);
  ctx.lineTo(sz * 0.5, sz * 0.3);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.8, -sz * 0.1, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.8, -sz * 0.1, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBlob(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 18; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha * 0.5; ctx.fillStyle = rc.glow;
  ctx.beginPath(); ctx.arc(-sz * 0.3, -sz * 0.2, sz * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rc.color;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.9, 0); ctx.lineTo(-sz * 1.5, -sz * 0.5); ctx.lineTo(-sz * 1.5, sz * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  const eyePos = [{ x: sz*0.3, y: -sz*0.3 }, { x: sz*0.6, y: sz*0.1 }, { x: sz*0.1, y: sz*0.4 }];
  for (const ep of eyePos) {
    ctx.fillStyle = '#000500';
    ctx.beginPath(); ctx.arc(ep.x, ep.y, sz * 0.13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rc.eye;
    ctx.beginPath(); ctx.arc(ep.x, ep.y, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFlat(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12; ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.3, sz * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-sz * 1.2, 0); ctx.lineTo(-sz * 2.0, -sz * 0.6); ctx.lineTo(-sz * 2.0, sz * 0.6);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = alpha * 0.65;
  ctx.beginPath(); ctx.ellipse(0, sz * 0.55, sz * 0.9, sz * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -sz * 0.55, sz * 0.9, sz * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 0; ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.7, -sz * 0.05, sz * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Item 15: Clown fish shape ──
function drawClown(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12;
  // body - orange with white stripes (golden override)
  ctx.fillStyle = f.golden ? '#ffcc44' : '#ff8833';
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  // white stripes
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = alpha * 0.7;
  ctx.fillRect(-sz * 0.1, -sz * 0.5, sz * 0.15, sz);
  ctx.fillRect(sz * 0.4, -sz * 0.45, sz * 0.12, sz * 0.9);
  ctx.globalAlpha = alpha;
  // tail
  ctx.fillStyle = f.golden ? '#ddaa22' : '#ff6622';
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0); ctx.lineTo(-sz * 1.5, -sz * 0.5); ctx.lineTo(-sz * 1.5, sz * 0.5);
  ctx.closePath(); ctx.fill();
  // eye
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.5, -sz * 0.1, sz * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(sz * 0.5, -sz * 0.1, sz * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Item 15: Puffer fish shape ──
function drawPuffer(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 14;
  // round puffy body
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
  // spines
  ctx.strokeStyle = rc.color; ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * sz * 0.9, Math.sin(a) * sz * 0.9);
    ctx.lineTo(Math.cos(a) * sz * 1.35, Math.sin(a) * sz * 1.35);
    ctx.stroke();
  }
  // belly highlight
  ctx.globalAlpha = alpha * 0.3; ctx.fillStyle = '#ffffcc';
  ctx.beginPath(); ctx.ellipse(0, sz * 0.3, sz * 0.6, sz * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = alpha;
  // small tail
  ctx.fillStyle = rc.color;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.85, 0); ctx.lineTo(-sz * 1.4, -sz * 0.35); ctx.lineTo(-sz * 1.4, sz * 0.35);
  ctx.closePath(); ctx.fill();
  // eye
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.4, -sz * 0.2, sz * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.4, -sz * 0.2, sz * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ── Item 15: Swimming crab shape (for blister_crab) ──
function drawCrabFish(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 12;
  // body
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.strokeStyle = rc.color; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = -sz * 0.4 + i * sz * 0.4;
    ctx.beginPath(); ctx.moveTo(lx, sz * 0.4); ctx.lineTo(lx - 4, sz * 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, -sz * 0.4); ctx.lineTo(lx - 4, -sz * 0.9); ctx.stroke();
  }
  // claws
  ctx.beginPath(); ctx.ellipse(sz * 0.9, -sz * 0.4, sz * 0.3, sz * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(sz * 0.9, sz * 0.4, sz * 0.3, sz * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  // eyes
  ctx.shadowBlur = 0; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.3, -sz * 0.25, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.3, sz * 0.25, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.3, -sz * 0.25, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.3, sz * 0.25, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  HOOK / RETICLE / NET DRAWING
// ═══════════════════════════════════════════════════════════════

function drawRodHub() {
  const cx = canvasW / 2;
  const cy = canvasH;
  const rw = 60, rh = 34;
  ctx.save();
  // Dark filled semi-circle
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw, rh, 0, Math.PI, 0);
  ctx.closePath();
  const hubGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw);
  hubGrad.addColorStop(0, '#041a0c');
  hubGrad.addColorStop(1, '#010a04');
  ctx.fillStyle = hubGrad;
  ctx.fill();
  // Border arc
  ctx.beginPath();
  ctx.ellipse(cx, cy, rw, rh, 0, Math.PI, 0);
  ctx.strokeStyle = '#007744';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 8;
  ctx.stroke();
  // Small rod tip indicator dot
  ctx.beginPath();
  ctx.arc(cx, cy - rh + 4, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.restore();
}

function drawSubmarine() {
  const sx = state.subX * canvasW;
  const sy = state.subY * canvasH;
  const sz = 28;

  ctx.save();
  // Hull
  ctx.fillStyle = '#334455';
  ctx.shadowColor = '#44aaff';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.ellipse(sx, sy, sz * 1.8, sz * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top hull
  ctx.fillStyle = '#445566';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.ellipse(sx, sy - sz * 0.3, sz * 1.2, sz * 0.45, 0, Math.PI, 0);
  ctx.fill();

  // Conning tower
  ctx.fillStyle = '#556677';
  ctx.fillRect(sx - 8, sy - sz * 0.9, 16, sz * 0.4);

  // Periscope
  ctx.strokeStyle = '#778899';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy - sz * 0.9);
  ctx.lineTo(sx, sy - sz * 1.3);
  ctx.lineTo(sx + 6, sy - sz * 1.3);
  ctx.stroke();

  // Propeller
  const propX = sx - sz * 1.8;
  ctx.strokeStyle = '#88aacc';
  ctx.lineWidth = 2;
  const propAngle = currentT * 8;
  for (let i = 0; i < 3; i++) {
    const a = propAngle + i * (Math.PI * 2 / 3);
    ctx.beginPath();
    ctx.moveTo(propX, sy);
    ctx.lineTo(propX + Math.cos(a) * 8, sy + Math.sin(a) * 8);
    ctx.stroke();
  }

  // Window
  ctx.fillStyle = '#88ccff';
  ctx.shadowColor = '#88ccff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(sx + sz * 0.6, sy - sz * 0.05, sz * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Rod tip indicator on bottom of sub
  ctx.beginPath();
  ctx.arc(sx, sy + sz * 0.7, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 12;
  ctx.fill();

  ctx.restore();
}

function drawHook(h) {
  const hx = h.x;
  const hy = h.y;
  const col = '#00ff88';
  const lineCol = 'rgba(0,255,136,0.25)';

  ctx.save();
  ctx.strokeStyle = lineCol; ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.moveTo(h.ox, h.oy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  const s = 12;
  ctx.beginPath();
  ctx.moveTo(hx-s, hy); ctx.lineTo(hx+s, hy);
  ctx.moveTo(hx, hy-s); ctx.lineTo(hx, hy+s);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawReticle(mx, my) {
  ctx.save();
  const ac = state.activeConsumable;
  const netDef = ac && (ac === 'small_net' || ac === 'big_net') ? CONSUMABLES_MAP[ac] : null;

  if (ac === 'place_net') {
    const r = getNetRadius();
    ctx.strokeStyle = 'rgba(68,255,170,0.4)'; ctx.lineWidth = 1.2;
    ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 10;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 0.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath(); ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(a) * r, my + Math.sin(a) * r); ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (netDef) {
    ctx.strokeStyle = 'rgba(68,255,170,0.5)'; ctx.lineWidth = 1.5;
    ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 12;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(mx, my, netDef.netRadius, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = 'rgba(0,255,136,0.16)'; ctx.lineWidth = 1;
  ctx.setLineDash([5, 9]);
  ctx.beginPath(); ctx.moveTo(canvasW/2, canvasH - 30); ctx.lineTo(mx, my); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(0,255,136,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(mx, my, getCatchRadius(), 0, Math.PI*2); ctx.stroke();
  ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(0,255,136,0.58)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(mx, my, 13, 0, Math.PI*2); ctx.stroke();
  const r=13, g=7;
  ctx.strokeStyle = 'rgba(0,255,136,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mx-r-g,my); ctx.lineTo(mx+r+g,my);
  ctx.moveTo(mx,my-r-g); ctx.lineTo(mx,my+r+g);
  ctx.stroke();
  ctx.restore();
}

function drawNet(net) {
  const progress = 1 - net.timer / net.maxTimer;
  const r = net.radius * (0.25 + progress * 0.75);
  const alpha = (net.timer / net.maxTimer) * 0.8;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#44ffaa'; ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 16;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(net.x, net.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 0.8; ctx.shadowBlur = 6;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
    ctx.beginPath();
    ctx.moveTo(net.x, net.y);
    ctx.lineTo(net.x + Math.cos(a) * r, net.y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(net.x, net.y, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawPlacedNet(pn) {
  const r = pn.radius;
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#44ffaa'; ctx.shadowColor = '#44ffaa'; ctx.shadowBlur = 10;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(pn.x, pn.y, r, 0, Math.PI * 2); ctx.stroke();
  // net mesh
  ctx.lineWidth = 0.6; ctx.shadowBlur = 4;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(pn.x, pn.y);
    ctx.lineTo(pn.x + Math.cos(a) * r, pn.y + Math.sin(a) * r);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(pn.x, pn.y, r * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(pn.x, pn.y, r * 0.75, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawJellyfish(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const alpha = f.caught ? Math.max(0, 1 - f.catchAnim) : 1;
  const yOff = f.caught ? -f.catchAnim * 36 : 0;
  const baseSc = f.sizeScale || 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.currentY + yOff);
  ctx.scale(baseSc, baseSc);
  // Dome
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 20;
  ctx.fillStyle = rc.color;
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 0.9, sz * 0.7, 0, Math.PI, 0); ctx.fill();
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = rc.glow;
  ctx.beginPath(); ctx.ellipse(0, -sz * 0.15, sz * 0.6, sz * 0.4, 0, Math.PI, 0); ctx.fill();
  ctx.globalAlpha = alpha;
  // Tentacles
  ctx.strokeStyle = rc.color; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.shadowBlur = 8;
  for (let i = 0; i < 5; i++) {
    const tx = (i - 2) * sz * 0.35;
    ctx.beginPath(); ctx.moveTo(tx, sz * 0.05);
    const wave = Math.sin(currentT * 3 + i * 1.2 + f.waveOffset);
    ctx.quadraticCurveTo(tx + wave * 8, sz * 0.5, tx + wave * 12, sz * 1.2);
    ctx.stroke();
  }
  // Eyes
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(-sz * 0.2, -sz * 0.15, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.2, -sz * 0.15, sz * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(-sz * 0.2, -sz * 0.15, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.2, -sz * 0.15, sz * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawAngler(f) {
  const def = FISH[f.type], rc = RARITY_COLORS[def.rarity], sz = def.size;
  const { alpha } = fishTransform(f);
  // Dark body
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 10;
  ctx.fillStyle = rc.color;
  ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.1, sz * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  // Huge mouth
  ctx.fillStyle = '#000500';
  ctx.beginPath();
  ctx.ellipse(sz * 0.6, sz * 0.1, sz * 0.6, sz * 0.4, 0.2, 0, Math.PI * 2); ctx.fill();
  // Teeth
  ctx.fillStyle = '#ddeedd';
  ctx.shadowBlur = 0;
  for (let i = 0; i < 5; i++) {
    const a = -0.6 + i * 0.3;
    const tx = sz * 0.6 + Math.cos(a) * sz * 0.55;
    const ty = sz * 0.1 + Math.sin(a) * sz * 0.35;
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(tx + 3, ty + (a < 0 ? 6 : -6)); ctx.lineTo(tx - 3, ty + (a < 0 ? 6 : -6));
    ctx.closePath(); ctx.fill();
  }
  // Tail
  ctx.fillStyle = rc.color;
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(-sz * 1.0, 0); ctx.lineTo(-sz * 1.7, -sz * 0.5); ctx.lineTo(-sz * 1.7, sz * 0.5);
  ctx.closePath(); ctx.fill();
  // Lure - dangling light on stalk
  const lureWave = Math.sin(currentT * 3 + f.waveOffset) * 5;
  const lureX = sz * 0.3 + lureWave;
  const lureY = -sz * 0.8 - Math.abs(Math.sin(currentT * 2)) * 4;
  ctx.strokeStyle = rc.color; ctx.lineWidth = 1; ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(sz * 0.2, -sz * 0.5);
  ctx.quadraticCurveTo(sz * 0.1, -sz * 0.7, lureX, lureY);
  ctx.stroke();
  // Glowing lure bulb
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.arc(lureX, lureY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = rc.glow; ctx.shadowBlur = 40;
  ctx.beginPath(); ctx.arc(lureX, lureY, 3, 0, Math.PI * 2); ctx.fill();
  // Eye
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.2, sz * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rc.eye;
  ctx.beginPath(); ctx.arc(sz * 0.1, -sz * 0.2, sz * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
