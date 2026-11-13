#!/usr/bin/env node
// Revised respiratory-flow-reconstruction loop, built from the LOWER area of the
// paper figure (Multilayer Perceptron Regressor with Monte Carlo Dropout, n=10).
//
// Fixed camera. The base frame is a static contain-fit crop (source rows
// 3310..4676) plus one static caption bar; every animated element is a local
// overlay that is fully transparent in the first and last frames, so the loop
// boundary and the poster are pixel-identical to the base.
//
// Twelve shared time steps: all displayed networks propagate along their active
// edges together. Ten illustrative outputs arrive together at the distribution.
// Their median is the existing Prediction marker. Only after that aggregation
// does one point appear on the original predicted-flow curve. The measured
// curve is a reference, not a model output. Source curves and uncertainty stay
// unchanged. Three displayed masks plus the ellipsis represent n=10.
//
// Usage: node scripts/motion/monte-carlo.cjs
// Output: public/motion/respiratory-flow-reconstruction.{mp4,gif,jpg} and
//         public/motion/monte-carlo-manifest.json. Frames render into a temp
//         directory outside the repository and are deleted after encoding and
//         validation. Pure local Sharp/SVG compositing; no network, no devices.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { encodeFrames, WIDTH, HEIGHT, FPS } = require('./encode.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'public', 'images', 'mdpi_tm_abstract.webp');
const OUT = path.join(ROOT, 'public', 'motion', 'respiratory-flow-reconstruction');
const CROP = { left: 0, top: 3310, width: 2301, height: 1366 };
const DURATION = 6;
const CAPTION = 'Illustrative: parallel dropout → Prediction (median) → flow point';
const CAPTION_H = 30;
// #dce1d5, the project card panel colour behind the images; ink matches it.
const BG = { r: 220, g: 225, b: 213 };
const INK = '#1d2f28';
const NET_COLORS = ['#e30b0b', '#005c7c', '#f68422'];

// ---- timeline (seconds). Same first and last frame: overlay opacity is 0 for
// t < SETTLE and for t >= FADE_END, and FADE_END = DURATION - 3/FPS.
const SETTLE = 0.2;
const CYCLES = 12, CYCLE_DT = 0.45, TRAVEL = 0.18, FALL = 0.12, AGGREGATE = 0.10;
const FADE_AT = 5.7, FADE_END = DURATION - 3 / FPS;
const PASSES = 10; // the paper states n=10

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = u => { u = clamp(u, 0, 1); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
const phase = (t, start, dur) => clamp((t - start) / dur, 0, 1);

// ---------------------------------------------------------------- geometry --
function polylineLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function pointAt(pts, dist) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d + seg >= dist) return [lerp(pts[i - 1][0], pts[i][0], (dist - d) / seg), lerp(pts[i - 1][1], pts[i][1], (dist - d) / seg)];
    d += seg;
  }
  return pts[pts.length - 1].slice();
}
function subPolyline(pts, from, to) {
  const out = [pointAt(pts, from)];
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d > to) break;
    if (d + seg >= from && d + seg <= to) out.push(pts[i]);
    d += seg;
  }
  out.push(pointAt(pts, to));
  return out;
}
function pathD(pts) {
  return 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');
}
// Travelling dash along an existing drawn path ("comet"), as in breathing.cjs.
function comet(pts, u, { color, width, opacity, dash }) {
  const head = clamp(u, 0, 1) * polylineLength(pts);
  const tail = subPolyline(pts, Math.max(0, head - dash), head);
  return `<path d="${pathD(tail)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity.toFixed(3)}"
    stroke-linecap="round"/>`;
}

// ------------------------------------------------------------ figure reading --
// All detection below runs on the figure's own pixels. Nothing is hardcoded
// that the pixels can answer: node centres, active (black) edges, the printed
// sigma lines, the distribution axis, the plot frames and both curves are
// measured, then asserted, so the overlays stay locked onto the drawing.
async function loadRaw() {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
}
const makeAt = px => (x, y) => {
  const i = (y * px.W + x) * px.C;
  return [px.data[i], px.data[i + 1], px.data[i + 2]];
};
const dark = p => p[0] < 70 && p[1] < 70 && p[2] < 70;

// Filled disks: a pixel is a disk core when its 22x22 box is fully dark, so
// 2-3px edges, dashed arrows and the layer-ellipsis squares cannot form cores.
function findDisks(px, region, isMember) {
  const at = makeAt(px);
  const { x0, y0, x1, y1 } = region;
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const mask = new Uint8Array(w * h);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (isMember(at(x, y))) mask[(y - y0) * w + (x - x0)] = 1;
  const integ = new Int32Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    integ[(y + 1) * (w + 1) + (x + 1)] = mask[y * w + x] + integ[y * (w + 1) + (x + 1)] + integ[(y + 1) * (w + 1) + x] - integ[y * (w + 1) + x];
  const boxFull = (x, y) => {
    const r = 11, ax = clamp(x - r, 0, w - 1), ay = clamp(y - r, 0, h - 1), bx = clamp(x + r, 0, w - 1), by = clamp(y + r, 0, h - 1);
    const s = integ[(by + 1) * (w + 1) + (bx + 1)] - integ[ay * (w + 1) + (bx + 1)] - integ[(by + 1) * (w + 1) + ax] + integ[ay * (w + 1) + ax];
    return s === (bx - ax + 1) * (by - ay + 1);
  };
  const core = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x] && boxFull(x, y)) core[y * w + x] = 1;
  const seen = new Uint8Array(w * h);
  const blobs = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!core[y * w + x] || seen[y * w + x]) continue;
    const stack = [[x, y]];
    seen[y * w + x] = 1;
    let sx = 0, sy = 0, n = 0, bx0 = x, bx1 = x, by0 = y, by1 = y;
    while (stack.length) {
      const [cx, cy] = stack.pop();
      sx += cx; sy += cy; n++;
      bx0 = Math.min(bx0, cx); bx1 = Math.max(bx1, cx); by0 = Math.min(by0, cy); by1 = Math.max(by1, cy);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || !core[ny * w + nx] || seen[ny * w + nx]) continue;
        seen[ny * w + nx] = 1;
        stack.push([nx, ny]);
      }
    }
    blobs.push({ x: x0 + sx / n, y: y0 + sy / n, n, w: bx1 - bx0 + 1, h: by1 - by0 + 1 });
  }
  return blobs;
}

// Node graph of the three printed dropout masks. The disk-core test only
// finds FILLED (black = active) nodes; inactive white neurons stay undetected
// and therefore never receive any overlay.
function detectNetworks(px) {
  const region = { x0: 0, y0: 3545, x1: 1719, y1: 4160 };
  const blobs = findDisks(px, region, dark).filter(b => b.n >= 200 && b.w <= 44 && b.h <= 44 && Math.abs(b.w - b.h) <= 14);
  const at = makeAt(px);
  const tops = blobs.filter(b => b.y < 3650).sort((a, b) => a.x - b.x);
  assert.equal(tops.length, 3, `Expected 3 input nodes, found ${tops.length}`);
  const nets = tops.map(t => ({ top: t, layers: [[], []], out: null }));
  for (const b of blobs) {
    if (b === tops[0] || b === tops[1] || b === tops[2]) continue;
    let net = 0;
    for (let k = 1; k < nets.length; k++) if (Math.abs(nets[k].top.x - b.x) < Math.abs(nets[net].top.x - b.x)) net = k;
    if (b.y < 3850) nets[net].layers[0].push(b);
    else if (b.y < 4050) nets[net].layers[1].push(b);
  }
  const colored = [];
  for (const test of [
    p => p[0] > 200 && p[1] < 80 && p[2] < 80,            // red output
    p => p[0] < 80 && p[1] > 55 && p[1] < 140 && p[2] > 85, // teal output
    p => p[0] > 225 && p[1] > 95 && p[1] < 175 && p[2] < 90, // orange output
  ]) {
    const found = findDisks(px, { x0: 0, y0: 4050, x1: 1719, y1: 4165 }, test).filter(b => b.n >= 200);
    assert.equal(found.length, 1, 'Expected exactly one printed output node per colour.');
    colored.push(found[0]);
  }
  for (const net of nets) {
    for (const layer of net.layers) {
      layer.sort((a, b) => a.x - b.x);
      assert.ok(layer.length >= 1, 'Each drawn mask needs an active node per hidden layer.');
    }
    let out = 0;
    for (let k = 1; k < colored.length; k++) if (Math.abs(colored[k].x - net.top.x) < Math.abs(colored[out].x - net.top.x)) out = k;
    net.out = colored[out];
  }
  // Active edges: the printed black connectors. The figure anchors edges at
  // the source node's lower rim, but the target-side anchor varies (centre,
  // top point, or facing rim), so each station along the source-bottom ->
  // target-centre chord searches a disk wide enough for every anchor style.
  // Ink within 32px of either node centre is ignored (rings and fills must
  // not fake an edge). A pair counts as a drawn black edge when >=85% of
  // stations see ink; the surviving ink's centroid per station gives the
  // printed line's real polyline for the comets to ride. Gray inactive
  // connectors (~rgb 172-183) and point-like crossings stay far below that
  // threshold.
  const R = 28;
  const drawnEdge = (a, b) => {
    const sx = a.x, sy = a.y + R, tx = b.x, ty = b.y;
    const dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
    if (d < 80) return null;
    let hits = 0, tries = 0;
    const snapped = [];
    for (let k = 2; k <= 21; k++) {
      const u = k / 23;
      if (u < 34 / d || u > 1 - 34 / d) continue;
      tries++;
      const cx = Math.round(sx + dx * u), cy = Math.round(sy + dy * u);
      const rho = 1.6 * u * R + 6, rMax = Math.ceil(rho);
      const darkAt = [];
      for (let oy = -rMax; oy <= rMax; oy++) for (let ox = -rMax; ox <= rMax; ox++) {
        if (ox * ox + oy * oy > rho * rho) continue;
        const X = cx + ox, Y = cy + oy;
        if ((X - a.x) ** 2 + (Y - a.y) ** 2 <= 1024 || (X - b.x) ** 2 + (Y - b.y) ** 2 <= 1024) continue;
        const p = at(X, Y);
        if (p[0] < 120 && p[1] < 120 && p[2] < 120) darkAt.push([X, Y]);
      }
      if (darkAt.length) {
        hits++;
        snapped.push([darkAt.reduce((s2, q) => s2 + q[0], 0) / darkAt.length, darkAt.reduce((s2, q) => s2 + q[1], 0) / darkAt.length]);
      }
    }
    return tries > 6 && hits / tries >= 0.85 ? snapped : null;
  };
  for (const net of nets) {
    net.active = [[], [], []]; // top->h1, h1->h2, h2->out
    net.layers[0].forEach((n, i) => {
      const pts = drawnEdge(net.top, n);
      if (pts) net.active[0].push({ i, pts });
    });
    for (const e0 of net.active[0]) for (let j = 0; j < net.layers[1].length; j++) {
      const pts = drawnEdge(net.layers[0][e0.i], net.layers[1][j]);
      if (pts) net.active[1].push({ i: e0.i, j, pts });
    }
    net.layers[1].forEach((n, i) => {
      const pts = drawnEdge(n, net.out);
      if (pts) net.active[2].push({ i, pts });
    });
    assert.ok(net.active[0].length >= 1 && net.active[1].length >= 1 && net.active[2].length >= 1, 'Every network needs a drawn active path.');
  }
  return nets;
}

// Printed distribution: axis y, the two printed teal 2sigma dashed lines, the
// printed red Prediction dashed line, and the printed sample dots, so staged
// samples land beside printed ones, never on top of them.
function detectDistribution(px) {
  const at = makeAt(px);
  const teal = p => Math.abs(p[0] - 32) < 45 && p[1] > 125 && p[1] < 180 && p[2] > 95 && p[2] < 150;
  const red = p => p[0] > 200 && p[1] < 90 && p[2] < 90;
  // Per-column hit counts; a vertical dashed line yields a tall single-column
  // count, so groups are compared by their peak column, not their sum (the red
  // arrow and the red dot would otherwise out-sum the thin printed line).
  const colCounts = (test) => {
    const c = new Map();
    for (let x = 380; x <= 1080; x++) {
      let n = 0;
      for (let y = 4290; y <= 4620; y++) if (test(at(x, y))) n++;
      if (n > 0) c.set(x, n);
    }
    return c;
  };
  const groups = (counts, minPeak) => {
    const xs = [...counts.keys()].sort((a, b) => a - b);
    const gs = [];
    for (const x of xs) {
      const g = gs[gs.length - 1];
      if (g && x - g.x1 <= 6) { g.x1 = x; g.peak = Math.max(g.peak, counts.get(x)); }
      else gs.push({ x0: x, x1: x, peak: counts.get(x) });
    }
    return gs.filter(g => g.peak >= minPeak);
  };
  const sigma = groups(colCounts(teal), 60);
  assert.equal(sigma.length, 2, `Expected the two printed sigma lines, found ${sigma.length}`);
  const center = g => (g.x0 + g.x1) / 2;
  const pred = groups(colCounts(red), 60);
  assert.ok(pred.length >= 1, 'Printed Prediction line not found.');
  const predLine = pred.reduce((m, g) => g.peak > m.peak ? g : m);
  let yAxis = 0, best = 0;
  for (let y = 4530; y <= 4565; y++) {
    let n = 0;
    for (let x = 300; x <= 1400; x++) if (dark(at(x, y))) n++;
    if (n > best) { best = n; yAxis = y; }
  }
  assert.ok(best > 500, 'Distribution axis not found.');
  const dotTests = [
    p => p[0] > 200 && p[1] < 80 && p[2] < 80,
    p => p[0] < 80 && p[1] > 55 && p[1] < 140 && p[2] > 85,
    p => p[0] > 225 && p[1] > 95 && p[1] < 175 && p[2] < 90,
  ];
  const printedDots = [];
  for (const test of dotTests) {
    const found = findDisks(px, { x0: 480, y0: 4515, x1: 1100, y1: 4580 }, test).filter(b => b.n >= 30);
    assert.equal(found.length, 1, 'Expected one printed coloured dot per colour.');
    printedDots.push(found[0].x);
  }
  // Gray printed dots: the black axis line splits each disk, so count per
  // column instead of disk cores, then group column runs into dot centres.
  // The printed figure shows exactly ten sample dots (7 gray + 3 coloured),
  // matching the paper's n=10.
  const grayRuns = [];
  for (let x = 470; x <= 1100; x++) {
    let n = 0;
    for (let y = 4518; y <= 4578; y++) {
      const p = at(x, y);
      if (p[0] >= 230 && p[0] <= 250 && Math.abs(p[0] - p[1]) <= 4 && Math.abs(p[1] - p[2]) <= 4) n++;
    }
    if (n >= 18) {
      const g = grayRuns[grayRuns.length - 1];
      if (g && x - g.x1 <= 4) g.x1 = x;
      else grayRuns.push({ x0: x, x1: x });
    }
  }
  const printedDotXs = [...printedDots, ...grayRuns.map(g => (g.x0 + g.x1) / 2)].sort((a, b) => a - b);
  return { yAxis, sigmaLo: center(sigma[0]), sigmaHi: center(sigma[1]), predX: center(predLine), printedDotXs };
}

// Plot frames and the 0 s / 8 s tick columns of the measured plot.
function detectPlots(px) {
  const at = makeAt(px);
  // Frame strokes: the left spine prints gray (~85) and the right spine
  // black (~0); both are neutral, so one neutral-dark test covers them.
  const frame = p => p[0] <= 130 && Math.abs(p[0] - p[1]) <= 10 && Math.abs(p[1] - p[2]) <= 10;
  const vCols = [];
  for (let x = 1640; x <= 2300; x++) {
    let n = 0;
    for (let y = 3500; y <= 4660; y++) if (frame(at(x, y))) n++;
    if (n > 800) vCols.push(x);
  }
  const hRows = [];
  for (let y = 3480; y <= 4680; y++) {
    let n = 0;
    for (let x = 1700; x <= 2268; x++) if (frame(at(x, y))) n++;
    if (n > 400) hRows.push(y);
  }
  const collapse = (arr) => {
    const gs = [];
    for (const v of arr) {
      const g = gs[gs.length - 1];
      if (g && v - g[g.length - 1] <= 3) g.push(v); else gs.push([v]);
    }
    return gs.map(g => g.reduce((a, b) => a + b, 0) / g.length);
  };
  const vx = collapse(vCols), hy = collapse(hRows);
  assert.equal(vx.length, 2, `Expected 2 plot frame columns, found ${vx.length}`);
  assert.equal(hy.length, 4, `Expected 4 plot frame rows, found ${hy.length}`);
  const [x0, x1] = vx;
  const ticks = [];
  for (let x = Math.round(x0) + 5; x <= Math.round(x1) - 5; x++) {
    let n = 0;
    for (let y = 4017; y <= 4027; y++) { const p = at(x, y); if (p[0] < 130 && p[1] < 130 && p[2] < 130) n++; }
    if (n >= 4) ticks.push(x);
  }
  const tickXs = collapse(ticks);
  assert.equal(tickXs.length, 9, `Expected 9 time ticks, found ${tickXs.length}`);
  return { x0, x1, measured: { y0: hy[0], y1: hy[1] }, predicted: { y0: hy[2], y1: hy[3] }, t0: tickXs[0], t8: tickXs[8] };
}

const greenLine = p => p[1] > 150 && p[1] - p[0] >= 35 && p[1] - p[2] >= 12 && p[0] > 70;
const orangeLine = p => p[0] >= 235 && p[0] - p[1] >= 70 && p[1] >= 100 && p[1] <= 190 && p[2] >= 40 && p[2] <= 160;

// Per-column trace of a printed curve; the median of each column's hits rides
// the line, also where it runs steeply.
function traceCurve(px, bounds, test) {
  const at = makeAt(px);
  const pts = [];
  for (let x = Math.round(bounds.x0) + 4; x <= Math.round(bounds.x1) - 4; x++) {
    const ys = [];
    for (let y = Math.round(bounds.y0) + 4; y <= Math.round(bounds.y1) - 4; y++) if (test(at(x, y))) ys.push(y);
    if (ys.length) pts.push([x, ys[Math.floor(ys.length / 2)]]);
  }
  assert.ok(pts.length > 400, `Curve trace too sparse (${pts.length} columns).`);
  return pts.map((p, i) => {
    if (i === 0 || i === pts.length - 1) return p;
    const ys = [pts[i - 1][1], p[1], pts[i + 1][1]].sort((a, b) => a - b);
    return [p[0], ys[1]];
  });
}
const yAt = (pts, x) => {
  if (x <= pts[0][0]) return pts[0][1];
  if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  let i = 0;
  while (pts[i + 1][0] < x) i++;
  return lerp(pts[i][1], pts[i + 1][1], (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]));
};

// Staged sample plan: ten fractions of the printed sigma spacing around the
// printed Prediction line. Animation props with a visible spread, not
// measured values. All samples arrive together; the set stays fixed.
const SAMPLE_FRACTIONS = [-1.8, -1.3, -0.9, -0.5, -0.2, 0.2, 0.5, 0.9, 1.3, 1.8];
const SAMPLE_LAYOUT = [7, 1, 8, 3, 6, 0, 5, 2, 9, 4];
function samplePlan(dist) {
  const sigmaPx = (dist.sigmaHi - dist.sigmaLo) / 4;
  const xs = SAMPLE_FRACTIONS.map(f => dist.predX + f * sigmaPx);
  // Staggered strip above the printed dots, clear of the printed dot row.
  const cy = i => dist.yAxis - 40 + ((i * 7) % 3) * 10;
  const order = SAMPLE_LAYOUT.map(i => ({ x: xs[i], y: cy(i), k: i }));
  const sorted = [...xs].sort((a, b) => a - b);
  const medianX = (sorted[4] + sorted[5]) / 2; // n=10 -> mean of the two middle samples
  assert.ok(Math.abs(medianX - dist.predX) < 1e-6, 'Staged median must equal the printed Prediction marker.');
  return { xs, order, medianX };
}
const scanXs = plots => Array.from({ length: CYCLES }, (_, i) => plots.t0 + ((plots.t8 - plots.t0) * (i + 0.5)) / CYCLES);
const ensembleTiming = step => {
  const start = SETTLE + step * CYCLE_DT;
  return { start, starts: Array(PASSES).fill(start), land: start + TRAVEL + FALL, commit: start + TRAVEL + FALL + AGGREGATE };
};
const plotCount = t => Array.from({ length: CYCLES }, (_, step) => ensembleTiming(step)).filter(s => t >= s.commit).length;

// --------------------------------------------------------------- frame art --
function computeLayout() {
  const areaH = HEIGHT - CAPTION_H;
  const scale = Math.min(WIDTH / CROP.width, areaH / CROP.height);
  const w = Math.round(CROP.width * scale), h = Math.round(CROP.height * scale);
  return { scale, w, h, left: Math.round((WIDTH - w) / 2), top: Math.round((areaH - h) / 2) };
}
function captionSvg() {
  return `<rect x="0" y="${HEIGHT - CAPTION_H}" width="${WIDTH}" height="${CAPTION_H}" fill="${INK}"/>
    <text x="${WIDTH / 2}" y="${HEIGHT - CAPTION_H / 2 + 4.5}" text-anchor="middle" font-family="Menlo, Monaco, monospace"
      font-size="13" letter-spacing="0.4" fill="#f2f4ee">${CAPTION}</text>`;
}
function baseSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="rgb(${BG.r},${BG.g},${BG.b})"/>${captionSvg()}</svg>`;
}

// Per-frame overlay. All passes share one global group opacity, so the first
// and last frames carry no overlay pixels at all.
function overlaySvg(t, ctx) {
  const F = ctx.F;
  const el = [];
  const g = clamp(1 - phase(t, FADE_AT, FADE_END - FADE_AT), 0, 1);
  const vis = u => u > 0.001;
  const ring = (p, r0, r1, u, color, w) => {
    if (!vis(u) || u >= 1) return;
    el.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${lerp(r0, r1, u).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${(0.85 * (1 - u) * g).toFixed(3)}"/>`);
  };

  for (let step = 0; step < CYCLES; step++) {
    const clock = ensembleTiming(step);
    if (t < clock.start) continue;
    // Every displayed network and every active branch shares the same clock.
    for (let n = 0; n < ctx.waves.length; n++) {
      const wave = ctx.waves[n], color = NET_COLORS[n];
      // Pulse the existing active neurons without redrawing or bending any wiring.
      for (let layer = 0; layer < 4; layer++) for (const point of wave.nodes[layer]) {
        ring(point, 12, 23, phase(t, clock.start + layer * TRAVEL / 3, 0.3), color, 3);
      }
    }
    const fu = phase(t, clock.start + TRAVEL, FALL);
    const sampleOpacity = g * (1 - phase(t, clock.commit + 0.02, 0.03));
    for (let i = 0; i < PASSES; i++) {
      const color = NET_COLORS[i % 3], land = ctx.plan.order[i];
      const end = F(land.x, land.y);
      if (vis(fu) && fu < 1) {
        const from = ctx.waves[i % 3].nodes[3][0];
        const control = [lerp(from[0], end[0], 0.72), lerp(from[1], end[1], 0.32)];
        const bez = Array.from({ length: 25 }, (_, k) => {
          const v = k / 24, w = 1 - v;
          return [w*w*from[0] + 2*w*v*control[0] + v*v*end[0], w*w*from[1] + 2*w*v*control[1] + v*v*end[1]];
        });
        el.push(comet(bez, fu, { color, width: 2.5, opacity: 0.7 * g, dash: 26 }));
        const head = pointAt(bez, fu * polylineLength(bez));
        el.push(`<circle cx="${head[0]}" cy="${head[1]}" r="4.5" fill="${color}" fill-opacity="${0.95*g}"/>`);
      }
      if (fu >= 1 && sampleOpacity > 0.001) {
        el.push(`<circle cx="${end[0]}" cy="${end[1]}" r="7" fill="${color}" fill-opacity="${0.95*sampleOpacity}" stroke="${INK}" stroke-opacity="${sampleOpacity}" stroke-width="1.6"/>`);
      }
    }
    // The original red Prediction marker IS the median. Never add another tick.
    ring(F(ctx.dist.predX, ctx.dist.yAxis), 12, 28, phase(t, clock.land, AGGREGATE + 0.15), NET_COLORS[0], 3);
  }

  const count = plotCount(t);
  for (let step = 0; step < count; step++) {
    const x = Math.round(ctx.scanXs[step]);
    const predicted = F(x, yAt(ctx.orange, x));
    el.push(`<circle cx="${predicted[0]}" cy="${predicted[1]}" r="4.5" fill="${INK}" fill-opacity="${0.95*g}"/>`);
    el.push(`<circle cx="${predicted[0]}" cy="${predicted[1]}" r="1.8" fill="#ffffff" fill-opacity="${0.9*g}"/>`);
    ring(predicted, 8, 19, phase(t, ensembleTiming(step).commit, 0.35), INK, 2.5);
  }
  if (count > 0) {
    const x = Math.round(ctx.scanXs[count - 1]);
    // Hollow marker identifies the measured reference at the same time, not an output.
    const reference = F(x, yAt(ctx.green, x));
    el.push(`<circle cx="${reference[0]}" cy="${reference[1]}" r="4.5" fill="none" stroke="${INK}" stroke-width="2" stroke-opacity="${0.9*g}"/>`);
    ring(reference, 8, 19, phase(t, ensembleTiming(count - 1).commit, 0.35), INK, 1.5);
    for (const pts of [ctx.orange, ctx.green]) {
      const tail = [];
      for (let xx = Math.max(pts[0][0], x - 64); xx <= x; xx += 4) tail.push(F(xx, yAt(pts, xx)));
      tail.push(F(x, yAt(pts, x)));
      el.push(`<path d="${pathD(tail)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-opacity="${0.38*g}" stroke-linecap="round"/>`);
    }
  }
  return `<g>${el.join('\n')}</g>`;
}

// -------------------------------------------------------------- render main --
async function renderBase(layout) {
  const crop = await sharp(SRC).extract(CROP).resize(layout.w, layout.h).removeAlpha().raw().toBuffer();
  // Order matters: the background plate first, the preserved figure crop on
  // top of it, and the caption bar last. baseSvg's own background rect would
  // otherwise paint over the figure. SVG composites carry alpha, so the raw
  // buffer must be forced back to 3 channels or every pixel read shifts.
  return sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: BG } })
    .composite([
      { input: Buffer.from(baseSvg()) },
      { input: crop, raw: { width: layout.w, height: layout.h, channels: 3 }, left: layout.left, top: layout.top },
    ]).removeAlpha().raw().toBuffer();
}

async function renderFrames(TMP, ctx, base) {
  const files = [];
  for (let f = 0; f < FPS * DURATION; f++) {
    const t = f / FPS;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">${overlaySvg(t, ctx)}</svg>`;
    const jpg = await sharp(base, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
      .composite([{ input: Buffer.from(svg) }])
      .jpeg({ quality: 92 }).toBuffer();
    const name = `frame_${String(f).padStart(6, '0')}.jpg`;
    fs.writeFileSync(path.join(TMP, name), jpg);
    files.push(name);
  }
  return files;
}

// Frame-diff validation: motion must show in the three animated areas and in
// both right plots; the printed title area must not move; first and last
// frames must match; no global brightness swing.
async function validate(TMP, ctx, files) {
  const raws = [];
  for (const name of files) raws.push(await sharp(path.join(TMP, name)).removeAlpha().raw().toBuffer());
  const W = WIDTH, H = HEIGHT, C = 3;
  const layout = ctx.layout;
  const region = (x0, x1, y0, y1) => ({
    x0: Math.max(0, Math.round((x0 - CROP.left) * layout.scale + layout.left)),
    x1: Math.min(W - 1, Math.round((x1 - CROP.left) * layout.scale + layout.left)),
    y0: Math.max(0, Math.round((y0 - CROP.top) * layout.scale + layout.top)),
    y1: Math.min(H - 1, Math.round((y1 - CROP.top) * layout.scale + layout.top)),
  });
  const regions = {
    network: region(20, 1700, 3563, 4160),
    distribution: region(430, 1050, 4290, 4620),
    measuredPlot: region(ctx.plots.x0, ctx.plots.x1, ctx.plots.measured.y0, ctx.plots.measured.y1),
    predictedPlot: region(ctx.plots.x0, ctx.plots.x1, ctx.plots.predicted.y0, ctx.plots.predicted.y1),
    staticTitle: region(60, 1620, 3315, 3400),
  };
  const stats = {};
  for (const name of Object.keys(regions)) stats[name] = { peak: 0, frame: -1 };
  let brightMin = 255, brightMax = 0;
  const first = raws[0], last = raws[raws.length - 1];
  let boundaryDiff = 0;
  for (let f = 0; f < raws.length; f++) {
    const a = raws[f];
    let sum = 0;
    for (let i = 0; i < a.length; i += 3) sum += a[i] + a[i + 1] + a[i + 2];
    const bright = sum / (a.length / 3 * 3);
    brightMin = Math.min(brightMin, bright); brightMax = Math.max(brightMax, bright);
    for (const [name, r] of Object.entries(regions)) {
      let diff = 0, n = 0;
      for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) {
        const i = (y * W + x) * C;
        diff += Math.abs(a[i] - first[i]) + Math.abs(a[i + 1] - first[i + 1]) + Math.abs(a[i + 2] - first[i + 2]);
        n += 3;
      }
      const mean = diff / n;
      if (mean > stats[name].peak) { stats[name].peak = mean; stats[name].frame = f; }
    }
    if (f === raws.length - 1) {
      for (let i = 0; i < a.length; i += 7) boundaryDiff += Math.abs(a[i] - first[i]);
      boundaryDiff /= (a.length / 7);
    }
  }
  const checks = {
    staticTitleCalm: stats.staticTitle.peak < 0.5,
    // Detect local activity without requiring changes to the large static background.
    networkMotion: stats.network.peak > 0.2,
    distributionMotion: stats.distribution.peak > 0.6,
    measuredPlotMotion: stats.measuredPlot.peak > 0.5,
    predictedPlotMotion: stats.predictedPlot.peak > 0.5,
    seamlessBoundary: boundaryDiff < 0.3,
    noBrightnessSwing: brightMax - brightMin < 5,
  };
  const poster = fs.readFileSync(`${OUT}.jpg`);
  checks.posterMatchesFirstFrame = poster.equals(fs.readFileSync(path.join(TMP, files[0])));
  const evidence = {
    clip: 'respiratory-flow-reconstruction',
    generatedBy: 'scripts/motion/monte-carlo.cjs',
    durationSeconds: DURATION, fps: FPS, frames: files.length,
    layout, regions: stats, boundaryMeanAbsDiff: boundaryDiff,
    brightness: { min: brightMin, max: brightMax },
    checks, allChecksPass: Object.values(checks).every(Boolean),
  };
  const evidenceDir = '/tmp/portfolio-motion-evidence';
  fs.mkdirSync(evidenceDir, { recursive: true });
  fs.writeFileSync(path.join(evidenceDir, 'respiratory-flow-reconstruction-monte-carlo-evidence.json'), JSON.stringify(evidence, null, 2));
  for (const [name, ok] of Object.entries(checks)) assert.ok(ok, `Validation failed: ${name}`);
  return evidence;
}

function buildManifest(mp4Bytes, gifBytes) {
  return [{
    id: 'respiratory-flow-reconstruction',
    title: 'Respiratory Flow Reconstruction',
    kind: 'illustrative',
    description: 'Illustrative parallel Monte Carlo dropout over twelve shared time steps. All displayed subnetworks pulse their active layers together. Ten staged outputs arrive together and aggregate at the existing Prediction marker, which is their median. Only then does one point appear on the original predicted-flow curve. A hollow marker follows the measured reference. Original curves, uncertainty, labels and inactive neurons remain unchanged.',
    sources: ['/images/mdpi_tm_abstract.webp'],
    duration: DURATION,
    files: { mp4: 'respiratory-flow-reconstruction.mp4', gif: 'respiratory-flow-reconstruction.gif', poster: 'respiratory-flow-reconstruction.jpg' },
    notes: [
      'Illustrative samples, not new measured data or computed study results.',
      'The three displayed masks plus the original ellipsis represent n=10; the existing active neurons pulse in layer order, concurrently across the networks.',
      'For each shared input, ten outputs arrive together. Their centered sample median equals the existing printed Prediction marker.',
      'After aggregation, exactly one point appears on the predicted-flow curve. Measured flow remains a reference, not an ensemble output.',
      'Original curves, printed samples, uncertainty bounds, values and inactive white neurons remain unchanged.',
      'The loop starts and ends on the same clean frame.',
    ],
    bytes: { mp4: mp4Bytes, gif: gifBytes },
  }];
}

async function main() {
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-motion-mc-'));
  try {
    const px = await loadRaw();
    const nets = detectNetworks(px);
    const dist = detectDistribution(px);
    const plots = detectPlots(px);
    const plotX = { x0: plots.x0, x1: plots.x1 };
    const green = traceCurve(px, { ...plots.measured, ...plotX }, greenLine);
    const orange = traceCurve(px, { ...plots.predicted, ...plotX }, orangeLine);
    const plan = samplePlan(dist);
    const layout = computeLayout();
    const F = (x, y) => [(x - CROP.left) * layout.scale + layout.left, (y - CROP.top) * layout.scale + layout.top];
    const fp = node => F(node.x, node.y);
    const waves = nets.map(net => ({
      nodes: [[fp(net.top)], net.layers[0].map(fp), net.layers[1].map(fp), [fp(net.out)]],

    }));
    const ctx = { nets, dist, plots, green, orange, plan, layout, waves, scanXs: scanXs(plots), F };
    const base = await renderBase(layout);
    const files = await renderFrames(TMP, ctx, base);
    const result = await encodeFrames(TMP, OUT, DURATION, 2, 192);
    const evidence = await validate(TMP, ctx, files);
    const manifest = buildManifest(result.mp4Bytes, result.gifBytes);
    fs.writeFileSync(path.join(ROOT, 'public', 'motion', 'monte-carlo-manifest.json'), JSON.stringify(manifest, null, 2));
    console.log('monte-carlo render complete:', JSON.stringify(result));
    console.log('validation:', JSON.stringify({ checks: evidence.checks, regions: evidence.regions, brightness: evidence.brightness, boundaryMeanAbsDiff: evidence.boundaryMeanAbsDiff }));
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}
if (require.main === module) main().catch(err => { console.error(err); process.exit(1); });

module.exports = { clamp, lerp, ease, phase, polylineLength, pointAt, subPolyline, pathD, comet, loadRaw, makeAt, dark, findDisks, detectNetworks, detectDistribution, detectPlots, traceCurve, yAt, greenLine, orangeLine, SAMPLE_FRACTIONS, SAMPLE_LAYOUT, samplePlan, scanXs, computeLayout, captionSvg, baseSvg, overlaySvg, renderBase, SRC, CROP, OUT, WIDTH, HEIGHT, FPS, DURATION, CAPTION, CAPTION_H, BG, INK, NET_COLORS, SETTLE, CYCLES, CYCLE_DT, TRAVEL, FALL, AGGREGATE, ensembleTiming, plotCount, FADE_AT, FADE_END, PASSES };
