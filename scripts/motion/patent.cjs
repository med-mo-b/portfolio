#!/usr/bin/env node
// Renders the v2 patent card loop: one fixed-camera illustrative logo animation.
// The European Patent Office image from src/data/projects.ts stays in place on
// the #dce1d5 card colour. A narrow light pulse travels around the red mark
// left of the wordmark; a radius phase offset makes it cross the arc bands one
// after another, then the mark settles back to its initial state.
// Only existing red mark pixels change (alpha plus redness mask, left of the
// detected mark/wordmark gap). The wordmark, the logo geometry and the framing
// stay exactly as they are. This is not an official logo animation and not a
// depiction of the patented method; the on-frame label and the manifest say so.
//
// Usage: node scripts/motion/patent.cjs
// Output: public/motion/patent-measuring-process.{mp4,gif,jpg} and
//         public/motion/patent-v2-manifest.json (one-entry array).
// Frames render into a temp directory outside the repository and are deleted
// after encoding.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { encodeFrames, WIDTH, HEIGHT, FRAMES } = require('./encode.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'motion');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-motion-patent-frames-v2-'));
const BG = { r: 220, g: 225, b: 213 }; // #dce1d5, the project card panel colour

// Motion tuning: one full angular sweep per loop; the angular highlight lags
// by PHASE across the radius range, so the pulse crosses the arc bands in
// sequence. The envelope is zero at both loop ends, so the wrap is seamless.
const SWEEP = 2 * Math.PI;
const PHASE = 1.5 * Math.PI;
const KERNEL = 0.4; // half-width of the angular glint in radians
const PEAK = 0.78; // strongest blend toward the highlight colour
const HL = { r: 255, g: 240, b: 238 };

// Constant pill label drawn identically on every frame.
const LABEL = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <rect x="922" y="698" width="250" height="30" rx="15" fill="#1d2f28" fill-opacity="0.78"/>
    <text x="1047" y="718" text-anchor="middle" font-family="Menlo, Monaco, monospace" font-size="13" letter-spacing="0.4" fill="#f2f4ee">Illustrative logo animation</text>
  </svg>`
);

// The site card uses this exact image (src/data/projects.ts, id patent-measuring-process).
const projectsSrc = fs.readFileSync(path.join(ROOT, 'src', 'data', 'projects.ts'), 'utf8');
const entry = projectsSrc.match(/id: 'patent-measuring-process'[\s\S]*?image: '([^']+)'/);
assert.ok(entry, 'patent-measuring-process entry with image not found in src/data/projects.ts');
const IMAGE = entry[1]; // site-root-relative path, kept as the source reference
const IMAGE_FILE = path.join(ROOT, 'public', IMAGE.replace(/^\//, ''));
const TITLE = (projectsSrc.match(/id: 'patent-measuring-process'[\s\S]*?title: '([^']+)'/) || [])[1] || 'Patent: Process Measurement in Objects';

async function main() {
  assert.ok(fs.existsSync(IMAGE_FILE), `Missing input image: ${IMAGE}`);

  // Frame-geometry RGBA: letterbox is the card colour with alpha 0, so the
  // alpha channel marks exactly the logo pixels at video resolution.
  const rgba = await sharp(IMAGE_FILE)
    .resize(WIDTH, HEIGHT, { fit: 'contain', background: { ...BG, alpha: 0 }, kernel: 'lanczos3' })
    .raw().toBuffer();
  const base = await sharp(rgba, { raw: { width: WIDTH, height: HEIGHT, channels: 4 } })
    .flatten({ background: BG })
    .raw().toBuffer();

  // Red-logo columns: EPO red has a large red-minus-green distance; the card
  // colour and the letterbox do not. Left/right split comes from the widest
  // empty column run between the first and last red column.
  const colRed = new Uint8Array(WIDTH);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 4;
      if (rgba[i + 3] > 128 && rgba[i] > rgba[i + 1] + 40 && rgba[i] > rgba[i + 2] + 40) colRed[x] = 1;
    }
  }
  let first = -1, last = -1;
  for (let x = 0; x < WIDTH; x++) if (colRed[x]) { if (first < 0) first = x; last = x; }
  assert.ok(first >= 0, 'No red logo pixels found.');
  let bestLen = 0, bestStart = -1, runStart = -1;
  for (let x = first; x <= last; x++) {
    if (!colRed[x]) { if (runStart < 0) runStart = x; continue; }
    if (runStart >= 0) { const len = x - runStart; if (len > bestLen) { bestLen = len; bestStart = runStart; } runStart = -1; }
  }
  assert.ok(bestLen >= 30, `No clear gap between mark and wordmark (widest empty run ${bestLen}px).`);
  const boundary = bestStart; // the red mark lives strictly left of this column

  // Masked pixels and their sweep phase. Centre = centroid of the innermost
  // mark pixels (the tilted disc), which the concentric arcs enclose.
  const xs = [], ys = [];
  let countAll = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 4;
      const red = rgba[i + 3] > 128 && rgba[i] > rgba[i + 1] + 40 && rgba[i] > rgba[i + 2] + 40;
      if (red) countAll++;
      if (red && x < boundary) { xs.push(x); ys.push(y); }
    }
  }
  assert.ok(countAll > 2000, `Only ${countAll} red pixels found.`);
  const n = xs.length;
  let sumAllX = 0, sumAllY = 0;
  for (let k = 0; k < n; k++) { sumAllX += xs[k]; sumAllY += ys[k]; }
  const cx0 = sumAllX / n, cy0 = sumAllY / n;
  let rAllMax = 0;
  for (let k = 0; k < n; k++) rAllMax = Math.max(rAllMax, Math.hypot(xs[k] - cx0, ys[k] - cy0));
  let sumX = 0, sumY = 0, count = 0;
  for (let k = 0; k < n; k++) {
    if (Math.hypot(xs[k] - cx0, ys[k] - cy0) < 0.35 * rAllMax) { sumX += xs[k]; sumY += ys[k]; count++; }
  }
  assert.ok(count > 500, `Inner-disc estimate failed (${count} pixels).`);
  const cx = sumX / count, cy = sumY / count;
  let rmax = 0;
  const ph = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const dx = xs[k] - cx, dy = ys[k] - cy;
    rmax = Math.max(rmax, Math.hypot(dx, dy));
    ph[k] = Math.atan2(dy, dx);
  }
  for (let k = 0; k < n; k++) ph[k] += PHASE * (Math.hypot(xs[k] - cx, ys[k] - cy) / rmax);
  assert.ok(n / countAll > 0.1 && n / countAll < 0.5, `Unexpected mark/wordmark split: mark ${n}, total red ${countAll}.`);
  console.log(`image ${IMAGE}; mark/wordmark gap ${bestLen}px at x=${boundary}; mark pixels ${n} (${Math.round(100 * n / countAll)}% of red), centre (${cx.toFixed(0)}, ${cy.toFixed(0)}), rmax ${rmax.toFixed(0)}`);

  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  try {
    for (let i = 0; i < FRAMES; i++) {
      const t = i / FRAMES;
      const env = Math.sin(Math.PI * t) ** 2;
      const A = -Math.PI + SWEEP * t;
      const frame = Buffer.from(base);
      for (let k = 0; k < n; k++) {
        let d = ph[k] - A;
        d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        const ad = Math.abs(d);
        if (ad >= KERNEL) continue;
        const w = 1 - ad / KERNEL;
        const intensity = env * w * w;
        if (intensity < 0.02) continue;
        const o = (ys[k] * WIDTH + xs[k]) * 3;
        frame[o] = base[o] + (HL.r - base[o]) * intensity;
        frame[o + 1] = base[o + 1] + (HL.g - base[o + 1]) * intensity;
        frame[o + 2] = base[o + 2] + (HL.b - base[o + 2]) * intensity;
      }
      await sharp(frame, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
        .composite([{ input: LABEL, top: 0, left: 0 }])
        .jpeg({ quality: 92 })
        .toFile(path.join(TMP, `frame_${String(i).padStart(6, '0')}.jpg`));
    }
    const stats = await encodeFrames(TMP, path.join(OUT, 'patent-measuring-process'));
    assert.equal(fs.readFileSync(path.join(OUT, 'patent-measuring-process.mp4')).subarray(4, 8).toString(), 'ftyp');
    console.log(`mp4 ${Math.round(stats.mp4Bytes / 1024)} KB, gif ${Math.round(stats.gifBytes / 1024)} KB`);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }

  const manifest = [{
    id: 'patent-measuring-process',
    title: TITLE,
    kind: 'illustrative',
    description: 'Fixed-camera illustrative logo animation of the current European Patent Office card image. A narrow light pulse travels around the red mark and crosses the arc bands one after another, then the mark settles back. The wordmark and the logo geometry stay unchanged. It is not an official logo animation. It does not depict the patented method.',
    sources: [IMAGE],
    duration: 4,
    files: { mp4: 'patent-measuring-process.mp4', gif: 'patent-measuring-process.gif', poster: 'patent-measuring-process.jpg' },
  }];
  fs.writeFileSync(path.join(OUT, 'patent-v2-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`manifest: ${path.join(OUT, 'patent-v2-manifest.json')} (1 entry)`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
