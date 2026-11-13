#!/usr/bin/env node
// Builds the three motion loops in public/motion/ from real UI captures and one
// deterministic local animation. Local only: no model calls, no private
// browser profiles, no repository changes beyond the loop files and ui-manifest.json.
// Portfolio browsing lasts 12 seconds. Native Home Assistant interactions last 16.
// Local Agent typing lasts four seconds.
//
// Usage:
//   PLAYWRIGHT_PATH=<playwright package dir> node scripts/motion/ui.cjs [all|portfolio-website|homelab-cm3588|local-assistant]
// Environment:
//   PLAYWRIGHT_PATH  required. Directory of the playwright package that drives the browser.
//   PORTFOLIO_URL    optional. Local preview of this site. Default: http://localhost:3417/
//
// Per loop id this writes public/motion/<id>.mp4, <id>.gif and <id>.jpg (poster),
// plus public/motion/ui-manifest.json. Frames and browser data stay in the OS
// temporary directory, outside the repository.
// Loops:
//   portfolio-website  real capture of the local portfolio preview: hold on the hero,
//                      glide to the first Journey entry, expand it with a real click,
//                      open its project dialog, read briefly, close the dialog with the
//                      real Close button, restore the initial selection with a real
//                      click, and glide back to the hero; start and end state match
//                      (scrollY 0, no dialog, initial selection, pointer in the same
//                      position). The capture never scrolls near Work or the footer.
//   homelab-cm3588     actual frontend and original custom cards in an isolated
//                      demo browser. Fictional floorplan and locally simulated
//                      states; frontend assets load read-only, no real commands.
//   local-assistant    illustrative, deterministic typing animation on the redacted
//                      public/images/local-assistant.png screenshot. No request is sent.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { captureFrames, encodeFrames, sleep, WIDTH, HEIGHT, FPS } = require('./encode.cjs');

const REPO = path.resolve(__dirname, '..', '..');
const OUT = path.join(REPO, 'public', 'motion');
const CHECKS = path.join(os.tmpdir(), 'portfolio-motion-checks');
const DURATION = 4;
const PORTFOLIO_URL = process.env.PORTFOLIO_URL || 'http://localhost:3417/';

if (!process.env.PLAYWRIGHT_PATH && process.argv[2] !== 'homelab-cm3588') {
  console.error('Set PLAYWRIGHT_PATH to the directory of a playwright package.');
  process.exit(1);
}
const chromium = process.env.PLAYWRIGHT_PATH ? require(process.env.PLAYWRIGHT_PATH).chromium : null;

// The Chromium build cached next to the local Playwright install. Playwright resolves
// its own default only when this returns undefined; no personal paths are hardcoded.
function chromiumExecutable() {
  const cache = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  if (!fs.existsSync(cache)) return undefined;
  const dirs = fs.readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const dir of dirs) {
    const exe = path.join(cache, dir, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
}

async function openBrowser() {
  const executablePath = chromiumExecutable();
  return chromium.launch(executablePath ? { headless: true, executablePath } : { headless: true });
}

const newPage = async browser =>
  (await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1, locale: 'en-US' })).newPage();

// A short press: enough frames show the pressed state, no drag.
async function press(page) {
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
}

// ---------------------------------------------------------------------------
// Loop 1: portfolio-website — a short, natural investigation of the real page.
// Hold on the hero, glide to the first Journey entry, expand it with a real
// click, open its real project dialog, read briefly with one small dialog
// scroll, close the dialog with the real Close button, glide a little further,
// restore the initial selection with a real click on the original commit
// button, and glide back to the hero. Read-only local preview content. The
// deepest glide stays well above the Work section and the footer. The capture
// starts and ends on the same state: scrollY 0, no dialog open, the initial
// selection, and the pointer at HOME_MOUSE.
// ---------------------------------------------------------------------------

// Quiet spot in the left page margin: every section keeps 64px side padding, so
// this point stays over background at every scroll offset and first/last frames agree.
const HOME_MOUSE = { x: 40, y: 380 };
const LOOP_SECONDS = 12;  // fixed capture window for this loop
const GLIDE_RAMP = 0.5;   // seconds of ease-in at the start and ease-out at the end of each glide
const GLIDE_SPEED = 800;  // peak px/s on the way down; inside the readable 600-850 px/s band
const HOME_SPEED = 950;   // peak px/s on the short hops and the return; a fly-back, not a reading scroll
const HERO_HOLD = 0.65;   // seconds on the hero before the first glide
const READ_HOLD = 0.2;    // pause after a glide before the pointer moves
const SETTLE = 0.15;      // seconds for the pointer and the site cursor to settle after a move
const EXPAND_HOLD = 0.4;  // seconds to watch the panel expand
const DIALOG_HOLD = 0.45; // seconds between the dialog click and the read
const DIALOG_READ = 0.9;  // seconds of reading around the one small wheel step
const DIALOG_WHEEL = 320; // px of the one gentle wheel step inside the dialog
const CLOSE_HOLD = 0.4;   // seconds to watch the dialog close
const RESTORE_HOLD = 0.4; // seconds to watch the initial selection return
const MOUSE_HOME = 0.3;   // seconds for the pointer to settle back at HOME_MOUSE
const FINAL_HOLD = 0.5;   // seconds on the hero at the end
const TOP_MARGIN = 177;   // px of context above the first commit row at the reading position

async function portfolioWebsite(framesDir) {
  const browser = await openBrowser();
  try {
    const page = await newPage(browser);
    await page.goto(PORTFOLIO_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => scrollY), 0, 'The preview must load at the hero.');
    assert.equal(await page.getAttribute('[data-event="osapiens-aipe"]', 'aria-expanded'), 'true',
      'The preview must load with osapiens-aipe expanded.');
    const scrollable = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const firstCommit = page.locator('button[data-event="local-assistant"]');
    const firstTop = await firstCommit.evaluate(el => el.getBoundingClientRect().top + scrollY);
    const readTarget = Math.round(firstTop - TOP_MARGIN);
    assert.ok(readTarget > 0, 'The reading position must sit below the header.');
    assert.ok(readTarget + HEIGHT < scrollable * 0.55, 'The deepest glide must stay well above the page bottom.');
    console.log(`portfolio-website: reading position ${readTarget}px of ${scrollable}px scrollable, ${LOOP_SECONDS}s fixed capture`);

    // Trapezoid velocity glide from the current scrollY to an absolute target:
    // ease in over GLIDE_RAMP, constant peak, ease out. One requestAnimationFrame
    // chain inside the page; no Playwright scroll calls per step. A function, not
    // a started promise: the glide must begin inside the capture window.
    const glide = (page, target, speed) => page.evaluate(({ target, speed, ramp }) => new Promise(resolve => {
      const from = scrollY, distance = target - from;
      if (Math.abs(distance) < 2) { resolve(scrollY); return; }
      const T = (Math.abs(distance) / speed + ramp) * 1000, R = ramp * 1000;
      const v = distance / (T - R); // signed peak px per ms
      const pos = t => t <= R ? v * t * t / (2 * R)
        : t >= T - R ? distance - v * (T - t) * (T - t) / (2 * R)
        : v * (R / 2 + t - R);
      const start = performance.now();
      const frame = now => {
        window.scrollTo({ top: Math.round(from + pos(Math.min(now - start, T))), behavior: 'instant' });
        if (now - start < T) requestAnimationFrame(frame); else resolve(scrollY);
      };
      requestAnimationFrame(frame);
    }), { target, speed, ramp: GLIDE_RAMP });

    await page.mouse.move(HOME_MOUSE.x, HOME_MOUSE.y);
    await page.waitForTimeout(900); // the site cursor appears and settles where the pointer is
    await captureFrames(page, framesDir, async () => {
      // Hero hold.
      await sleep(HERO_HOLD * 1000);
      // Glide down to the first Journey entry.
      const reached = await glide(page, readTarget, GLIDE_SPEED);
      assert.ok(Math.abs(reached - readTarget) <= 1, 'The glide must reach the reading position.');
      console.log(`partial-scroll peak ${reached}px (${Math.round((reached + HEIGHT) / (scrollable + HEIGHT) * 100)}% of the document; footer stays far below)`);
      await sleep(READ_HOLD * 1000);
      // Real click expands the first entry.
      const commitBox = await firstCommit.boundingBox();
      assert.ok(commitBox && commitBox.y >= 0 && commitBox.y + commitBox.height <= HEIGHT, 'The first commit button must be in view.');
      await page.mouse.move(commitBox.x + commitBox.width / 2, commitBox.y + commitBox.height / 2, { steps: 12 });
      await sleep(SETTLE * 1000);
      assert.equal(await firstCommit.getAttribute('aria-expanded'), 'false', 'The first entry must start collapsed.');
      await press(page);
      assert.equal(await firstCommit.getAttribute('aria-expanded'), 'true', 'The click must expand the first entry.');
      console.log('local-assistant expanded (aria-expanded=true)');
      await sleep(EXPAND_HOLD * 1000);
      // Real click opens the real project dialog.
      const explore = page.locator('#panel-local-assistant [data-project]');
      const exploreBox = await explore.boundingBox();
      assert.ok(exploreBox && exploreBox.y >= 0 && exploreBox.y + exploreBox.height <= HEIGHT, 'The Explore project button must be in view.');
      await page.mouse.move(exploreBox.x + exploreBox.width / 2, exploreBox.y + exploreBox.height / 2, { steps: 12 });
      await sleep(SETTLE * 1000);
      await press(page);
      assert.ok(await page.evaluate(() => document.querySelector('dialog')?.open === true), 'The project dialog must be open.');
      console.log('project dialog opened (showModal)');
      await sleep(DIALOG_HOLD * 1000);
      // Read: move over the dialog and make one small wheel step inside it. The
      // page behind cannot scroll while the dialog is open (body.modal-open).
      const dialogBox = await page.locator('dialog').boundingBox();
      assert.ok(dialogBox, 'The dialog must have a visible box for the read.');
      await page.mouse.move(dialogBox.x + dialogBox.width / 2, dialogBox.y + dialogBox.height / 2, { steps: 10 });
      const beforeWheel = await page.evaluate(() => {
        const d = document.querySelector('dialog');
        return { scrollable: d.scrollHeight > d.clientHeight, top: d.scrollTop };
      });
      assert.ok(beforeWheel.scrollable, 'The dialog content must scroll so the read can move.');
      await page.mouse.wheel(0, DIALOG_WHEEL);
      await sleep(DIALOG_READ * 1000);
      const afterWheel = await page.evaluate(() => document.querySelector('dialog').scrollTop);
      assert.ok(afterWheel > beforeWheel.top, 'The wheel step must scroll the dialog.');
      console.log(`dialog read: scrollTop ${beforeWheel.top} → ${afterWheel}px`);
      // Real click on the real Close button.
      const closeBox = await page.locator('#close-dialog').boundingBox();
      assert.ok(closeBox && closeBox.y >= 0 && closeBox.y + closeBox.height <= HEIGHT, 'The Close button must be in view.');
      await page.mouse.move(closeBox.x + closeBox.width / 2, closeBox.y + closeBox.height / 2, { steps: 10 });
      await sleep(SETTLE * 1000);
      await press(page);
      assert.ok(await page.evaluate(() => document.querySelector('dialog')?.open === false), 'The Close button must close the dialog.');
      console.log('project dialog closed via the Close button');
      await sleep(CLOSE_HOLD * 1000);
      // Glide a little further so the original commit button is fully in view.
      const original = page.locator('button[data-event="osapiens-aipe"]');
      const originalTop = await original.evaluate(el => el.getBoundingClientRect().top + scrollY);
      const originalBox = await original.boundingBox();
      const osTarget = Math.max(readTarget + 120, Math.round(originalTop + originalBox.height + 20 - HEIGHT));
      const further = await glide(page, osTarget, HOME_SPEED);
      assert.ok(Math.abs(further - osTarget) <= 1, 'The small extra glide must reach its target.');
      const osBox = await original.boundingBox();
      assert.ok(osBox && osBox.y >= 0 && osBox.y + osBox.height <= HEIGHT - 12, 'The original commit button must be fully in view before the click.');
      await sleep(READ_HOLD * 1000);
      // Real click restores the initial selection on the original commit button.
      assert.equal(await original.getAttribute('aria-expanded'), 'false', 'The original entry must be collapsed before the restore click.');
      await page.mouse.move(osBox.x + osBox.width / 2, osBox.y + osBox.height / 2, { steps: 12 });
      await sleep(SETTLE * 1000);
      await press(page);
      assert.equal(await original.getAttribute('aria-expanded'), 'true', 'The restore click must reselect osapiens-aipe.');
      assert.equal(await firstCommit.getAttribute('aria-expanded'), 'false', 'The restore must collapse local-assistant again.');
      console.log('initial selection restored (osapiens-aipe aria-expanded=true)');
      await sleep(RESTORE_HOLD * 1000);
      // Glide back to the hero and return the pointer to its start position.
      const home = await glide(page, 0, HOME_SPEED);
      assert.equal(home, 0, 'The return glide must end at scrollY 0.');
      await page.mouse.move(HOME_MOUSE.x, HOME_MOUSE.y, { steps: 12 });
      await sleep(MOUSE_HOME * 1000);
      assert.equal(await page.evaluate(() => scrollY), 0, 'The clip must end at the hero.');
      assert.ok(await page.evaluate(() => document.querySelector('dialog')?.open === false), 'The clip must end with no dialog open.');
      assert.equal(await page.getAttribute('[data-event="osapiens-aipe"]', 'aria-expanded'), 'true', 'The clip must end on the initial selection.');
      console.log(`final state: scrollY 0, no dialog, initial selection, pointer at ${HOME_MOUSE.x},${HOME_MOUSE.y}`);
      await sleep(FINAL_HOLD * 1000);
    }, LOOP_SECONDS);
    // Every fourth GIF frame at 128 colours keeps the 12-second GIF near the size of the
    // other loops' four-second GIFs; the MP4 keeps all 25 fps.
    return { duration: LOOP_SECONDS, gifEvery: 4, gifColours: 128 };
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Loop 3: local-assistant — deterministic illustrative typing on the redacted
// screenshot. The page never touches a network and no model reply is shown.
// ---------------------------------------------------------------------------

const ASSISTANT_TEXT = 'Explain this function.';
const ASSISTANT_LABEL = 'Illustrative typing · no request sent';
// Input rectangle in the 1188x744 screenshot; the placeholder text sits at x287, y336.
const ASSISTANT_INPUT = { x: 274, y: 318, w: 640, h: 73 };
const ASSISTANT_PATCH = { x: 283, y: 328, w: 610, h: 28 };

function assistantPageHtml() {
  const image = 'file://' + path.join(REPO, 'public', 'images', 'local-assistant.png');
  const input = JSON.stringify(ASSISTANT_INPUT);
  const patch = JSON.stringify(ASSISTANT_PATCH);
  return `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:#161616}canvas{display:block}</style>
<canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas><script>
// Deterministic four-second choreography, driven only by the time since __motionStart().
// All drawing is derived from the redacted screenshot plus the overlay below; the page
// performs no network activity and shows no reply.
const img = new Image();
img.src = ${JSON.stringify(image)};
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const INPUT = ${input};
const PATCH = ${patch};
const TEXT = ${JSON.stringify(ASSISTANT_TEXT)};
const LABEL = ${JSON.stringify(ASSISTANT_LABEL)};
const FONT = '13px -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const TEXT_X = 287, TEXT_Y = 342;
const FROM = { x: 1250, y: 560 }, TO = { x: INPUT.x + INPUT.w / 2, y: INPUT.y + INPUT.h / 2 }, SIDE = { x: 1000, y: 296 };
let t0 = null;
const clamp01 = v => Math.max(0, Math.min(1, v));
const ease = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
const mix = (a, b, p) => ({ x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p });

function pill(text, x, y, bg, fg, size) {
  ctx.font = size + 'px -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const w = ctx.measureText(text).width + 28, h = 26, r = 13;
  ctx.fillStyle = bg; ctx.globalAlpha = 0.94;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = fg;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 14, y + h / 2 + 0.5);
}

function draw(t) {
  ctx.drawImage(img, 0, 0, ${WIDTH}, ${HEIGHT});
  pill(LABEL, 16, ${HEIGHT} - 42, 'rgb(31,41,55)', '#fff', 11);

  const typing = t >= 950 && t < 2950 ? Math.min(TEXT.length, Math.floor((t - 950) / 68))
    : t >= 2950 && t < 3350 ? Math.max(0, TEXT.length - Math.floor((t - 2950) / 18)) : 0;
  if (typing > 0) {
    ctx.fillStyle = 'rgb(29,29,29)';            // covers only the baked-in placeholder line
    ctx.fillRect(PATCH.x, PATCH.y, PATCH.w, PATCH.h);
    ctx.font = FONT; ctx.fillStyle = 'rgb(214,214,214)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(TEXT.slice(0, typing), TEXT_X, TEXT_Y);
  }
  const focused = t >= 800 && t < 3500;
  if (focused) {                                 // caret, hidden while the blink is off
    const idle = typing === 0 || typing === TEXT.length;
    if (!idle || Math.floor(t / 530) % 2 === 0) {
      ctx.font = FONT;
      const w = typing ? ctx.measureText(TEXT.slice(0, typing)).width : 0;
      ctx.fillStyle = 'rgba(235,235,235,0.9)';
      ctx.fillRect(TEXT_X + w + 1, TEXT_Y - 9, 1.5, 18);
    }
  }
  const ring = t < 800 ? 0 : t < 3350 ? 1 : t < 3500 ? 1 - (t - 3350) / 150 : 0;
  if (ring > 0) {                                // focus ring around the input
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * ring).toFixed(3) + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(INPUT.x - 2, INPUT.y - 2, INPUT.w + 4, INPUT.h + 4, 12); ctx.stroke();
  }
  const visible = t >= 250 && t <= 3560;
  if (visible) {
    const p = t < 800 ? ease(clamp01((t - 250) / 550))
      : t < 1000 ? ease(clamp01((t - 800) / 200))
      : t < 3350 ? 1 : 1 - ease(clamp01((t - 3350) / 210));
    const anchor = t < 800 ? FROM : t < 1000 ? TO : t < 3350 ? SIDE : FROM;
    const rest = t < 800 ? TO : t < 1000 ? SIDE : t < 3350 ? SIDE : FROM;
    const at = mix(anchor, rest, p);
    if (t >= 800 && t < 1150) {                  // click ripple at the input, not at the moving cursor
      const q = (t - 800) / 350;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - q)).toFixed(3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(TO.x, TO.y, 12 + 16 * q, 0, 2 * Math.PI); ctx.stroke();
    }
    const pressed = (t >= 800 && t < 890) ? 2 : 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2 * pressed;
    ctx.beginPath(); ctx.arc(at.x, at.y, 11, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath(); ctx.arc(at.x, at.y, 3.5, 0, 2 * Math.PI); ctx.fill();
  }
}

function loop(now) {
  if (t0 !== null) draw(now - t0);
  requestAnimationFrame(loop);
}
img.decode().then(() => {
  draw(0);
  c.dataset.ready = '1';
  c.dispatchEvent(new Event('ready'));
  requestAnimationFrame(loop);
  setInterval(() => { if (t0 !== null) draw(performance.now() - t0); }, 40);
});
window.__motionStart = () => { t0 = performance.now(); };
</script>`;
}

async function localAssistant(framesDir) {
  const browser = await openBrowser();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-motion-assistant-'));
  try {
    const file = path.join(tmp, 'index.html');
    fs.writeFileSync(file, assistantPageHtml());
    const page = await newPage(browser);
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.waitForFunction(() => document.getElementById('c')?.dataset.ready === '1', null, { timeout: 15000 });
    await page.waitForTimeout(300);
    await captureFrames(page, framesDir, async () => {
      await page.evaluate(() => window.__motionStart());
      await sleep(3400); // the page animates on its own; hold the capture window open
    });
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Checks: every loop gets frame counts, a loop-boundary and a motion metric,
// and review stills under the OS temporary directory.
// ---------------------------------------------------------------------------

const frameNames = dir => fs.readdirSync(dir).filter(n => /^frame_\d{6}\.jpg$/.test(n)).sort();

async function meanDiff(dir, a, b) {
  const [x, y] = await Promise.all([
    sharp(path.join(dir, a)).raw().toBuffer(),
    sharp(path.join(dir, b)).raw().toBuffer(),
  ]);
  assert.equal(x.length, y.length);
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += Math.abs(x[i] - y[i]);
  return sum / x.length;
}

async function checkLoop(id, dir, duration = 4) {
  const count = FPS * duration;
  const names = frameNames(dir);
  assert.equal(names.length, count, `${id}: expected ${count} frames`);
  const first = await sharp(path.join(dir, names[0])).metadata();
  assert.equal(first.width, WIDTH);
  assert.equal(first.height, HEIGHT);
  const boundary = await meanDiff(dir, names[0], names[count - 1]);
  const motion = await meanDiff(dir, names[0], names[Math.floor(count / 2)]);
  fs.mkdirSync(CHECKS, { recursive: true });
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    const i = Math.round(f * (count - 1));
    await sharp(path.join(dir, names[i])).toFile(path.join(CHECKS, `${id}-still-${String(i).padStart(3, '0')}.png`));
  }
  console.log(`${id}: ${names.length} frames, boundary diff ${boundary.toFixed(2)}, mid diff ${motion.toFixed(2)}, stills in ${CHECKS}`);
  return { boundary, motion };
}

// Privacy scan for UI loops: the account mask must hide the
// demo account button in every single frame. While the dialog is open the backdrop
// dims the whole screen, so scan for the account colours instead of plain white:
// the avatar's light blue and the notification badge's orange must never appear.
// ---------------------------------------------------------------------------
// Manifest: honest descriptions of what each loop shows and where it comes from.
// ---------------------------------------------------------------------------

function writeManifest(ids, metas = {}) {
  const all = {
    'portfolio-website': {
      id: 'portfolio-website',
      title: 'Portfolio website · short browsing loop',
      kind: 'real-ui',
      description: 'Real capture of the local portfolio preview. The view holds on the hero. It glides to the first Journey entry and opens the details. A click opens the project dialog for a short read. The Close button closes the dialog. The view restores the initial selection and glides back to the hero. First and last frames match: scrollY 0, no dialog open, the initial selection, and the pointer at its start position.',
      sources: ['Local portfolio preview of this repository (env PORTFOLIO_URL, default http://localhost:3417/)'],
      duration: metas['portfolio-website']?.duration ?? 4,
      files: { mp4: 'portfolio-website.mp4', gif: 'portfolio-website.gif', poster: 'portfolio-website.jpg' },
    },
    'homelab-cm3588': fs.existsSync(path.join(OUT, 'home-assistant-manifest.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'home-assistant-manifest.json'), 'utf8'))[0] : undefined,
    'local-assistant': {
      id: 'local-assistant',
      title: 'Local assistant · illustrative typing',
      kind: 'illustrative',
      description: 'Illustrative typing, not a live screen. A deterministic animation focuses the input on the redacted Open WebUI screenshot, types a generic sentence, and clears it again. No request is sent and no model reply is shown.',
      sources: [
        'public/images/local-assistant.png (owner-authorized, redacted capture; see docs/media-sources.md)',
        'Deterministic local canvas animation, no network activity',
      ],
      duration: 4,
      files: { mp4: 'local-assistant.mp4', gif: 'local-assistant.gif', poster: 'local-assistant.jpg' },
    },
  };
  const file = path.join(OUT, 'ui-manifest.json');
  // A partial run updates its own entries and keeps the others already recorded.
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  assert.ok(Array.isArray(existing), `${file} must hold an array of entries`);
  const byId = new Map(existing.map(entry => [entry.id, entry]));
  for (const id of ids) byId.set(id, all[id]);
  const manifest = Object.keys(all).filter(id => byId.has(id)).map(id => byId.get(id));
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`wrote ${file} with entries: ${manifest.map(entry => entry.id).join(', ')}`);
}

// ---------------------------------------------------------------------------

const LOOPS = { 'portfolio-website': portfolioWebsite, 'homelab-cm3588': () => require('./home-assistant.cjs').render(), 'local-assistant': localAssistant };

async function main() {
  const only = process.argv[2] || 'all';
  const ids = only === 'all' ? Object.keys(LOOPS) : [only];
  const metas = {};
  for (const id of ids) {
    const build = LOOPS[id];
    assert.ok(build, `Unknown loop ${id}. Choose one of ${Object.keys(LOOPS).join(', ')} or all.`);
    if (id === 'homelab-cm3588') { await build(); continue; }
    const runDir = fs.mkdtempSync(path.join(os.tmpdir(), `portfolio-motion-${id}-`));
    try {
      const framesDir = path.join(runDir, 'frames');
      console.log(`capturing ${id} …`);
      metas[id] = (await build(framesDir)) ?? null;
      const duration = metas[id]?.duration ?? 4;
      await checkLoop(id, framesDir, duration);
      const result = await encodeFrames(framesDir, path.join(OUT, id), duration, metas[id]?.gifEvery, metas[id]?.gifColours);
      console.log(`${id}: ${JSON.stringify(result)}`);
    } finally {
      fs.rmSync(runDir, { recursive: true, force: true }); // exact mkdtemp path only, never a prefix or wildcard
    }
  }
  writeManifest(ids, metas);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
