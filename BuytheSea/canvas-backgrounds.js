// ═══════════════════════════════════════════════════════════════
//  ZONE BACKGROUNDS & CLICKABLE SPECIALS
//  Separated from canvas.js for organization
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  COAST ZONE DRAWING
// ═══════════════════════════════════════════════════════════════

function drawCoastBackground() {
  const sandY = canvasH * COAST_SAND_LEVEL;
  const t = currentT;

  ctx.save();
  for (let i = 0; i < 5; i++) {
    const rx = canvasW * (0.08 + i * 0.21 + Math.sin(t * 0.22 + i * 1.4) * 0.03);
    const w  = canvasW * 0.065;
    const rayGrad = ctx.createLinearGradient(rx, 0, rx, sandY);
    rayGrad.addColorStop(0, 'rgba(80,255,160,0.08)');
    rayGrad.addColorStop(1, 'rgba(80,255,160,0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(rx - w * 0.4, 0); ctx.lineTo(rx + w, sandY); ctx.lineTo(rx - w, sandY);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  ctx.save();
  const sandGrad = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sandGrad.addColorStop(0, '#141f0d'); sandGrad.addColorStop(1, '#080f06');
  ctx.fillStyle = sandGrad;
  ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  drawCoral(canvasW * 0.07, sandY, 0.85, '#ff5533', '#ff8855');
  drawCoral(canvasW * 0.22, sandY, 0.60, '#ff3377', '#ff77aa');
  drawCoral(canvasW * 0.63, sandY, 0.90, '#ff5533', '#ffaa55');
  drawCoral(canvasW * 0.88, sandY, 0.70, '#33cc77', '#55ffaa');

  drawSeaweed(canvasW * 0.38, sandY, 55, '#00aa44');
  drawSeaweed(canvasW * 0.41, sandY, 40, '#008833');
  drawSeaweed(canvasW * 0.94, sandY, 62, '#00bb55');

  for (const rock of COAST_ROCKS) {
    drawRock(rock.fx * canvasW, canvasH * rock.fy);
  }

  drawStarfish(canvasW * 0.32, sandY + 12, 8, '#ff8844');
  drawStarfish(canvasW * 0.47, sandY + 8,  6, '#ff6622');
  drawStarfish(canvasW * 0.70, sandY + 14, 9, '#ff9933');
  drawStarfish(canvasW * 0.90, sandY + 10, 7, '#ffbb44');

  ctx.save();
  ctx.strokeStyle = 'rgba(0,180,80,0.3)'; ctx.lineWidth = 1.2;
  for (const [sx, sy] of [[0.2, sandY+16], [0.58, sandY+20], [0.77, sandY+14]]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(canvasW * sx + i * 7, sy, 4, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Extra coast decor: small pebbles
  ctx.save();
  ctx.fillStyle = 'rgba(30,45,20,0.4)';
  const pebbles = [0.12, 0.25, 0.43, 0.55, 0.72, 0.85];
  for (let i = 0; i < pebbles.length; i++) {
    const px = canvasW * pebbles[i];
    const py = sandY + 6 + (i % 3) * 5;
    ctx.beginPath();
    ctx.ellipse(px, py, 3 + (i % 2) * 2, 2, (i * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Small floating particles near surface
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const px = canvasW * ((i * 0.17 + 0.05 + Math.sin(t * 0.3 + i * 2) * 0.02));
    const py = canvasH * 0.08 + Math.sin(t * 0.5 + i * 1.8) * 15;
    ctx.fillStyle = `rgba(80,255,160,${0.06 + Math.abs(Math.sin(t * 0.4 + i)) * 0.06})`;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawCoral(x, baseY, scale, color1, color2) {
  ctx.save();
  ctx.translate(x, baseY);
  function branch(fx, fy, angle, len, depth) {
    if (len < 5) return;
    const tx = fx + Math.cos(angle) * len;
    const ty = fy - Math.abs(Math.sin(angle)) * len;
    ctx.strokeStyle = depth > 1 ? color1 : color2;
    ctx.lineWidth = Math.max(1.5, depth * 2.2);
    ctx.shadowColor = color2; ctx.shadowBlur = depth * 4;
    ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke();
    if (depth <= 1) {
      ctx.fillStyle = color2; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    branch(tx, ty, angle + 0.55, len * 0.65, depth - 1);
    branch(tx, ty, angle - 0.45, len * 0.62, depth - 1);
  }
  branch(0, 0, Math.PI / 2, 55 * scale, 3);
  ctx.restore();
}

function drawSeaweed(x, baseY, height, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.shadowColor = color; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.moveTo(x, baseY);
  for (let i = 1; i <= 10; i++) {
    const p = i / 10;
    ctx.lineTo(x + Math.sin(currentT * 1.3 + p * 5) * 10 * p, baseY - height * p);
  }
  ctx.stroke(); ctx.restore();
}

function drawRock(x, y) {
  ctx.save();
  ctx.fillStyle = '#060e06';
  ctx.beginPath(); ctx.ellipse(x + 3, y + 6, 34, 16, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0e1e0e'; ctx.shadowColor = '#001a0a'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.ellipse(x, y, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#131f10'; ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.ellipse(x - 6, y - 5, 17, 8, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCrab(x, rockTopY, peekAnim) {
  const yOff  = (1 - peekAnim) * 40;
  const alpha = Math.min(1, peekAnim * 3.5);
  if (alpha <= 0.01) return;
  const cy = rockTopY - 12 + yOff;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, cy);

  ctx.strokeStyle = '#1144aa'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const lx = -6 + i * 6;
    ctx.beginPath(); ctx.moveTo(lx - 12, 4); ctx.lineTo(lx - 21, 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-lx + 12, 4); ctx.lineTo(-lx + 21, 14); ctx.stroke();
  }

  ctx.fillStyle = '#1155cc'; ctx.shadowColor = '#4499ff'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.ellipse(-22, -4, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(22, -4, 7, 5, 0.3, 0, Math.PI * 2); ctx.fill();

  ctx.shadowBlur = 0; ctx.strokeStyle = '#1155cc'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(-5, -17); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, -10); ctx.lineTo(5, -17); ctx.stroke();

  ctx.fillStyle = '#000a22';
  ctx.beginPath(); ctx.arc(-5, -17, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -17, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22aaff';
  ctx.beginPath(); ctx.arc(-5, -17, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -17, 1.8, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

function drawStarfish(x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
  ctx.translate(x, y);
  ctx.rotate(currentT * 0.05);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const b = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(b) * r * 0.42, Math.sin(b) * r * 0.42);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawClickStarfish(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 20;
  // Item 16: platform rock
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = '#0c1a0c';
  ctx.beginPath(); ctx.ellipse(x, y + 16, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ff6644';
  ctx.shadowColor = '#ff8866';
  ctx.shadowBlur = 12;
  ctx.translate(x, y);
  ctx.rotate(Math.sin(currentT * 0.5) * 0.1);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const b = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
    ctx.lineTo(Math.cos(b) * 6, Math.sin(b) * 6);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawClickSandDollar(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 15;
  // Item 16: platform rock
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;
  ctx.fillStyle = '#131508';
  ctx.beginPath(); ctx.ellipse(x, y + 14, 20, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#997755';
  ctx.shadowColor = '#bbaa88';
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#bbaa88'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaterSurface(y) {
  const t = currentT;
  ctx.save();
  ctx.shadowColor = '#44ffbb'; ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(80,255,180,0.5)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= canvasW; x += 4) {
    const wy = y + Math.sin(x * 0.025 + t * 1.1) * 3 + Math.sin(x * 0.06 + t * 0.7) * 1.5;
    x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(80,255,180,0.18)'; ctx.lineWidth = 1; ctx.shadowBlur = 0;
  ctx.beginPath();
  for (let x = 0; x <= canvasW; x += 4) {
    const wy = y + 7 + Math.sin(x * 0.04 + t * 0.85 + 1.5) * 2;
    x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
  }
  ctx.stroke();
  ctx.restore();
}

function drawShip(ship) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.scale(ship.dir * ship.size, ship.size);
  ctx.fillStyle = 'rgba(0,15,8,0.85)';
  ctx.shadowColor = '#002211'; ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(-55, 0); ctx.lineTo(-48, 12); ctx.lineTo(55, 12); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill();
  ctx.fillRect(-18, -18, 38, 18);
  ctx.fillStyle = 'rgba(0,20,10,0.95)';
  ctx.fillRect(-1, -46, 3, 28);
  ctx.fillStyle = 'rgba(0,15,8,0.85)';
  ctx.fillRect(-8, -30, 18, 12);
  ctx.restore();
}

// ─── Zone 1: The Shallows ───────────────────────────────────────
function drawShallowsBackground() {
  const sandY = canvasH * 0.87;
  const t = currentT;

  ctx.save();
  const sg = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sg.addColorStop(0, '#16200e'); sg.addColorStop(1, '#0a1208');
  ctx.fillStyle = sg; ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(0,180,80,0.07)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const ry = sandY + 10 + i * 16;
    ctx.beginPath();
    for (let x = 0; x < canvasW; x += 4) {
      const y = ry + Math.sin(x * 0.06 + t * 0.4 + i) * 3;
      i === 0 && x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  drawSeaweed(canvasW * 0.12, sandY, 45, '#007733');
  drawSeaweed(canvasW * 0.15, sandY, 32, '#006622');
  drawSeaweed(canvasW * 0.55, sandY, 50, '#008844');
  drawSeaweed(canvasW * 0.72, sandY, 38, '#007733');
  drawSeaweed(canvasW * 0.75, sandY, 26, '#005522');

  ctx.save();
  ctx.fillStyle = '#0c1a0c'; ctx.shadowColor = '#001a0a'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.ellipse(canvasW * 0.28, sandY + 8, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(canvasW * 0.68, sandY + 6, 14, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(canvasW * 0.88, sandY + 10, 22, 11, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  for (const ax of [0.3, 0.5, 0.7, 0.9]) {
    drawAnemone(canvasW * ax, sandY, '#88ffcc');
  }

  // Extra shallows decor: small coral clusters
  drawCoral(canvasW * 0.35, sandY, 0.45, '#33bb77', '#55ddaa');
  drawCoral(canvasW * 0.82, sandY, 0.55, '#44cc88', '#66eebb');

  // Small shells scattered on sand
  ctx.save();
  ctx.strokeStyle = 'rgba(0,180,100,0.25)'; ctx.lineWidth = 1;
  for (const [sx, sy] of [[0.18, sandY+10], [0.45, sandY+7], [0.62, sandY+12], [0.8, sandY+8]]) {
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(canvasW * sx + i * 5, sy, 3, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Floating particles (non-catchable decor)
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const px = (canvasW * ((i * 0.618 + 0.05) % 1.0));
    const py = ((currentT * 12 * (0.4 + (i % 3) * 0.2) + i * canvasH / 8) % (canvasH * 0.8));
    const alpha = 0.08 + Math.abs(Math.sin(currentT * 0.6 + i)) * 0.15;
    ctx.fillStyle = `rgba(100,255,200,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawAnemone(x, baseY, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.shadowColor = color; ctx.shadowBlur = 6;
  const t = currentT;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const len = 14 + Math.sin(t * 1.5 + i) * 5;
    const wx  = Math.sin(t * 1.2 + i * 0.8) * 4;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + wx, baseY - len * 0.6, x + Math.cos(angle) * 8, baseY - len);
    ctx.stroke();
    ctx.fillStyle = color; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(x + Math.cos(angle) * 8, baseY - len, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Zone 2: The Sandbank ───────────────────────────────────────
function drawSandbankBackground() {
  const sandY = canvasH * 0.82;
  const t = currentT;

  ctx.save();
  const sg = ctx.createLinearGradient(0, sandY, 0, canvasH);
  sg.addColorStop(0, '#181a09'); sg.addColorStop(1, '#0a0d04');
  ctx.fillStyle = sg; ctx.fillRect(0, sandY, canvasW, canvasH - sandY);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#131508';
  for (let i = 0; i < 4; i++) {
    const dx = canvasW * (0.1 + i * 0.25);
    ctx.beginPath();
    ctx.ellipse(dx, sandY + 2, canvasW * 0.12, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const cx of [0.08, 0.35, 0.62, 0.91]) {
    drawCrystal(canvasW * cx, sandY);
  }

  ctx.save();
  ctx.fillStyle = 'rgba(0,80,30,0.25)'; ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 12;
  for (let i = 0; i < 6; i++) {
    const bx = canvasW * (0.05 + i * 0.18);
    ctx.beginPath();
    ctx.ellipse(bx, sandY + 28, 20 + Math.sin(i * 2.3) * 8, 14, Math.sin(i) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Item 16: floating sand particles
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const px = (canvasW * ((i * 0.37 + 0.12) % 1.0));
    const py = ((currentT * 8 * (0.3 + (i % 4) * 0.15) + i * canvasH / 12) % (canvasH * 0.75));
    const alpha = 0.06 + Math.abs(Math.sin(currentT * 0.5 + i * 1.3)) * 0.12;
    ctx.fillStyle = `rgba(180,160,80,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawCrystal(x, baseY) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.fillStyle = 'rgba(100,200,120,0.3)'; ctx.shadowColor = '#44ff88'; ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(100,255,150,0.5)'; ctx.lineWidth = 1;
  const heights = [28, 18, 22, 14];
  const offsets = [-10, -3, 5, 12];
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i], ox = offsets[i];
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox - 4, -h); ctx.lineTo(ox + 4, -h);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// ─── Zone 3: The Reef ──────────────────────────────────────────
function drawReefBackground() {
  const t = currentT;
  const baseY = canvasH * 0.84;

  // Sea floor
  const floorGrad = ctx.createLinearGradient(0, baseY - 10, 0, canvasH);
  floorGrad.addColorStop(0, '#0a160a'); floorGrad.addColorStop(1, '#040a04');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, baseY - 10, canvasW, canvasH - baseY + 10);

  // Reef formations growing from floor
  ctx.save();
  ctx.fillStyle = '#080c08';
  for (let i = 0; i < 7; i++) {
    const rx = canvasW * (0.05 + i * 0.14);
    const rh = 30 + Math.sin(i * 1.7) * 18;
    ctx.beginPath();
    ctx.moveTo(rx - 22, canvasH);
    ctx.lineTo(rx - 22, baseY + 10);
    ctx.lineTo(rx - 10, baseY - rh);
    ctx.lineTo(rx, baseY - rh - 12);
    ctx.lineTo(rx + 10, baseY - rh + 4);
    ctx.lineTo(rx + 22, baseY + 10);
    ctx.lineTo(rx + 22, canvasH);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Glowing particles
  ctx.save();
  const particleCount = 22;
  for (let i = 0; i < particleCount; i++) {
    const px = (canvasW * ((i * 0.618 + 0.1) % 1.0));
    const py = ((t * 18 * (0.5 + (i % 3) * 0.3) + i * (canvasH / particleCount)) % (canvasH * 0.78));
    const alpha = 0.15 + Math.abs(Math.sin(t * 0.8 + i)) * 0.35;
    const r = 1 + (i % 3) * 0.8;
    ctx.fillStyle = `rgba(0,255,136,${alpha})`;
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Branching coral structures
  ctx.save();
  ctx.strokeStyle = 'rgba(0,120,60,0.4)'; ctx.lineWidth = 2; ctx.shadowColor = '#00ff44'; ctx.shadowBlur = 6;
  for (let i = 0; i < 5; i++) {
    const bx = canvasW * (0.1 + i * 0.2);
    ctx.beginPath();
    ctx.moveTo(bx, baseY);
    ctx.lineTo(bx + Math.sin(i * 2) * 8, baseY - 35);
    ctx.lineTo(bx + Math.sin(i * 2) * 8 - 10, baseY - 50);
    ctx.moveTo(bx + Math.sin(i * 2) * 8, baseY - 35);
    ctx.lineTo(bx + Math.sin(i * 2) * 8 + 10, baseY - 48);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Zone 4: The Coral Sprawl ────────────────────────────────────
function drawCoralSprawlBackground() {
  const t = currentT;
  const baseY = canvasH * 0.82;

  // Deep coral gradient
  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#1a0808'); bg2.addColorStop(0.5, '#0d0404'); bg2.addColorStop(1, '#060202');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid
  ctx.strokeStyle = '#220808'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Coral floor
  ctx.save();
  const sg = ctx.createLinearGradient(0, baseY, 0, canvasH);
  sg.addColorStop(0, '#1a0d08'); sg.addColorStop(1, '#0a0504');
  ctx.fillStyle = sg; ctx.fillRect(0, baseY, canvasW, canvasH - baseY);
  ctx.restore();

  // Large coral formations
  for (const cx of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    drawCoral(canvasW * cx, baseY, 0.9 + Math.sin(cx * 5) * 0.3, '#ff4422', '#ff8844');
  }
  for (const cx of [0.2, 0.6, 0.85]) {
    drawCoral(canvasW * cx, baseY, 0.7, '#ff2266', '#ff66aa');
  }

  // Bioluminescent particles
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const px = (canvasW * ((i * 0.618 + 0.05) % 1.0));
    const py = ((t * 10 * (0.3 + (i % 4) * 0.15) + i * canvasH / 18) % (canvasH * 0.78));
    const alpha = 0.1 + Math.abs(Math.sin(t * 0.7 + i * 1.1)) * 0.25;
    const colors = ['rgba(255,100,68,', 'rgba(255,50,100,', 'rgba(255,150,80,'];
    ctx.fillStyle = colors[i % 3] + alpha + ')';
    ctx.shadowColor = '#ff6644'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Anemones
  for (const ax of [0.15, 0.45, 0.75]) {
    drawAnemone(canvasW * ax, baseY, '#ff8866');
  }
}

// ─── Zone 5: The Sand Dunes ─────────────────────────────────────
function drawSandDunesBackground() {
  const t = currentT;
  const baseY = canvasH * 0.78;

  // Deeper, more dramatic gradient
  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#1a1205'); bg2.addColorStop(0.3, '#0d0802'); bg2.addColorStop(0.7, '#080501'); bg2.addColorStop(1, '#040300');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#1a1408'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Background dune layer (distant, subtle)
  ctx.save();
  ctx.fillStyle = '#0e0c04';
  ctx.beginPath(); ctx.moveTo(0, canvasH);
  for (let x = 0; x <= canvasW; x += 4) {
    const dy = Math.sin(x * 0.005 + 0.8) * 40 + Math.sin(x * 0.012 + 2.5) * 20;
    ctx.lineTo(x, baseY - 30 + dy);
  }
  ctx.lineTo(canvasW, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Foreground dune layer - rolling hills with slow drift
  ctx.save();
  const sg = ctx.createLinearGradient(0, baseY - 40, 0, canvasH);
  sg.addColorStop(0, '#221a08'); sg.addColorStop(0.3, '#1a1508'); sg.addColorStop(1, '#0a0b04');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(0, canvasH);
  for (let x = 0; x <= canvasW; x += 4) {
    const dy = Math.sin(x * 0.008 + t * 0.08) * 30 + Math.sin(x * 0.02 + 1.5) * 15 + Math.sin(x * 0.035 + 3.0) * 8;
    ctx.lineTo(x, baseY + dy);
  }
  ctx.lineTo(canvasW, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Sand streams - horizontal particle currents
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 4; i++) {
    const sy = canvasH * (0.25 + i * 0.15);
    const streamGrad = ctx.createLinearGradient(0, sy, canvasW, sy);
    streamGrad.addColorStop(0, 'transparent');
    streamGrad.addColorStop(0.3, 'rgba(200,170,60,0.08)');
    streamGrad.addColorStop(0.7, 'rgba(200,170,60,0.12)');
    streamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = streamGrad;
    ctx.fillRect(0, sy - 3 + Math.sin(t * 0.3 + i) * 5, canvasW, 6);
  }
  ctx.restore();

  // Sand particles drifting (more particles, more dramatic)
  ctx.save();
  for (let i = 0; i < 35; i++) {
    const px = ((t * (12 + i % 5 * 3) + i * canvasW / 35 + Math.sin(i * 2.1) * 40) % (canvasW + 40)) - 20;
    const py = canvasH * 0.15 + (i * canvasH * 0.65 / 35) + Math.sin(t * 0.5 + i) * 12;
    const alpha = 0.05 + Math.abs(Math.sin(t * 0.4 + i * 1.5)) * 0.12;
    ctx.fillStyle = `rgba(220,180,60,${alpha})`;
    ctx.shadowColor = '#ccaa44'; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(px, py, 1 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Crystals poking out of dunes
  for (const cx of [0.08, 0.25, 0.42, 0.58, 0.75, 0.92]) {
    drawCrystal(canvasW * cx, baseY + Math.sin(cx * 8) * 15);
  }

  // Glowing heat vents
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const vx = canvasW * (0.2 + i * 0.3);
    const vy = baseY + Math.sin(vx * 0.01) * 15 + 5;
    const pulse = 0.3 + Math.sin(t * 1.5 + i * 2) * 0.2;
    ctx.fillStyle = `rgba(255,140,40,${pulse})`;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(vx, vy, 5, 0, Math.PI * 2); ctx.fill();
    // Rising heat particles
    for (let j = 0; j < 4; j++) {
      const hx = vx + Math.sin(t * 2 + j * 1.5) * 8;
      const hy = vy - 10 - ((t * 20 + j * 15) % 40);
      const ha = Math.max(0, 0.3 - ((t * 20 + j * 15) % 40) / 50);
      ctx.fillStyle = `rgba(255,160,60,${ha})`;
      ctx.beginPath(); ctx.arc(hx, hy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Zone 6: The Old Mine ───────────────────────────────────────
function drawOldMineBackground() {
  const t = currentT;
  const baseY = canvasH * 0.85;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#0a0a10'); bg2.addColorStop(0.5, '#060608'); bg2.addColorStop(1, '#030304');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#0a0a14'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Mine shaft walls
  ctx.save();
  ctx.fillStyle = '#0c0c12';
  ctx.fillRect(0, baseY, canvasW, canvasH - baseY);
  // Support beams
  ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    const bx = canvasW * (0.1 + i * 0.2);
    ctx.beginPath(); ctx.moveTo(bx, baseY); ctx.lineTo(bx, baseY - 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 30, baseY - 58); ctx.lineTo(bx + 30, baseY - 58); ctx.stroke();
  }
  ctx.restore();

  // Rail tracks on the floor
  ctx.save();
  ctx.strokeStyle = '#1a1a28'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, baseY + 15); ctx.lineTo(canvasW, baseY + 15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, baseY + 25); ctx.lineTo(canvasW, baseY + 25); ctx.stroke();
  // Ties
  ctx.lineWidth = 3;
  for (let x = 0; x < canvasW; x += 35) {
    ctx.beginPath(); ctx.moveTo(x, baseY + 12); ctx.lineTo(x, baseY + 28); ctx.stroke();
  }
  ctx.restore();

  // Glowing ore veins
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const ox = canvasW * ((i * 0.618 + 0.05) % 1.0);
    const oy = canvasH * (0.15 + (i % 4) * 0.18);
    const alpha = 0.15 + Math.abs(Math.sin(t * 0.6 + i * 2)) * 0.3;
    ctx.fillStyle = `rgba(136,136,170,${alpha})`;
    ctx.shadowColor = '#8888aa'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(136,136,170,${alpha * 0.5})`; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(i * 1.3) * 20, oy + Math.sin(i * 1.3) * 15);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Zone 7: The Shark Den ──────────────────────────────────────
function drawSharkDenBackground() {
  const t = currentT;
  const baseY = canvasH * 0.88;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#1a0505'); bg2.addColorStop(0.5, '#0d0303'); bg2.addColorStop(1, '#050101');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#1a0505'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Rocky cave walls
  ctx.save();
  ctx.fillStyle = '#0a0404';
  for (let i = 0; i < 8; i++) {
    const rx = canvasW * (0.04 + i * 0.13);
    const rh = 40 + Math.sin(i * 2.1) * 20;
    ctx.beginPath();
    ctx.moveTo(rx - 25, baseY + 10);
    ctx.lineTo(rx - 12, baseY - rh);
    ctx.lineTo(rx + 5, baseY - rh - 8);
    ctx.lineTo(rx + 15, baseY - rh + 6);
    ctx.lineTo(rx + 25, baseY + 10);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Teeth/bone fragments on the floor
  ctx.save();
  ctx.fillStyle = '#221a1a';
  for (let i = 0; i < 12; i++) {
    const tx = canvasW * ((i * 0.37 + 0.05) % 1.0);
    const ty = baseY + 5 + (i % 3) * 4;
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(tx - 2, ty - 8 - (i % 3) * 3); ctx.lineTo(tx + 2, ty - 8 - (i % 3) * 3);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Blood-red particles
  ctx.save();
  for (let i = 0; i < 15; i++) {
    const px = (canvasW * ((i * 0.618 + 0.08) % 1.0));
    const py = ((t * 8 * (0.4 + (i % 3) * 0.2) + i * canvasH / 15) % (canvasH * 0.8));
    const alpha = 0.08 + Math.abs(Math.sin(t * 0.5 + i * 1.2)) * 0.15;
    ctx.fillStyle = `rgba(200,50,50,${alpha})`;
    ctx.shadowColor = '#cc3333'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Zone 8: The Abandoned City ─────────────────────────────────
function drawAbandonedCityBackground() {
  const t = currentT;
  const baseY = canvasH * 0.86;

  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#080d14'); bg2.addColorStop(0.5, '#040608'); bg2.addColorStop(1, '#020304');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.strokeStyle = '#0a0d14'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvasW,y); ctx.stroke(); }

  // Buildings in background
  ctx.save();
  ctx.fillStyle = '#060a10';
  const buildings = [
    { x: 0.05, w: 0.08, h: 0.35 }, { x: 0.15, w: 0.06, h: 0.5 },
    { x: 0.28, w: 0.1, h: 0.4 },  { x: 0.42, w: 0.07, h: 0.55 },
    { x: 0.55, w: 0.09, h: 0.3 },  { x: 0.68, w: 0.06, h: 0.45 },
    { x: 0.78, w: 0.08, h: 0.38 }, { x: 0.9, w: 0.07, h: 0.5 },
  ];
  for (const b of buildings) {
    const bx = canvasW * b.x, bw = canvasW * b.w, bh = canvasH * b.h;
    ctx.fillRect(bx, baseY - bh, bw, bh + 20);
    // Windows
    ctx.fillStyle = '#0a1020';
    for (let wy = baseY - bh + 12; wy < baseY - 10; wy += 18) {
      for (let wx = bx + 4; wx < bx + bw - 6; wx += 10) {
        ctx.fillRect(wx, wy, 6, 8);
        // Random lit window
        if (Math.sin(wx * 3.7 + wy * 2.1 + t * 0.02) > 0.92) {
          ctx.save();
          ctx.fillStyle = 'rgba(100,130,180,0.3)';
          ctx.shadowColor = '#6688bb'; ctx.shadowBlur = 8;
          ctx.fillRect(wx, wy, 6, 8);
          ctx.restore();
        }
      }
    }
    ctx.fillStyle = '#060a10';
  }
  ctx.restore();

  // Moss/algae on buildings
  ctx.save();
  for (const b of buildings) {
    const bx = canvasW * b.x, bw = canvasW * b.w, bh = canvasH * b.h;
    // Moss patches on building edges
    for (let my = baseY - bh; my < baseY; my += 22 + Math.sin(bx + my) * 8) {
      const mossW = 4 + Math.abs(Math.sin(my * 0.3 + bx * 0.1)) * 8;
      const mossAlpha = 0.12 + Math.abs(Math.sin(my * 0.5)) * 0.1;
      ctx.fillStyle = `rgba(20,80,40,${mossAlpha})`;
      // Left edge moss
      ctx.beginPath();
      ctx.ellipse(bx + 2, my, mossW, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right edge moss
      ctx.beginPath();
      ctx.ellipse(bx + bw - 2, my + 7, mossW * 0.8, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Top moss
    ctx.fillStyle = 'rgba(15,70,35,0.2)';
    ctx.beginPath();
    ctx.ellipse(bx + bw / 2, baseY - bh, bw * 0.6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Underwater plants at building bases
  ctx.save();
  const plantPositions = [0.08, 0.22, 0.38, 0.52, 0.65, 0.82, 0.95];
  for (let pi = 0; pi < plantPositions.length; pi++) {
    const px = canvasW * plantPositions[pi];
    const segments = 3 + (pi % 2);
    const plantH = 25 + (pi % 3) * 12;
    const segH = plantH / segments;
    ctx.globalAlpha = 0.18 + (pi % 3) * 0.04;
    ctx.strokeStyle = '#1a5533';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#22aa55';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(px, baseY);
    for (let s = 1; s <= segments; s++) {
      const sway = Math.sin(t * 0.7 + pi * 1.3 + s * 0.9) * (5 + s * 2);
      ctx.lineTo(px + sway, baseY - segH * s);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Floor debris
  ctx.save();
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, baseY, canvasW, canvasH - baseY);
  ctx.restore();

  // Floating particles (dust/debris)
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const px = (canvasW * ((i * 0.618 + 0.1) % 1.0));
    const py = ((t * 6 * (0.3 + (i % 3) * 0.15) + i * canvasH / 12) % (canvasH * 0.8));
    const alpha = 0.06 + Math.abs(Math.sin(t * 0.4 + i)) * 0.12;
    ctx.fillStyle = `rgba(100,136,187,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Zone 9: The Seawall ────────────────────────────────────────
function drawSeawallBackground() {
  const t = currentT;
  const midX = canvasW * 0.5;
  const chasmW = canvasW * 0.38;
  const sandY = canvasH * 0.48;

  // Dark deep background
  const bg2 = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg2.addColorStop(0, '#080a0d'); bg2.addColorStop(0.3, '#040506'); bg2.addColorStop(1, '#010101');
  ctx.fillStyle = bg2; ctx.fillRect(0, 0, canvasW, canvasH);

  // The chasm - deep void in center
  ctx.save();
  const chasmGrad = ctx.createLinearGradient(0, sandY, 0, canvasH);
  chasmGrad.addColorStop(0, '#030305');
  chasmGrad.addColorStop(0.4, '#020203');
  chasmGrad.addColorStop(1, '#000000');
  ctx.fillStyle = chasmGrad;
  ctx.fillRect(midX - chasmW / 2, sandY, chasmW, canvasH - sandY);
  ctx.restore();

  // Faint depth glow from the abyss below
  ctx.save();
  const abyssGlow = ctx.createRadialGradient(midX, canvasH + 40, 20, midX, canvasH, canvasH * 0.6);
  abyssGlow.addColorStop(0, 'rgba(30,50,80,0.1)');
  abyssGlow.addColorStop(0.5, 'rgba(20,30,60,0.05)');
  abyssGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = abyssGlow;
  ctx.fillRect(midX - chasmW / 2, sandY, chasmW, canvasH - sandY);
  ctx.restore();

  // Left sand platform
  ctx.save();
  const leftEdge = midX - chasmW / 2;
  const sandGradL = ctx.createLinearGradient(0, sandY - 20, 0, canvasH);
  sandGradL.addColorStop(0, '#1a1608'); sandGradL.addColorStop(0.3, '#141208'); sandGradL.addColorStop(1, '#0c0a06');
  ctx.fillStyle = sandGradL;
  ctx.beginPath();
  ctx.moveTo(0, sandY - 10);
  ctx.quadraticCurveTo(leftEdge * 0.4, sandY - 18, leftEdge * 0.7, sandY);
  ctx.lineTo(leftEdge + 8, sandY + 15);
  ctx.lineTo(leftEdge - 5, canvasH);
  ctx.lineTo(0, canvasH);
  ctx.closePath(); ctx.fill();

  // Sand edge crumbling into chasm
  ctx.fillStyle = '#12100a';
  for (let i = 0; i < 6; i++) {
    const rx = leftEdge - 4 + Math.sin(i * 2.1) * 12;
    const ry = sandY + 5 + i * 8;
    ctx.beginPath(); ctx.ellipse(rx, ry, 5 + (i % 3) * 3, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Right sand platform
  ctx.save();
  const rightEdge = midX + chasmW / 2;
  const sandGradR = ctx.createLinearGradient(0, sandY - 20, 0, canvasH);
  sandGradR.addColorStop(0, '#1a1608'); sandGradR.addColorStop(0.3, '#141208'); sandGradR.addColorStop(1, '#0c0a06');
  ctx.fillStyle = sandGradR;
  ctx.beginPath();
  ctx.moveTo(canvasW, sandY - 8);
  ctx.quadraticCurveTo(canvasW - (canvasW - rightEdge) * 0.4, sandY - 16, rightEdge + (canvasW - rightEdge) * 0.3, sandY);
  ctx.lineTo(rightEdge - 8, sandY + 15);
  ctx.lineTo(rightEdge + 5, canvasH);
  ctx.lineTo(canvasW, canvasH);
  ctx.closePath(); ctx.fill();

  // Sand edge crumbling
  ctx.fillStyle = '#12100a';
  for (let i = 0; i < 6; i++) {
    const rx = rightEdge + 4 + Math.sin(i * 1.7) * 12;
    const ry = sandY + 5 + i * 8;
    ctx.beginPath(); ctx.ellipse(rx, ry, 5 + (i % 3) * 3, 3, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Sand texture ripples on left
  ctx.save();
  ctx.strokeStyle = 'rgba(30,25,12,0.3)'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    const ry = sandY + 20 + i * 22;
    ctx.beginPath();
    for (let x = 0; x < leftEdge - 10; x += 4) {
      const y = ry + Math.sin(x * 0.04 + i * 1.5) * 2;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Sand texture ripples on right
  for (let i = 0; i < 4; i++) {
    const ry = sandY + 20 + i * 22;
    ctx.beginPath();
    for (let x = rightEdge + 10; x < canvasW; x += 4) {
      const y = ry + Math.sin(x * 0.04 + i * 1.5) * 2;
      x === rightEdge + 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Small rocks on sand edges
  ctx.save();
  ctx.fillStyle = '#0e0c08';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.ellipse(leftEdge - 15 + Math.sin(i * 2.3) * 20, sandY - 3 + (i % 3) * 3, 6 + (i % 3) * 3, 4, i * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(rightEdge + 15 + Math.sin(i * 1.9) * 20, sandY - 2 + (i % 3) * 3, 6 + (i % 3) * 3, 4, i * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Falling particles drifting into chasm
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const px = midX + (Math.sin(i * 1.9 + t * 0.15) * chasmW * 0.4);
    const py = ((t * 12 * (0.3 + (i % 4) * 0.15) + i * canvasH / 18) % canvasH);
    const depthFade = Math.min(1, py / canvasH);
    const alpha = (0.08 + Math.abs(Math.sin(t * 0.4 + i)) * 0.15) * (1 - depthFade * 0.7);
    ctx.fillStyle = `rgba(70,90,120,${alpha})`;
    ctx.shadowColor = '#556688'; ctx.shadowBlur = 4;
    ctx.beginPath(); ctx.arc(px, py, 1 + (i % 3) * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Sand grains falling off edges
  ctx.save();
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? leftEdge : rightEdge;
    const px = side + (i < 4 ? 3 : -3) + Math.sin(i * 3.1 + t * 0.3) * 5;
    const py = sandY + ((t * 18 + i * 40) % (canvasH - sandY));
    const alpha = 0.15 * (1 - (py - sandY) / (canvasH - sandY));
    ctx.fillStyle = `rgba(26,22,8,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Faint mist at chasm opening
  ctx.save();
  const mistGrad = ctx.createLinearGradient(0, sandY - 20, 0, sandY + 40);
  mistGrad.addColorStop(0, 'transparent');
  mistGrad.addColorStop(0.4, 'rgba(40,50,70,0.06)');
  mistGrad.addColorStop(0.7, 'rgba(30,40,60,0.04)');
  mistGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(midX - chasmW / 2 - 20, sandY - 20, chasmW + 40, 60);
  ctx.restore();
}

// ─── Clickable specials for new zones ────────────────────────────
function drawClickCoralPearl(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffccaa';
  ctx.shadowColor = '#ffaa88';
  ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickSandFossil(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#aa8855';
  ctx.shadowColor = '#ccaa77';
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.ellipse(x, y, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ccbb88'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const r = a * 1.5;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.7);
  }
  ctx.stroke();
  ctx.restore();
}

// ─── Clickable specials for zones 3, 6, 7, 8, 9 ────────────────

function drawClickReefUrchin(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 15;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#cc55aa';
  ctx.shadowColor = '#ff66cc';
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ff88cc'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
    ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawClickMineGem(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#8888cc';
  ctx.shadowColor = '#aaaaff';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(x, y - 12); ctx.lineTo(x + 10, y - 4); ctx.lineTo(x + 8, y + 8);
  ctx.lineTo(x - 8, y + 8); ctx.lineTo(x - 10, y - 4);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ccccff'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x - 2, y - 4, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickLooseTooth(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ddccbb';
  ctx.shadowColor = '#ffddcc';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 10); ctx.lineTo(x, y - 14); ctx.lineTo(x + 5, y + 10);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#cc3333'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.arc(x, y + 8, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickCityRelic(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#6688bb';
  ctx.shadowColor = '#88aadd';
  ctx.shadowBlur = 14;
  ctx.fillRect(x - 8, y - 6, 16, 12);
  ctx.strokeStyle = '#aaccff'; ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, y - 6, 16, 12);
  ctx.fillStyle = '#aaccff'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawClickWallShard(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#556677';
  ctx.shadowColor = '#778899';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 8); ctx.lineTo(x - 6, y - 10); ctx.lineTo(x + 4, y - 12);
  ctx.lineTo(x + 10, y + 2); ctx.lineTo(x + 4, y + 10);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8899aa'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - 4, y - 6); ctx.lineTo(x + 6, y + 4); ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  ZONE 10: THE ABYSS
// ═══════════════════════════════════════════════════════════════

function drawAbyssBackground() {
  const t = currentT;

  // Pure darkness gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg.addColorStop(0, '#050208'); bg.addColorStop(0.4, '#030106'); bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);

  // Faint grid
  ctx.strokeStyle = 'rgba(30,15,60,0.06)'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke(); }

  // Void cracks — jagged fissures in the ground
  ctx.save();
  ctx.strokeStyle = '#220044'; ctx.lineWidth = 2; ctx.shadowColor = '#4400aa'; ctx.shadowBlur = 8;
  for (let i = 0; i < 5; i++) {
    const sx = canvasW * (0.1 + i * 0.2) + Math.sin(i * 2.3) * 30;
    ctx.beginPath(); ctx.moveTo(sx, canvasH);
    let cy = canvasH;
    for (let s = 0; s < 6; s++) {
      cy -= 15 + Math.sin(i * 1.7 + s * 0.8) * 10;
      ctx.lineTo(sx + Math.sin(s * 2.1 + i) * 15, cy);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Deep bioluminescent spots — faint glowing orbs
  ctx.save();
  for (let i = 0; i < 12; i++) {
    const px = canvasW * ((i * 0.618 + 0.1) % 1.0);
    const py = canvasH * 0.15 + (canvasH * 0.7) * ((i * 0.382 + Math.sin(t * 0.2 + i) * 0.03) % 1.0);
    const pulse = 0.3 + Math.sin(t * 1.2 + i * 1.8) * 0.2;
    ctx.fillStyle = `rgba(80,40,180,${pulse * 0.15})`;
    ctx.shadowColor = '#6633cc'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(px, py, 3 + pulse * 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Floating void particles
  ctx.save();
  for (let i = 0; i < 20; i++) {
    const px = (canvasW * ((i * 0.618 + 0.05) % 1.0));
    const py = ((t * 8 * (0.2 + (i % 5) * 0.1) + i * canvasH / 20) % canvasH);
    const alpha = 0.04 + Math.abs(Math.sin(t * 0.6 + i * 1.3)) * 0.08;
    ctx.fillStyle = `rgba(100,50,200,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Rocky floor
  ctx.save();
  const floorY = canvasH * 0.88;
  ctx.fillStyle = '#0a0510';
  ctx.beginPath(); ctx.moveTo(0, floorY);
  for (let x = 0; x <= canvasW; x += 20) {
    ctx.lineTo(x, floorY + Math.sin(x * 0.03) * 8 + Math.sin(x * 0.07) * 4);
  }
  ctx.lineTo(canvasW, canvasH); ctx.lineTo(0, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawClickAbyssCrystal(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#6633cc';
  ctx.shadowColor = '#9955ff';
  ctx.shadowBlur = 20;
  // Crystal shape
  ctx.beginPath();
  ctx.moveTo(x, y - 14); ctx.lineTo(x + 7, y - 4); ctx.lineTo(x + 5, y + 10);
  ctx.lineTo(x - 5, y + 10); ctx.lineTo(x - 7, y - 4);
  ctx.closePath(); ctx.fill();
  // Inner glow
  ctx.fillStyle = '#bb88ff'; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.arc(x, y - 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  ZONE 11: THE HIDDEN PASSAGE
// ═══════════════════════════════════════════════════════════════

function drawHiddenPassageBackground() {
  const t = currentT;

  // Dark green-tinted gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg.addColorStop(0, '#020a06'); bg.addColorStop(0.5, '#010805'); bg.addColorStop(1, '#000503');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid
  ctx.strokeStyle = 'rgba(20,50,30,0.06)'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke(); }

  // Tunnel walls — curved rock surfaces on top and bottom
  ctx.save();
  const wallGrad = ctx.createLinearGradient(0, 0, 0, canvasH * 0.15);
  wallGrad.addColorStop(0, '#0c1a10'); wallGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = wallGrad;
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (let x = 0; x <= canvasW; x += 15) {
    ctx.lineTo(x, canvasH * 0.08 + Math.sin(x * 0.02 + 1.2) * 15 + Math.sin(x * 0.05) * 8);
  }
  ctx.lineTo(canvasW, 0); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Floor with stalactite-like bumps
  ctx.save();
  const floorGrad = ctx.createLinearGradient(0, canvasH * 0.85, 0, canvasH);
  floorGrad.addColorStop(0, 'transparent'); floorGrad.addColorStop(1, '#0c1a10');
  ctx.fillStyle = floorGrad;
  ctx.beginPath(); ctx.moveTo(0, canvasH);
  for (let x = 0; x <= canvasW; x += 15) {
    ctx.lineTo(x, canvasH * 0.88 + Math.sin(x * 0.025 + 0.5) * 12 + Math.sin(x * 0.06) * 6);
  }
  ctx.lineTo(canvasW, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Moss/lichen patches on walls
  ctx.save();
  ctx.fillStyle = '#1a3a22';
  for (let i = 0; i < 8; i++) {
    const mx = canvasW * (i / 8) + Math.sin(i * 2.3) * 20;
    const my = i % 2 === 0 ? canvasH * 0.06 + Math.sin(mx * 0.02) * 8 : canvasH * 0.9 + Math.sin(mx * 0.025) * 8;
    ctx.beginPath(); ctx.ellipse(mx, my, 12 + (i % 3) * 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Echo rings — concentric expanding circles
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const echoX = canvasW * (0.25 + i * 0.25);
    const echoY = canvasH * 0.5 + Math.sin(i * 2.1) * 40;
    const ringPhase = (t * 0.4 + i * 2.1) % 4;
    if (ringPhase < 3) {
      const radius = ringPhase * 30;
      const alpha = 0.08 * (1 - ringPhase / 3);
      ctx.strokeStyle = `rgba(50,140,100,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(echoX, echoY, radius, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();

  // Floating particles
  ctx.save();
  for (let i = 0; i < 15; i++) {
    const px = (t * 20 * (0.3 + (i % 4) * 0.1) + i * canvasW / 15) % canvasW;
    const py = canvasH * 0.15 + (canvasH * 0.7) * ((i * 0.382) % 1.0) + Math.sin(t + i) * 10;
    const alpha = 0.05 + Math.abs(Math.sin(t * 0.5 + i * 1.1)) * 0.08;
    ctx.fillStyle = `rgba(50,136,100,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawClickPassageKey(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#44aa77';
  ctx.shadowColor = '#66ddaa';
  ctx.shadowBlur = 16;
  // Key shape — shaft and bow
  ctx.fillRect(x - 2, y - 10, 4, 16);
  ctx.beginPath(); ctx.arc(x, y - 12, 6, 0, Math.PI * 2); ctx.fill();
  // Teeth
  ctx.fillRect(x + 2, y + 2, 5, 2);
  ctx.fillRect(x + 2, y + 6, 3, 2);
  // Inner hole
  ctx.fillStyle = '#020a06';
  ctx.beginPath(); ctx.arc(x, y - 12, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  ZONE 12: THE MERMAID'S LAIR
// ═══════════════════════════════════════════════════════════════

function drawMermaidsLairBackground() {
  const t = currentT;

  // Deep purple/pink gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg.addColorStop(0, '#0a0412'); bg.addColorStop(0.4, '#08030e'); bg.addColorStop(1, '#040108');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid
  ctx.strokeStyle = 'rgba(50,20,60,0.06)'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke(); }

  // Pearl-encrusted floor
  ctx.save();
  const floorY = canvasH * 0.85;
  ctx.fillStyle = '#0c0618';
  ctx.beginPath(); ctx.moveTo(0, floorY);
  for (let x = 0; x <= canvasW; x += 20) {
    ctx.lineTo(x, floorY + Math.sin(x * 0.04) * 6 + Math.sin(x * 0.08) * 3);
  }
  ctx.lineTo(canvasW, canvasH); ctx.lineTo(0, canvasH); ctx.closePath(); ctx.fill();
  // Scattered pearls on floor
  for (let i = 0; i < 12; i++) {
    const px = canvasW * (i / 12) + Math.sin(i * 3.7) * 20;
    const py = floorY + 6 + Math.sin(px * 0.04) * 4 + (i % 3) * 5;
    ctx.fillStyle = '#ccaadd';
    ctx.shadowColor = '#ee88ff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Flowing kelp/seaweed with purple tint
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const baseX = canvasW * (0.08 + i * 0.17);
    const h = 50 + Math.sin(i * 2.1) * 25;
    ctx.strokeStyle = `rgba(150,80,200,${0.12 + (i % 3) * 0.04})`;
    ctx.lineWidth = 2 + (i % 2);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(baseX, canvasH);
    for (let s = 1; s <= 5; s++) {
      const sway = Math.sin(t * 0.8 + i * 1.4 + s * 0.7) * (6 + s * 3);
      ctx.lineTo(baseX + sway, canvasH - (h / 5) * s);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Enchanted floating orbs
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const ox = canvasW * ((i * 0.618 + 0.05) % 1.0);
    const oy = canvasH * 0.1 + (canvasH * 0.65) * ((i * 0.382 + 0.1) % 1.0) + Math.sin(t * 0.8 + i * 2.2) * 15;
    const pulse = 0.5 + Math.sin(t * 1.5 + i * 1.3) * 0.3;
    const hue = 270 + Math.sin(t * 0.3 + i) * 30;
    ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${pulse * 0.12})`;
    ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(ox, oy, 2.5 + pulse * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Song waves — horizontal flowing lines
  ctx.save();
  ctx.strokeStyle = 'rgba(200,100,255,0.05)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const baseY = canvasH * (0.2 + i * 0.15);
    ctx.beginPath();
    for (let x = 0; x <= canvasW; x += 5) {
      const y = baseY + Math.sin(x * 0.015 + t * 1.5 + i * 1.2) * 12;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawClickSirenScale(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  // Iridescent scale
  const hue = 270 + Math.sin(currentT * 2) * 40;
  ctx.fillStyle = `hsl(${hue}, 80%, 65%)`;
  ctx.shadowColor = `hsl(${hue}, 80%, 75%)`;
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.ellipse(x, y, 10, 13, 0, 0, Math.PI * 2); ctx.fill();
  // Shimmer highlight
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = alpha * 0.6;
  ctx.beginPath(); ctx.ellipse(x - 3, y - 4, 4, 2, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  ZONE 13: THE TWILIGHT DEPTHS
// ═══════════════════════════════════════════════════════════════

function drawTwilightDepthsBackground() {
  const t = currentT;

  // Gradient from deep indigo to black
  const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg.addColorStop(0, '#0a0820'); bg.addColorStop(0.3, '#060512'); bg.addColorStop(0.7, '#030308'); bg.addColorStop(1, '#010102');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid
  ctx.strokeStyle = 'rgba(40,30,60,0.05)'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke(); }

  // Fading light rays from top — dying light
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const rx = canvasW * (0.2 + i * 0.3) + Math.sin(t * 0.1 + i * 2.1) * 20;
    const fade = 0.5 + Math.sin(t * 0.3 + i * 1.5) * 0.3;
    const rayGrad = ctx.createLinearGradient(rx, 0, rx, canvasH * 0.5);
    rayGrad.addColorStop(0, `rgba(80,60,140,${0.04 * fade})`);
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(rx - 15, 0); ctx.lineTo(rx + 25, canvasH * 0.5);
    ctx.lineTo(rx - 25, canvasH * 0.5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // Shadow tendrils — wispy dark shapes that drift
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const sx = canvasW * ((i * 0.618 + 0.05) % 1.0);
    const sy = canvasH * 0.3 + (canvasH * 0.5) * ((i * 0.382) % 1.0);
    const sway = Math.sin(t * 0.5 + i * 1.7) * 30;
    ctx.strokeStyle = `rgba(20,15,40,${0.15 + Math.sin(t * 0.4 + i) * 0.08})`;
    ctx.lineWidth = 3 + (i % 3);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + sway, sy + 30, sx + sway * 1.5, sy + 60);
    ctx.stroke();
  }
  ctx.restore();

  // Faintly glowing particles — twilight motes
  ctx.save();
  for (let i = 0; i < 16; i++) {
    const px = (canvasW * ((i * 0.618 + 0.05) % 1.0));
    const py = ((t * 6 * (0.2 + (i % 4) * 0.08) + i * canvasH / 16) % canvasH);
    const flicker = Math.abs(Math.sin(t * 2 + i * 1.9));
    const alpha = 0.03 + flicker * 0.06;
    ctx.fillStyle = `rgba(100,80,180,${alpha})`;
    ctx.shadowColor = '#5533aa'; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(px, py, 1 + flicker, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Rocky floor with crevices
  ctx.save();
  const floorY = canvasH * 0.9;
  ctx.fillStyle = '#080614';
  ctx.beginPath(); ctx.moveTo(0, floorY);
  for (let x = 0; x <= canvasW; x += 18) {
    ctx.lineTo(x, floorY + Math.sin(x * 0.035) * 6 + Math.sin(x * 0.08) * 3);
  }
  ctx.lineTo(canvasW, canvasH); ctx.lineTo(0, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawClickTwilightOrb(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  // Pulsing orb
  const pulse = 0.6 + Math.sin(currentT * 2.5) * 0.4;
  ctx.fillStyle = `rgba(100,70,200,${0.6 + pulse * 0.3})`;
  ctx.shadowColor = '#8855dd';
  ctx.shadowBlur = 25 * pulse;
  ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
  // Inner bright core
  ctx.fillStyle = '#ddbbff';
  ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  ZONE 14: THE MIDNIGHT TRENCH
// ═══════════════════════════════════════════════════════════════

function drawMidnightTrenchBackground() {
  const t = currentT;

  // Almost pure black
  const bg = ctx.createLinearGradient(0, 0, 0, canvasH);
  bg.addColorStop(0, '#030305'); bg.addColorStop(0.5, '#020203'); bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvasW, canvasH);

  // Very faint grid
  ctx.strokeStyle = 'rgba(20,20,30,0.04)'; ctx.lineWidth = 0.5;
  for (let x = 50; x < canvasW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasH); ctx.stroke(); }
  for (let y = 50; y < canvasH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasW, y); ctx.stroke(); }

  // Trench walls — narrow canyon, walls close in from both sides
  ctx.save();
  const wallW = canvasW * 0.12;
  // Left wall
  const lwGrad = ctx.createLinearGradient(0, 0, wallW, 0);
  lwGrad.addColorStop(0, '#0a0a10'); lwGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = lwGrad;
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (let y = 0; y <= canvasH; y += 15) {
    ctx.lineTo(wallW + Math.sin(y * 0.02 + 0.5) * 20 + Math.sin(y * 0.06) * 8, y);
  }
  ctx.lineTo(0, canvasH); ctx.closePath(); ctx.fill();
  // Right wall
  const rwGrad = ctx.createLinearGradient(canvasW, 0, canvasW - wallW, 0);
  rwGrad.addColorStop(0, '#0a0a10'); rwGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rwGrad;
  ctx.beginPath(); ctx.moveTo(canvasW, 0);
  for (let y = 0; y <= canvasH; y += 15) {
    ctx.lineTo(canvasW - wallW - Math.sin(y * 0.025 + 1.2) * 20 - Math.sin(y * 0.07) * 8, y);
  }
  ctx.lineTo(canvasW, canvasH); ctx.closePath(); ctx.fill();
  ctx.restore();

  // Pressure cracks in walls — faint glowing lines
  ctx.save();
  ctx.strokeStyle = 'rgba(40,40,80,0.15)'; ctx.lineWidth = 1;
  ctx.shadowColor = '#334466'; ctx.shadowBlur = 4;
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? 0 : 1;
    const bx = side === 0 ? wallW * 0.5 + Math.sin(i * 2) * 10 : canvasW - wallW * 0.5 + Math.sin(i * 2.3) * 10;
    const by = canvasH * (0.1 + (i % 3) * 0.3);
    ctx.beginPath(); ctx.moveTo(bx, by);
    for (let s = 0; s < 4; s++) {
      ctx.lineTo(bx + (Math.random() - 0.5) * 15 + Math.sin(s + i) * 8, by + s * 20);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Angler lure lights — small bright dots in the darkness
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const lx = canvasW * 0.2 + (canvasW * 0.6) * ((i * 0.618) % 1.0);
    const ly = canvasH * 0.15 + (canvasH * 0.6) * ((i * 0.382 + 0.2) % 1.0);
    const blink = Math.sin(t * 3 + i * 2.7);
    if (blink > 0.3) {
      const alpha = (blink - 0.3) * 0.3;
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.shadowColor = '#aaccff'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();

  // Sparse floating particles
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const px = canvasW * 0.15 + (canvasW * 0.7) * ((i * 0.618 + 0.1) % 1.0);
    const py = ((t * 5 * (0.15 + (i % 3) * 0.08) + i * canvasH / 10) % canvasH);
    const alpha = 0.03 + Math.abs(Math.sin(t * 0.4 + i * 1.5)) * 0.05;
    ctx.fillStyle = `rgba(60,60,100,${alpha})`;
    ctx.beginPath(); ctx.arc(px, py, 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Deep floor
  ctx.save();
  const floorY = canvasH * 0.92;
  ctx.fillStyle = '#050508';
  ctx.beginPath(); ctx.moveTo(0, floorY);
  for (let x = 0; x <= canvasW; x += 20) {
    ctx.lineTo(x, floorY + Math.sin(x * 0.04) * 5 + Math.sin(x * 0.09) * 3);
  }
  ctx.lineTo(canvasW, canvasH); ctx.lineTo(0, canvasH); ctx.closePath(); ctx.fill();
  // Bones on the floor
  ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const bx = canvasW * (0.2 + i * 0.2) + Math.sin(i * 3.1) * 20;
    const by = floorY + 4 + (i % 3) * 3;
    ctx.beginPath();
    ctx.moveTo(bx - 8, by); ctx.lineTo(bx + 8, by + Math.sin(i) * 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawClickTrenchBone(obj) {
  const alpha = Math.min(1, obj.peekAnim * 3);
  if (alpha <= 0.01) return;
  const x = obj.fx * canvasW;
  const y = obj.fy * canvasH + (1 - obj.peekAnim) * 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ccbbaa';
  ctx.shadowColor = '#ddccbb';
  ctx.shadowBlur = 10;
  // Large bone shape
  ctx.beginPath();
  ctx.ellipse(x, y, 14, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  // Knobs on ends
  ctx.beginPath(); ctx.arc(x - 12, y - 2, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 12, y + 2, 5, 0, Math.PI * 2); ctx.fill();
  // Crack detail
  ctx.strokeStyle = '#887766'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x - 3, y - 2); ctx.lineTo(x + 2, y + 2); ctx.stroke();
  ctx.restore();
}
