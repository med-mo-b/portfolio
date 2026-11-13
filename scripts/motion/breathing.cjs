#!/usr/bin/env node
// Renders the two fixed-camera content-motion loops the user asked for:
// thoraxmonitor (illustrative breathing) and respiratory-flow-reconstruction
// (illustrative signal flow). Unlike static.cjs there is no camera move and no
// full-frame light change: the original image stays pixel-stationary and only
// local overlays animate.
//
// Respiratory CLI renders now delegate to monte-carlo.cjs for the lower figure.
// The upper-figure helpers below are retained as reference, not used by the CLI.
// v3 feedback applied here:
//   thoraxmonitor: the drawn lung itself breathes - the original lung pixels
//     are isolated by a flood-fill mask and scaled a few percent about their
//     own centroid, so the lung visibly expands and contracts inside the torso
//     instead of only glowing. Antenna flashes are bounded to one flash per
//     breath, and the comet pulses on the drawn cables got brighter, thicker
//     heads and visible tails.
//   respiratory-flow-reconstruction: the lung inside the paper figure's torso
//     breathes the same way. Antenna and wire pulses are stronger. The scan
//     marker now respects the legend: the legend rectangle is defined in
//     source coordinates and every moving overlay element (marker, trail,
//     hairline, glows) is clipped out of it, and the marker fades out before
//     the legend occludes the curve and only resumes where the curve is
//     visible again. The curve trace never infers the curve through the legend
//     region.
//
// The measured flow curve is traced from the figure's own pixels at render
// time (with short manually read anchors where the curve runs behind the
// semi-transparent legend; the marker is hidden there), so the scan marker
// follows the drawn data wherever it is visible.
//
// Usage: node scripts/motion/breathing.cjs [--only <id>]
// Output: public/motion/<id>.mp4, <id>.gif, <id>.jpg and
//         public/motion/breathing-v2-manifest.json (exactly the two ids).
// Frames render into a temp directory outside the repository and are deleted
// after encoding. Pure Sharp/SVG compositing; no network, no model calls.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');
const { encodeFrames, WIDTH, HEIGHT, FRAMES } = require('./encode.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'motion');
// Exact mkdtemp directory only; deleted by the same handle after encoding.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-motion-breathing-v3-'));
// #dce1d5, the project card panel colour behind the images.
const BG = { r: 220, g: 225, b: 213 };
const INK = '#1d2f28';

const PILL_TEXT = { thoraxmonitor: 'Illustrative breathing', 'respiratory-flow-reconstruction': 'Illustrative signal flow' };

function pillSvg(text) {
  const w = 218;
  return `<rect x="${1188 - 16 - w}" y="698" width="${w}" height="30" rx="15" fill="${INK}" fill-opacity="0.82"/>
    <text x="${1188 - 16 - w / 2}" y="718" text-anchor="middle" font-family="Menlo, Monaco, monospace" font-size="13" letter-spacing="0.4" fill="#f2f4ee">${text}</text>`;
}

// ---------------------------------------------------------------- geometry --
// All source coordinates are pixels of the original images; toFrame() maps them
// into the 1188x744 card frame the same way static.cjs places contain-fit.
async function containLayout(srcW, srcH) {
  const scale = Math.min(WIDTH / srcW, HEIGHT / srcH);
  const w = Math.round(srcW * scale);
  const h = Math.round(srcH * scale);
  return { scale, w, h, left: Math.round((WIDTH - w) / 2), top: Math.round((HEIGHT - h) / 2) };
}
const lerp = (a, b, u) => a + (b - a) * u;

// Legend box of the MDPI figure, measured in SOURCE pixel coordinates. Every
// moving overlay element is clipped out of this rectangle and the curve trace
// never accepts candidates inside it.
const LEGEND = { x0: 1743, x1: 2149, y0: 346, y1: 584 };

function polylineLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
function pathD(pts) {
  return 'M' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L');
}
// Single travelling dash ("comet") along a path; u in [0,1) places the dash head.
function comet(pts, u, { color, width, opacity, dash }) {
  const L = polylineLength(pts);
  return `<path d="${pathD(pts)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}"
    stroke-linecap="round" stroke-dasharray="${dash} ${L + 60}" stroke-dashoffset="${(-u * L).toFixed(2)}"/>`;
}

// -------------------------------------------------- measured-curve tracing --
// Traces the gray "Flow measured" line inside the plot of the MDPI figure so
// the scan marker follows the drawn data instead of an invented path.
function traceFlowCurve(px, W, C) {
  const X0 = 1015, X1 = 2155, Y0 = 30, Y1 = 595, ZERO = 335;
  const LEG = LEGEND;
  // Inside the legend's x-range the curve may only be claimed where it is
  // really visible: above the legend box. Frost-blue volume fill and legend
  // ink behind the translucent box must never produce curve points.
  const inLegendX = x => x >= LEG.x0 - 2 && x <= LEG.x1 + 2;
  const visibleY = y => y <= LEG.y0 - 5 || y >= LEG.y1 + 5;
  const inLegend = (x, y) => inLegendX(x) && !visibleY(y);
  // The legend's colour swatches sit on top of the curve region; ignore them.
  const SWATCH = [{ x0: 1770, x1: 1862, y0: 448, y1: 492 }, { x0: 1770, x1: 1862, y0: 522, y1: 568 }];
  const inSwatch = (x, y) => SWATCH.some(s => x >= s.x0 && x <= s.x1 && y >= s.y0 && y <= s.y1);
  const at = (x, y) => { const i = (y * W + x) * C; return [px[i], px[i + 1], px[i + 2]]; };
  const grayLine = ([r, g, b]) => Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r > 80 && r < 190;
  const pinkF = ([r, g, b]) => r > 235 && g > 140 && g < 215 && b > 140 && b < 215 && r - g > 45;
  const blueF = ([r, g, b]) => b > 235 && b - r > 5 && g > 170; // strong fill and its frost-blended copy
  // Anchors for the stretch that runs behind the semi-transparent legend,
  // read by eye from a magnified crop of the figure (x 1784-1966).
  const MANUAL = [[1784, 338], [1790, 362], [1796, 392], [1804, 422], [1816, 452], [1832, 482], [1854, 506], [1882, 526], [1910, 540], [1938, 550], [1950, 552], [1956, 520], [1961, 455], [1964, 395], [1966, 345]];
  const trace = [];
  let prev = null;
  for (let x = X0; x <= X1; x++) {
    const man = MANUAL.find(m => m[0] === x);
    if (man) { trace.push([x, man[1]]); prev = man[1]; continue; }
    if (x > 1784 && x < 1966) {
      const a = MANUAL.filter(m => m[0] <= x).pop();
      const b = MANUAL.find(m => m[0] >= x);
      const y = Math.round(lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])));
      trace.push([x, y]); prev = y; continue;
    }
    let line = [], pinkTop = null, blueBottom = null;
    for (let y = Y0; y <= Y1; y++) {
      const p = at(x, y);
      if (inSwatch(x, y)) continue;
      if (inLegend(x, y)) continue; // never read curve pixels through the legend
      if (Math.abs(y - ZERO) <= 8 && prev != null && Math.abs(prev - ZERO) > 12) continue; // zero-line halo
      if (grayLine(p)) line.push(y);
      else if (pinkF(p)) { if (pinkTop == null) pinkTop = y + 2; }
      else if (blueF(p)) blueBottom = y - 2;
    }
    const anchor = prev == null ? ZERO : prev;
    const opts = [...line];
    if (pinkTop != null) opts.push(pinkTop);
    if (blueBottom != null) opts.push(blueBottom);
    let y = null;
    if (opts.length) {
      const sorted = opts.sort((a, b) => Math.abs(a - anchor) - Math.abs(b - anchor));
      y = sorted[0];
      if (prev != null && Math.abs(y - prev) > 90) y = sorted.find(v => Math.abs(v - prev) <= 90) ?? y;
    }
    if (y == null) {
      // Behind the legend the curve is occluded: stop the trace there instead
      // of carrying the last y along the legend edge. The marker is hidden in
      // that stretch anyway, so ending the path early keeps it honest. Before
      // the manually read stretch the curve blends with the onset triangles
      // and the raw volume fill, so the last y is carried over the short gap.
      if (inLegendX(x) && x >= 1966) break;
      if (prev != null && trace.length && x - trace[trace.length - 1][0] <= 28) y = prev;
    }
    if (y != null) { trace.push([x, y]); prev = y; } else prev = null;
  }
  return trace.map((p, i) => {
    if (i === 0 || i === trace.length - 1) return p;
    const ys = [trace[i - 1][1], p[1], trace[i + 1][1]].sort((a, b) => a - b);
    return [p[0], ys[1]];
  });
}

// Traces the thin red arrow the figure draws from the lung to the signal chain.
// Runs longer than 10 px are lung outline, not the arrow line.
function traceRedArrow(px, W, C) {
  const pts = [];
  let prev = 345;
  for (let x = 372; x <= 866; x++) {
    const ys = [];
    for (let y = 335; y <= 860; y++) {
      const i = (y * W + x) * C;
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if (r > 150 && g < 80 && b < 80) ys.push(y);
    }
    const runs = [];
    for (const y of ys) {
      const run = runs[runs.length - 1];
      if (run && y - run[run.length - 1] <= 3) run.push(y); else runs.push([y]);
    }
    const cands = runs.filter(run => run.length <= 10).map(run => (run[0] + run[run.length - 1]) / 2);
    if (cands.length) {
      const y = cands.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev))[0];
      pts.push([x, y]); prev = y;
    }
  }
  const out = [];
  for (let i = 0; i < pts.length; i += 6) out.push([pts[i][0], Math.round(pts[i][1])]);
  if (pts.length && out[out.length - 1][0] !== pts[pts.length - 1][0]) out.push([pts[pts.length - 1][0], Math.round(pts[pts.length - 1][1])]);
  return out;
}

// Traces one drawn red cable by chaining its line pixels from a seed, so the
// comet pulses ride the drawn cable instead of an approximated curve. Cables
// run mostly vertical, so pixels are collected per row.
function traceCable(px, W, C, region, seed) {
  const pts = [];
  for (let y = region.y0; y <= region.y1; y++) {
    let run = null;
    for (let x = region.x0; x <= region.x1; x++) {
      const i = (y * W + x) * C;
      const r = px[i], g = px[i + 1], b = px[i + 2];
      if (r > 150 && g < 80 && b < 80) {
        if (!run) run = [x, x]; else run[1] = x;
      } else if (run) {
        if (run[1] - run[0] <= 70) pts.push([(run[0] + run[1]) / 2, y]);
        run = null;
      }
    }
    if (run && run[1] - run[0] <= 70) pts.push([(run[0] + run[1]) / 2, y]);
  }
  let current = seed;
  const used = new Set();
  const walk = (into) => {
    current = seed;
    for (;;) {
      let best = -1, bestD = 20;
      for (let i = 0; i < pts.length; i++) {
        if (used.has(i)) continue;
        const d = Math.hypot(pts[i][0] - current[0], pts[i][1] - current[1]);
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best < 0) break;
      used.add(best);
      current = pts[best];
      into.push([current[0], Math.round(current[1])]);
    }
  };
  const path = [];
  walk(path);
  const back = [];
  walk(back);
  path.unshift(...back.reverse());
  const out = [];
  for (let i = 0; i < path.length; i += 5) out.push(path[i]);
  if (path.length && out[out.length - 1] !== path[path.length - 1]) out.push(path[path.length - 1]);
  return out;
}

// -------------------------------------------------------- breathing lungs --
// Isolates the illustrated lung from the source image with a flood fill from a
// seed inside the lung, over lung fill, its dark outline and (for the paper
// figure) the thin red wire that the figure draws across the lung. The mask is
// feathered, so the patch can be scaled a few percent about its own centroid
// and composited back over the unchanged base without a visible seam. Non-lung
// ink that touches the lung (annotation arrow, cannula tube, coil ring) is
// kept out by per-clip exclusion rectangles and the region bound.
const LUNG_FILL = ([r, g, b]) => (r > 235 && r - g > 85 && r - b > 85) || (r >= 155 && r < 228 && g >= 55 && g < 120 && b >= 55 && b < 120);
const LUNG_OUTLINE = ([r, g, b]) => r < 135 && g < 100 && b < 100;
const LUNG_WIRE = ([r, g, b]) => r > 150 && g < 80 && b < 80 && r - g > 80;

function floodLungMask(px, W, C, spec) {
  const [x0, y0, x1, y1] = spec.rect;
  const mw = x1 - x0 + 1, mh = y1 - y0 + 1;
  const mask = new Uint8Array(mw * mh);
  const at = (x, y) => { const i = (y * W + x) * C; return [px[i], px[i + 1], px[i + 2]]; };
  const accept = p => LUNG_FILL(p) || LUNG_OUTLINE(p) || LUNG_WIRE(p);
  const excluded = (x, y) => (spec.exclude ?? []).some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);
  const stack = [[spec.seed[0], spec.seed[1]]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < x0 || x > x1 || y < y0 || y > y1 || excluded(x, y)) continue;
    const mi = (y - y0) * mw + (x - x0);
    if (mask[mi] || !accept(at(x, y))) continue;
    mask[mi] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]);
  }
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    if (!mask[y * mw + x]) continue;
    n++; sx += x; sy += y;
  }
  assert.ok(n > 2000, `Lung mask for ${spec.seed} too small (${n} px); isolation failed.`);
  return { mask, mw, mh, cx: x0 + sx / n, cy: y0 + sy / n };
}

async function buildLungPatch(data, info, spec, layout, m) {
  const { mask, mw, mh, cx, cy } = floodLungMask(data, info.width, info.channels, spec);
  const [rx0, ry0] = spec.rect;
  const rgba = Buffer.alloc(mw * mh * 4);
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    const si = ((ry0 + y) * info.width + (rx0 + x)) * info.channels;
    const di = (y * mw + x) * 4;
    rgba[di] = data[si]; rgba[di + 1] = data[si + 1]; rgba[di + 2] = data[si + 2];
    rgba[di + 3] = mask[y * mw + x] ? 255 : 0;
  }
  // Feather the mask edge so the scaled patch blends into the unchanged base.
  const soft = await sharp(rgba, { raw: { width: mw, height: mh, channels: 4 } })
    .blur(1.1).raw().toBuffer();
  const w0 = Math.round(mw * layout.scale), h0 = Math.round(mh * layout.scale);
  const patch = await sharp(soft, { raw: { width: mw, height: mh, channels: 4 } })
    .resize(w0, h0, { kernel: 'lanczos3' }).png().toBuffer();
  const [fx, fy] = m([cx, cy]);
  return { patch, w0, h0, cx: fx, cy: fy };
}

// ------------------------------------------------------------------ clips --
const CLIPS = [
  {
    id: 'thoraxmonitor',
    title: 'Thoraxmonitor',
    input: 'public/images/thoraxmonitor.webp',
    description: 'Illustrative breathing over the current Thoraxmonitor card illustration. The drawn lung is isolated as a patch and scales about five percent with each breath, so the lung itself visibly expands and contracts inside the torso. Bright bounded pulses with visible tails travel along the drawn antenna cables, and each antenna flashes once per breath. The drawing, its labels and all values stay unchanged. The motion shows no measured physiology.',
    sources: ['/images/thoraxmonitor.webp'],
    lung: {
      rect: [1470, 556, 1616, 815],   // bound around the drawn lung (source pixels)
      seed: [1542, 690],              // inside the dark red lung interior
      exclude: [[1583, 646, 1616, 690]], // the 'Lung' annotation arrowhead near the outline
      amplitude: 0.05,                // peak scale-up of the patch at full breath
    },
    check: { // frame-coordinate rectangles for the built-in assertions
      staticText: [219, 404, 250, 428],   // "35 cm" annotation glyphs (cables bend outside)
      background: [102, 153, 157, 200],   // empty panel area inside the drawing
      regions: [
        { rect: [188, 283, 324, 474], floor: 1.2 },  // antenna and cable pulses
        { rect: [695, 300, 771, 433], floor: 0.5 },  // breathing lung patch region
      ],
    },
  },
  {
    id: 'respiratory-flow-reconstruction',
    title: 'Respiratory Flow Reconstruction',
    input: 'public/images/mdpi_tm_abstract.webp',
    crop: { left: 0, top: 0, width: 2301, height: 1330 }, // top figure plus the signal chain row
    description: 'Illustrative signal flow over the top figure of the paper page, cropped for readability. The drawn lung inside the torso breathes as a gently scaling patch. A scan marker travels along the measured flow curve, fades out before the legend occludes the curve, and resumes only where the curve is visible; every moving element is clipped out of the legend rectangle. Pulses run along the arrows and wires the figure already draws. The curves, values and labels stay unchanged. The motion adds no data.',
    sources: ['/images/mdpi_tm_abstract.webp'],
    lung: {
      rect: [365, 282, 445, 436],     // bound around the lung in the paper figure
      seed: [400, 330],               // inside the lung interior
      exclude: [],
      amplitude: 0.06,
    },
    check: {
      staticText: [666, 348, 1116, 416],  // x-axis ticks and "Time [s]" label
      background: [10, 668, 103, 709],    // empty figure margin below the crop
      regions: [
        { rect: [522, 42, 1115, 337], floor: 0.1 },  // flow plot with the scan marker (point-like)
        { rect: [95, 300, 470, 640], floor: 0.4 },   // signal chain arrows region (thin comets)
        { rect: [186, 172, 232, 257], floor: 0.3 },  // breathing lung patch in the torso
      ],
    },
  },
];

// --------------------------------------------------------------- overlays --
function thoraxOverlay(t, m, cables) {
  // One 4 s loop is one breath: 0 -> peak at 2 s -> rest. The lung patch itself
  // is scaled in renderClip; this overlay adds the synced glow and the pulses.
  const breath = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
  const lungC = m([1542, 682]);
  const s = 1 + 0.05 * breath;
  const glow = (c, r, id, rgb) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${c[0]}" cy="${c[1]}" r="${r}">
      <stop offset="0" stop-color="${rgb}" stop-opacity="1"/><stop offset="1" stop-color="${rgb}" stop-opacity="0"/></radialGradient>`;
  const antennas = [[444, 666], [646, 666], [1395, 656]].map(m);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><defs>`;
  antennas.forEach((c, i) => { svg += glow(c, 34, `ga${i}`, '#d9b23a'); });
  svg += glow(lungC, 50 * s, 'gl', '#ce5a5a') + '</defs>';
  // Antenna activity, bounded to one flash per breath: a gold core that swells
  // with the breath and one ring that expands outward and fades. No strobing.
  antennas.forEach((c, i) => {
    svg += `<circle cx="${c[0]}" cy="${c[1]}" r="34" fill="url(#ga${i})" fill-opacity="${(0.16 + 0.44 * breath).toFixed(3)}"/>`;
    svg += `<circle cx="${c[0]}" cy="${c[1]}" r="5" fill="#ffe9a8" fill-opacity="${(0.3 + 0.6 * breath).toFixed(3)}"/>`;
    svg += `<circle cx="${c[0]}" cy="${c[1]}" r="${(12 + 18 * breath).toFixed(1)}" fill="none" stroke="#d9b23a" stroke-width="3" stroke-opacity="${(0.8 * (1 - breath)).toFixed(3)}"/>`;
  });
  // Soft aura over the breathing lung patch (the patch itself moves underneath).
  svg += `<circle cx="${lungC[0]}" cy="${lungC[1]}" r="${50 * s}" fill="url(#gl)" fill-opacity="${(0.14 + 0.2 * breath).toFixed(3)}"/>`;
  // Comet pulses along the drawn red cables (antenna -> board, monitor -> chest
  // antenna): a wide faint tail, a bright body and a hot leading head.
  const paths = [
    { pts: cables[0].map(p => m(p)), T: 2, phase: 0 },
    { pts: cables[1].map(p => m(p)), T: 2, phase: 0.5 },
    { pts: cables[2].map(p => m(p)), T: 4, phase: 0.25 },
  ];
  for (const p of paths) {
    const env = 0.55 + 0.45 * breath;
    for (const off of [0, 0.5]) {
      const u = ((t / p.T + p.phase + off) % 1 + 1) % 1;
      svg += comet(p.pts, u, { color: '#e02424', width: 11, opacity: 0.22 * env, dash: 110 });
      svg += comet(p.pts, u, { color: '#ff6b52', width: 6.5, opacity: 0.55 * env, dash: 40 });
      svg += comet(p.pts, u, { color: '#fff1e8', width: 3, opacity: 0.95 * env, dash: 14 });
    }
  }
  svg += pillSvg(PILL_TEXT[this.id] ?? '') + '</svg>';
  return Buffer.from(svg);
}

function respiratoryOverlay(t, m, payload) {
  const curve = payload.curve.map(p => m(p));
  const curveSrc = payload.curve;
  const plot = { x0: 1011, x1: 2159, y0: 27, y1: 598 };
  // Legend guard: the legend rectangle in frame coordinates. Every moving
  // element sits inside a group masked with a hole over this rectangle, so no
  // dot, trail, hairline or glow can ever draw over the legend.
  const [lgx0, lgy0] = m([LEGEND.x0, LEGEND.y0]);
  const [lgx1, lgy1] = m([LEGEND.x1, LEGEND.y1]);
  // Opacity ramp from the distance to the legend rectangle in source pixels:
  // the marker fades out before the legend occludes the curve and fades in
  // only after the curve is visible again above the box.
  const legendEnv = ([sx, sy]) => {
    const dx = Math.max(LEGEND.x0 - sx, sx - LEGEND.x1, 0);
    const dy = Math.max(LEGEND.y0 - sy, sy - LEGEND.y1, 0);
    return Math.min(1, Math.max(dx, dy) / 12);
  };
  // Arc-length parametrisation so the scan marker moves at constant speed.
  const acc = [0];
  for (let i = 1; i < curve.length; i++) acc.push(acc[i - 1] + Math.hypot(curve[i][0] - curve[i - 1][0], curve[i][1] - curve[i - 1][1]));
  const total = acc[acc.length - 1];
  const at = u => {
    const target = u * total;
    let i = acc.findIndex(a => a >= target);
    if (i < 1) i = 1;
    const u2 = (target - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    return [lerp(curve[i - 1][0], curve[i][0], u2), lerp(curve[i - 1][1], curve[i][1], u2), i - 1 + u2];
  };
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><defs>
    <radialGradient id="halo" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="12">
      <stop offset="0" stop-color="#d67828" stop-opacity="0.6"/><stop offset="1" stop-color="#d67828" stop-opacity="0"/></radialGradient>`;
  const breath = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
  const coil = m([272, 371]);
  svg += `<radialGradient id="coil" gradientUnits="userSpaceOnUse" cx="${coil[0]}" cy="${coil[1]}" r="30">
      <stop offset="0" stop-color="#d9b23a" stop-opacity="1"/><stop offset="1" stop-color="#d9b23a" stop-opacity="0"/></radialGradient>`;
  svg += `<mask id="lg"><rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="white"/>
    <rect x="${(lgx0 - 1).toFixed(1)}" y="${(lgy0 - 1).toFixed(1)}" width="${(lgx1 - lgx0 + 2).toFixed(1)}" height="${(lgy1 - lgy0 + 2).toFixed(1)}" fill="black"/></mask></defs>`;
  const env = Math.min(1, t / 0.05, (1 - t) / 0.05);
  const u = t;
  const [dx, dy, idx] = at(u);
  const [sx, sy] = curveSrc[Math.min(curveSrc.length - 1, Math.round(idx))];
  const top = m([plot.x0, plot.y0])[1];
  const bottom = m([plot.x1, plot.y1])[1];
  svg += `<g mask="url(#lg)">`;
  // Progress hairline across the plot at the marker position. Inside the
  // legend's x-range it stops above the legend box, and the mask clips it out
  // of the legend rectangle regardless.
  const hairBottom = sx >= LEGEND.x0 && sx <= LEGEND.x1 ? m([0, LEGEND.y0 - 3])[1] : bottom;
  svg += `<line x1="${dx}" y1="${top}" x2="${dx}" y2="${hairBottom.toFixed(1)}" stroke="${INK}" stroke-width="1" stroke-opacity="${(0.13 * env).toFixed(3)}"/>`;
  // Fading trail behind the marker; each trail dot carries the marker's legend
  // opacity, so the tail never piles up against the legend edge.
  for (let k = 9; k >= 1; k--) {
    const uk = u - k * 0.011;
    if (uk < 0) continue;
    const [tx, ty, ti] = at(uk);
    const [tsx, tsy] = curveSrc[Math.min(curveSrc.length - 1, Math.round(ti))];
    const tenv = legendEnv([tsx, tsy]);
    if (tenv <= 0) continue;
    svg += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(4.8 - k * 0.34).toFixed(2)}" fill="${INK}" fill-opacity="${(0.34 * (1 - k / 10) * env * tenv).toFixed(3)}"/>`;
  }
  // Marker: warm halo, dark ring, white core. Hidden behind the legend.
  const menv = env * legendEnv([sx, sy]);
  if (menv > 0) {
    svg += `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)})" opacity="${menv.toFixed(3)}">
      <circle r="12" fill="url(#halo)"/><circle r="5" fill="none" stroke="${INK}" stroke-width="1.8"/><circle r="2.9" fill="#ffffff"/></g>`;
  }
  // Bounded antenna flash on the figure's coil, one per breath.
  svg += `<circle cx="${coil[0]}" cy="${coil[1]}" r="30" fill="url(#coil)" fill-opacity="${(0.15 + 0.4 * breath).toFixed(3)}"/>`;
  svg += `<circle cx="${coil[0]}" cy="${coil[1]}" r="${(10 + 14 * breath).toFixed(1)}" fill="none" stroke="#d9b23a" stroke-width="2.6" stroke-opacity="${(0.75 * (1 - breath)).toFixed(3)}"/>`;
  // Comet pulses along the arrows and wires the figure already draws.
  const redArrow = payload.arrow.map(p => m(p));
  for (const off of [0, 0.5]) {
    const uu = ((t / 2 + off) % 1 + 1) % 1;
    svg += comet(redArrow, uu, { color: '#c62222', width: 10, opacity: 0.24, dash: 90 });
    svg += comet(redArrow, uu, { color: '#ff5a45', width: 7, opacity: 0.55, dash: 36 });
    svg += comet(redArrow, uu, { color: '#ffd9d2', width: 3, opacity: 0.95, dash: 15 });
  }
  const dark = [
    { pts: m.line([[0, 370], [46, 370], [46, 1064], [143, 1064]]), phase: 0 },
    { pts: m.line([[459, 1212], [459, 1305], [2034, 1305], [2034, 1106]]), phase: 0.33 },
    { pts: m.line([[2160, 356], [2228, 356], [2228, 1330]]), phase: 0.66 },
  ];
  for (const p of dark) {
    const uu = ((t / 4 + p.phase) % 1 + 1) % 1;
    svg += comet(p.pts, uu, { color: INK, width: 9, opacity: 0.24, dash: 80 });
    svg += comet(p.pts, uu, { color: '#3d554a', width: 6, opacity: 0.55, dash: 34 });
    svg += comet(p.pts, uu, { color: '#cfe0d8', width: 2.4, opacity: 0.9, dash: 13 });
  }
  svg += `</g>`;
  svg += pillSvg(PILL_TEXT['respiratory-flow-reconstruction']) + '</svg>';
  return Buffer.from(svg);
}

// ---------------------------------------------------------------- renderer --
async function renderClip(clip) {
  const src = path.join(ROOT, clip.input);
  assert.ok(fs.existsSync(src), `Missing input image for ${clip.id}: ${clip.input}`);
  assert.ok(/^portfolio-motion-breathing-v3-/.test(path.basename(TMP)), 'frames must stay in their own temp directory');
  const crop = clip.crop ?? { left: 0, top: 0, width: (await sharp(src).metadata()).width, height: (await sharp(src).metadata()).height };
  const layout = await containLayout(crop.width, crop.height);
  const m = p => [p[0] * layout.scale + layout.left, p[1] * layout.scale + layout.top];
  m.line = pts => pts.map(m);
  const fitted = await sharp(src)
    .extract(crop)
    .resize(layout.w, layout.h, { kernel: 'lanczos3' })
    .flatten({ background: BG })
    .png()
    .toBuffer();
  const base = await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: BG } })
    .composite([{ input: fitted, left: layout.left, top: layout.top }])
    .png()
    .toBuffer();
  const { data, info } = await sharp(src).extract(crop).raw().toBuffer({ resolveWithObject: true });
  let payload = null;
  if (clip.id === 'respiratory-flow-reconstruction') {
    payload = { curve: traceFlowCurve(data, info.width, info.channels), arrow: traceRedArrow(data, info.width, info.channels) };
    assert.ok(payload.curve.length > 900, `Curve trace too short (${payload.curve.length} points).`);
  } else {
    payload = [
      traceCable(data, info.width, info.channels, { x0: 395, x1: 480, y0: 500, y1: 910 }, [407, 547]),
      traceCable(data, info.width, info.channels, { x0: 600, x1: 700, y0: 500, y1: 910 }, [645, 521]),
      traceCable(data, info.width, info.channels, { x0: 1250, x1: 1410, y0: 490, y1: 895 }, [1390, 622]),
    ];
    payload.forEach((pts, i) => assert.ok(pts.length > 20, `Cable ${i} trace failed (${pts.length} points).`));
  }
  // Isolate the drawn lung so it can breathe as a real patch, not a glow.
  payload.lung = await buildLungPatch(data, info, clip.lung, layout, m);
  const dir = path.join(TMP, clip.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const overlayFor = clip.id === 'thoraxmonitor' ? thoraxOverlay : respiratoryOverlay;
  for (let i = 0; i < FRAMES; i++) {
    const t = i / FRAMES;
    const breath = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
    const s = 1 + clip.lung.amplitude * breath;
    const wOut = Math.max(1, Math.round(payload.lung.w0 * s));
    const hOut = Math.max(1, Math.round(payload.lung.h0 * s));
    const patch = await sharp(payload.lung.patch).resize(wOut, hOut, { kernel: 'lanczos3' }).png().toBuffer();
    const overlay = overlayFor.call(clip, t, m, payload);
    await sharp(base)
      .composite([
        { input: patch, left: Math.round(payload.lung.cx - wOut / 2), top: Math.round(payload.lung.cy - hOut / 2) },
        { input: overlay, left: 0, top: 0 },
      ])
      .jpeg({ quality: 90 })
      .toFile(path.join(dir, `frame_${String(i).padStart(6, '0')}.jpg`));
  }
  const checks = await assertLocalMotionOnly(dir, clip.check, base);
  const stats = await encodeFrames(dir, path.join(OUT, clip.id));
  fs.rmSync(dir, { recursive: true, force: true });
  return { stats, checks };
}

// Proves the motion is local: still text and background, moving content in
// each declared region, and no full-frame brightness pulsing anywhere in the
// loop.
async function assertLocalMotionOnly(dir, check, base) {
  const region = async (frame, [x0, y0, x1, y1]) => {
    const buf = await sharp(path.join(dir, `frame_${String(frame).padStart(6, '0')}.jpg`))
      .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).removeAlpha().raw().toBuffer();
    return buf;
  };
  const maxDiff = async (frames, rect) => {
    const base = await region(frames[0], rect);
    let max = 0, sum = 0;
    for (const f of frames.slice(1)) {
      const buf = await region(f, rect);
      for (let i = 0; i < base.length; i++) {
        const d = Math.abs(base[i] - buf[i]);
        if (d > max) max = d;
        sum += d;
      }
    }
    return { max, mean: sum / base.length / (frames.length - 1) };
  };
  const meanLuma = async frame => {
    const { data } = await sharp(path.join(dir, `frame_${String(frame).padStart(6, '0')}.jpg`))
      .grayscale().resize(64, 40).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    return data.reduce((s, v) => s + v, 0) / data.length;
  };
  const stillFrames = [0, 25, 50, 75];
  // Text and background are checked against the overlay-free base frame: the
  // overlays must never touch them. The reference is JPEG-encoded the same way
  // as the real frames, so identical pixels diff ~0 and only real overlay
  // influence shows up.
  const refJpeg = await sharp(base).jpeg({ quality: 90 }).toBuffer();
  const maxDiffFromBase = async (rect) => {
    const ref = await sharp(refJpeg).extract({ left: rect[0], top: rect[1], width: rect[2] - rect[0], height: rect[3] - rect[1] }).grayscale().raw().toBuffer();
    let max = 0;
    for (const f of stillFrames) {
      const buf = await sharp(path.join(dir, `frame_${String(f).padStart(6, '0')}.jpg`)).extract({ left: rect[0], top: rect[1], width: rect[2] - rect[0], height: rect[3] - rect[1] }).grayscale().raw().toBuffer();
      for (let i = 0; i < ref.length; i++) max = Math.max(max, Math.abs(ref[i] - buf[i]));
    }
    return { max };
  };
  const text = await maxDiffFromBase(check.staticText);
  const bg = await maxDiffFromBase(check.background);
  const regions = [];
  for (const r of check.regions) {
    const d = await maxDiff([0, 33, 66], r.rect);
    assert.ok(d.max >= 30 && d.mean >= r.floor,
      `No local motion in ${JSON.stringify(r.rect)}: max ${d.max}, mean ${d.mean.toFixed(3)} (floor ${r.floor}).`);
    regions.push(d);
  }
  const lumas = [];
  for (const f of stillFrames) lumas.push(await meanLuma(f));
  const globalSwing = Math.max(...lumas) - Math.min(...lumas);
  assert.ok(text.max <= 12, `${text.max} pixel delta in the static text region; text must not move.`);
  assert.ok(bg.max <= 12, `${bg.max} pixel delta in the background region; background must not move.`);
  assert.ok(globalSwing <= 2.0, `Full-frame brightness swings by ${globalSwing.toFixed(2)}; camera/light pulsing is not allowed.`);
  return { textMax: text.max, backgroundMax: bg.max, regionMax: regions.map(r => Math.round(r.max)), regionMean: regions.map(r => +r.mean.toFixed(2)), globalSwing };
}

function entryFor(clip) {
  return {
    id: clip.id,
    title: clip.title,
    kind: 'illustrative',
    description: clip.description,
    sources: clip.sources,
    duration: 4,
    files: { mp4: `${clip.id}.mp4`, gif: `${clip.id}.gif`, poster: `${clip.id}.jpg` },
  };
}

async function main() {
  try {
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null;
  const clips = CLIPS.filter(clip => !only || clip.id === only);
  assert.ok(clips.length > 0, `Unknown --only id: ${only}`);
  fs.mkdirSync(OUT, { recursive: true });
  const manifestPath = path.join(OUT, 'breathing-v2-manifest.json');
  const previous = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : [];
  assert.ok(Array.isArray(previous), 'breathing-v2-manifest.json must hold an array.');
  const items = [];
  for (const clip of CLIPS) {
    if (!clips.includes(clip)) {
      const prior = previous.find(entry => entry.id === clip.id);
      assert.ok(prior && fs.existsSync(path.join(OUT, `${clip.id}.mp4`)), `No rendered output for ${clip.id}; run without --only first.`);
      items.push(prior);
      continue;
    }
    if (clip.id === 'respiratory-flow-reconstruction') {
      execFileSync(process.execPath, [path.join(__dirname, 'monte-carlo.cjs')], { stdio: 'inherit' });
      const current = JSON.parse(fs.readFileSync(path.join(OUT, 'monte-carlo-manifest.json'), 'utf8'));
      items.push(current[0]);
      continue;
    }
    process.stdout.write(`render ${clip.id} ... `);
    const { stats, checks } = await renderClip(clip);
    items.push(entryFor(clip));
    console.log(`${Math.round(stats.mp4Bytes / 1024)} KB mp4, ${Math.round(stats.gifBytes / 1024)} KB gif | ` +
      `local-motion check: text Δ${checks.textMax}, background Δ${checks.backgroundMax}, ` +
      `regions max ${checks.regionMax.join('/')} mean ${checks.regionMean.join('/')}, global swing ${checks.globalSwing.toFixed(2)}`);
  }
  assert.equal(items.length, 2, 'The manifest must describe exactly the two breathing-v2 loops.');
  fs.writeFileSync(manifestPath, JSON.stringify(items, null, 2) + '\n');
  console.log(`manifest: ${manifestPath}`);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

// Exposed for preview/validation helpers; not used by the CLI flow itself.
module.exports = { CLIPS, containLayout, thoraxOverlay, respiratoryOverlay, traceFlowCurve, traceRedArrow, traceCable, LEGEND, buildLungPatch };
