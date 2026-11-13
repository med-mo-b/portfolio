#!/usr/bin/env node
// Content-motion v2: fixed-camera data-flow loops for two cards. The camera
// never moves; the motion lives inside the images as bright data packets that
// travel along the connections the diagrams already draw, plus a small glow on
// the node that is currently sending or receiving. Diagram geometry, labels,
// arrows, numbers, and text stay exactly as they are, every loop returns to its
// first frame, and each card carries an unambiguous "Illustrative data flow"
// badge. No model request, reply, measurement, or clinical result is invented.
//
// Usage: node scripts/motion/flow.cjs [--only <id>]
// Output: public/motion/<id>.mp4, <id>.gif, <id>.jpg plus flow-v2-manifest.json
// (exactly the two ids below; manifest.ts and static.cjs stay untouched).
// Frames render into a temp directory outside the repository and are deleted
// after encoding. The tedias-ahead input is the stored copy of the public
// Fraunhofer project page image (see CLIPS below); the federated-cardiac-ct
// input is the existing paper figure, cropped to its top "Federated Learning"
// schematic so the packets stay legible in a small card.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { encodeFrames, WIDTH, HEIGHT, FRAMES } = require('./encode.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'public', 'motion');
const TMP = path.join(os.tmpdir(), 'portfolio-motion-flow-v2-frames');
// #dce1d5, the project card panel colour behind the images.
const BG = { r: 220, g: 225, b: 213 };
const CYCLE = 4; // seconds; frames cover t = 0 .. (FRAMES-1)/FRAMES * CYCLE

// Packet style: warm white core with an amber glow, one spelling for both ids.
const PACKET = { core: 5.6, halo: 24, trail: 5, trailStep: 0.03, color: '#f59e0b' };

// Compact activity-glow bump: exactly zero outside c +/- w, so the loop closes.
const bump = (t, c, w) => (t <= c - w || t >= c + w ? 0 : (1 - ((t - c) / w) ** 2) ** 2);
// Packet alpha: smooth fade in and out inside its own time window.
const fade = (u) => {
  const edge = 0.14;
  const a = Math.min(1, Math.min(u, 1 - u) / edge);
  return a * a * (3 - 2 * a);
};
// Ease in-out for packet travel along a path.
const ease = (u) => u * u * (3 - 2 * u);

// A lane is one drawn connection in source-image coordinates, listed in the
// travel direction of its arrowhead. A run is one packet flight over that lane.
// A glow is a node that lights up while it sends or receives.
function laneLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return total;
}
function pointAt(points, u) {
  const target = Math.max(0, Math.min(1, u)) * laneLength(points);
  let done = 0;
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (done + seg >= target || i === points.length - 1) {
      const f = seg === 0 ? 0 : (target - done) / seg;
      return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f,
              points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f];
    }
    done += seg;
  }
  return points[points.length - 1];
}

const CLIPS = [
  {
    id: 'tedias-ahead',
    title: 'RAG-Chatbot "DARIAN" (TEDIAS)',
    // Stored copy of the public Fraunhofer project page image:
    // https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot.html
    input: 'public/motion/sources/tedias-ahead.jpg',
    description: 'Data packets move along the drawn connections of the unchanged DARIAN architecture diagram, with a small glow on the active service. The motion is illustrative only. The diagram, its labels, and its text stay unchanged.',
    sources: [
      'https://gesundheitstechnologien.ipa.fraunhofer.de/de/unsere_projekte/rag-chatbot.html',
      'public/motion/sources/tedias-ahead.jpg',
    ],
    // Stationary base: the full page contained on the card panel colour.
    async buildBase() {
      const scale = Math.min(WIDTH / 1440, HEIGHT / 759);
      const w = Math.round(1440 * scale);
      const h = Math.round(759 * scale);
      const cut = await sharp(path.join(ROOT, this.input))
        .resize(w, h, { kernel: 'lanczos3' })
        .flatten({ background: BG })
        .png().toBuffer();
      const top = Math.round((HEIGHT - h) / 2);
      const base = await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: BG } })
        .composite([{ input: cut, left: Math.round((WIDTH - w) / 2), top }])
        .png().toBuffer();
      const map = (x, y) => [Math.round(x * scale), Math.round(y * scale) + top];
      return { base, map };
    },
    // Lanes follow the dashed connectors and their arrowheads in the image.
    lanes: {
      userToApi: [[409, 262], [409, 368]],           // "Makes user query"
      apiToRag: [[502, 430], [614, 430]],            // "Forwards query"
      storeToRag: [[922, 430], [812, 430]],          // "Forwarding tool(s)"
      ragToResponse: [[712, 496], [712, 645], [512, 645]], // "Forwards final prompt"
      responseToApi: [[409, 581], [409, 494]],       // "Responses with inline citations"
      apiToEvaluator: [[318, 430], [212, 430]],      // "Forwards evaluation query"
    },
    // One packet in flight at a time: query in, context in, prompt out,
    // response back, evaluation query out. Times are seconds in the 4 s cycle.
    runs: [
      ['userToApi', 0.00, 0.55],
      ['apiToRag', 0.60, 1.15],
      ['storeToRag', 1.20, 1.75],
      ['ragToResponse', 1.80, 2.60],
      ['responseToApi', 2.65, 3.20],
      ['apiToEvaluator', 3.25, 3.80],
    ],
    glows: {
      // Every bump must start and end inside the cycle, so frame 0 stays empty.
      user: [[0.24, 0.15, 0.9]],
      api: [[0.58, 0.22, 1], [3.23, 0.22, 1]],
      rag: [[1.18, 0.22, 0.9], [1.78, 0.22, 1]],
      store: [[1.23, 0.22, 0.8]],
      response: [[2.63, 0.22, 1]],
      evaluator: [[3.80, 0.15, 0.9]],
    },
    glowShapes: {
      user: [409, 190, 95], api: [409, 430, 108], rag: [711, 429, 108],
      store: [1015, 427, 100], response: [409, 642, 108], evaluator: [115, 430, 100],
    },
  },
  {
    id: 'federated-cardiac-ct',
    title: 'Federated Learning Cardiac CT',
    input: 'public/images/federated_paper.webp',
    description: 'Model-update packets move between the four hospitals and the central server along the drawn arrows of the unchanged Federated Learning schematic. The motion is illustrative only. The figure, its labels, and its text stay unchanged.',
    sources: ['/images/federated_paper.webp'],
    // Stationary base: the paper's top schematic (panel a), contained on the
    // card panel colour. Crop sits inside the panel's printed border.
    async buildBase() {
      const crop = { left: 7, top: 7, width: 707, height: 586 };
      const scale = Math.min(WIDTH / crop.width, HEIGHT / crop.height);
      const w = Math.round(crop.width * scale);
      const h = Math.round(crop.height * scale);
      const cut = await sharp(path.join(ROOT, this.input))
        .extract(crop)
        .resize(w, h, { kernel: 'lanczos3' })
        .flatten({ background: BG })
        .png().toBuffer();
      const base = await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: BG } })
        .composite([{ input: cut, left: Math.round((WIDTH - w) / 2), top: Math.round((HEIGHT - h) / 2) }])
        .png().toBuffer();
      const left = Math.round((WIDTH - w) / 2);
      const map = (x, y) => [Math.round((x - crop.left) * scale) + left, Math.round((y - crop.top) * scale)];
      return { base, map };
    },
    // The four drawn arrow pairs around the server. Blue arrows point from a
    // hospital into the server (local updates), black arrows point from the
    // server back to a hospital (aggregated model). Measured on the figure.
    lanes: {
      aToServer: [[233, 231], [270, 259]],
      bToServer: [[471, 231], [434, 260]],
      dToServer: [[231, 365], [269, 339]],
      cToServer: [[475, 365], [438, 340]],
      serverToA: [[270, 273], [235, 248]],
      serverToB: [[436, 273], [469, 247]],
      serverToD: [[267, 355], [236, 377]],
      serverToC: [[434, 351], [470, 377]],
    },
    // Phase 1: each hospital sends its update, slightly staggered.
    // Phase 2: the server sends the updated model back to each hospital.
    runs: [
      ['aToServer', 0.00, 0.75],
      ['bToServer', 0.22, 0.97],
      ['dToServer', 0.44, 1.19],
      ['cToServer', 0.66, 1.41],
      ['serverToA', 2.00, 2.75],
      ['serverToB', 2.22, 2.97],
      ['serverToD', 2.44, 3.19],
      ['serverToC', 2.66, 3.41],
    ],
    glows: {
      // Every bump must start and end inside the cycle, so frame 0 stays empty.
      hospitalA: [[0.26, 0.16, 0.75], [2.75, 0.24, 1]],
      hospitalB: [[0.27, 0.24, 0.75], [2.97, 0.24, 1]],
      hospitalD: [[0.49, 0.24, 0.75], [3.19, 0.24, 1]],
      hospitalC: [[0.71, 0.24, 0.75], [3.41, 0.24, 1]],
      server: [[0.75, 0.22, 0.85], [0.97, 0.22, 0.85], [1.19, 0.22, 0.85], [1.41, 0.22, 0.85],
               [2.00, 0.22, 0.85], [2.22, 0.22, 0.85], [2.44, 0.22, 0.85], [2.66, 0.22, 0.85]],
    },
    glowShapes: {
      hospitalA: [197, 142, 115], hospitalB: [503, 142, 115],
      hospitalD: [197, 475, 115], hospitalC: [503, 475, 115],
      server: [356, 328, 88],
    },
  },
];

// Unambiguous badge, drawn once into the stationary base of every frame.
const BADGE = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <rect x="968" y="698" width="204" height="30" rx="15" fill="#1d2f28" fill-opacity="0.78"/>
    <text x="1070" y="718" text-anchor="middle" font-family="Menlo, Monaco, monospace" font-size="13" letter-spacing="0.4" fill="#f2f4ee">Illustrative data flow</text>
  </svg>`
);

function overlaySvg(clip, map, t) {
  const parts = [];
  const defs = [];
  // Node activity glows.
  for (const [name, bumps] of Object.entries(clip.glows)) {
    const [cx, cy, r] = clip.glowShapes[name];
    const [sx, sy] = map(cx, cy);
    let alpha = 0;
    for (const [c, w, s] of bumps) alpha += bump(t, c, w) * s;
    alpha = Math.min(1, alpha) * 0.3;
    if (alpha > 0.004) {
      defs.push(`<radialGradient id="g${name}" gradientUnits="userSpaceOnUse" cx="${sx}" cy="${sy}" r="${Math.round(r * (WIDTH / 1440))}">
        <stop offset="0" stop-color="${PACKET.color}" stop-opacity="${alpha.toFixed(3)}"/>
        <stop offset="0.6" stop-color="${PACKET.color}" stop-opacity="${(alpha * 0.5).toFixed(3)}"/>
        <stop offset="1" stop-color="${PACKET.color}" stop-opacity="0"/>
      </radialGradient>`);
      parts.push(`<circle cx="${sx}" cy="${sy}" r="${Math.round(r * (WIDTH / 1440))}" fill="url(#g${name})"/>`);
    }
  }
  // Data packets with a short fading trail, riding the drawn connections.
  for (const [lane, t0, t1] of clip.runs) {
    if (t < t0 || t > t1) continue;
    const points = clip.lanes[lane].map(([x, y]) => map(x, y));
    const u = (t - t0) / (t1 - t0);
    const alpha = fade(u);
    if (alpha <= 0.004) continue;
    for (let k = PACKET.trail; k >= 1; k--) {
      const uk = ease(Math.max(0, u - k * PACKET.trailStep));
      const [tx, ty] = pointAt(points, uk);
      const tr = PACKET.core * (1 - k * 0.16);
      parts.push(`<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${tr.toFixed(2)}" fill="${PACKET.color}" fill-opacity="${(alpha * 0.4 * (1 - k / (PACKET.trail + 1))).toFixed(3)}"/>`);
    }
    const [hx, hy] = pointAt(points, ease(u));
    defs.push(`<radialGradient id="halo${lane}" gradientUnits="userSpaceOnUse" cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${PACKET.halo}">
      <stop offset="0" stop-color="#fff7e6" stop-opacity="${(alpha * 0.95).toFixed(3)}"/>
      <stop offset="0.35" stop-color="${PACKET.color}" stop-opacity="${(alpha * 0.75).toFixed(3)}"/>
      <stop offset="1" stop-color="${PACKET.color}" stop-opacity="0"/>
    </radialGradient>`);
    parts.push(`<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${PACKET.halo}" fill="url(#halo${lane})"/>`);
    parts.push(`<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${PACKET.core}" fill="#fffdf6" stroke="${PACKET.color}" stroke-width="1.6" stroke-opacity="${alpha.toFixed(3)}"/>`);
  }
  if (parts.length === 0) return null;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><defs>${defs.join('')}</defs>${parts.join('')}</svg>`);
}

async function renderClip(clip) {
  const { base: rawBase, map } = await clip.buildBase();
  const base = await sharp(rawBase).composite([{ input: BADGE, top: 0, left: 0 }]).png().toBuffer();
  const dir = path.join(TMP, clip.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  try {
    for (let i = 0; i < FRAMES; i++) {
      const t = (i / FRAMES) * CYCLE;
      const overlay = overlaySvg(clip, map, t);
      const frame = overlay
        ? await sharp(base).composite([{ input: overlay, top: 0, left: 0 }]).jpeg({ quality: 90 }).toBuffer()
        : await sharp(base).jpeg({ quality: 90 }).toBuffer();
      fs.writeFileSync(path.join(dir, `frame_${String(i).padStart(6, '0')}.jpg`), frame);
    }
    return await encodeFrames(dir, path.join(OUT, clip.id));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
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
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null;
  const clips = CLIPS.filter(clip => !only || clip.id === only);
  assert.ok(clips.length > 0, `Unknown --only id: ${only}`);
  fs.mkdirSync(OUT, { recursive: true });
  for (const clip of clips) {
    process.stdout.write(`render ${clip.id} ... `);
    const stats = await renderClip(clip);
    console.log(`${Math.round(stats.mp4Bytes / 1024)} KB mp4, ${Math.round(stats.gifBytes / 1024)} KB gif`);
  }
  // The v2 manifest lists exactly the two flow ids; every listed file must exist.
  for (const clip of CLIPS) {
    for (const file of Object.values(entryFor(clip).files)) {
      assert.ok(fs.existsSync(path.join(OUT, file)), `Missing output for manifest: ${file}`);
    }
  }
  const manifestPath = path.join(OUT, 'flow-v2-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(CLIPS.map(entryFor), null, 2) + '\n');
  console.log(`manifest: ${manifestPath} (${CLIPS.length} entries)`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
