#!/usr/bin/env node
/**
 * Real-browser regressions for the project motion clips. Run: node scripts/media-browser-check.mjs
 * Needs the globally installed playwright-cli. The script spawns its own dev server on
 * MEDIA_CHECK_PORT (default 3477) and drives its own isolated playwright-cli session with an
 * in-memory profile; it never touches any other browser.
 *
 * Covered:
 * S0 At load, with only the hero visible, no clip element exists and no /motion/*.mp4 is
 *    requested; the card image defaults to the matching /motion/<id>.jpg poster.
 * A1 A card scrolled into view autoplays muted without any click; the clip poster matches the video.
 * A2 A clip that leaves the viewport is removed, paused, and unloaded (no src, NETWORK_EMPTY).
 * A3 Returning to view restarts the clip.
 * A4 An explicit pause persists across leaving and returning; Play restarts the clip.
 * A5 The dialog clip plays while the page card pauses behind the modal; closing resumes the card.
 * A6 A language-style re-render (innerHTML replacement with the dialog closed, as in production,
 *    then mountMedia through the dialog-open path) stops and unloads the clips that were playing;
 *    retained old element references prove it.
 * B  play() rejecting with NotAllowedError restores the static poster, removes the clip element,
 *    hides the badge, and keeps a usable Play control; a retry with a real gesture then plays.
 * C  Reduced-motion: a naturally autoplaying clip pauses on the change, an explicit Play opts in,
 *    a fresh load shows only the poster with its Play control, and motion returning autoplays it.
 * D  Card and dialog poster use object-fit contain (no cropped movie or poster) and match the clip.
 */

import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = process.env.MEDIA_CHECK_PORT ?? '3477';
const url = `http://localhost:${port}/`;
const session = 'portfolio-media-regression-' + process.pid;

const payload = `async page => {
  const assert = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); };
  const unloaded = s => s.paused && !s.hasSrc && s.network === 0 && s.ready === 0 && !s.connected;
  const wait = ms => page.waitForTimeout(ms);
  const state = sel => {
    const root = document.querySelector(sel);
    const v = root.querySelector('video');
    return {
      hasVideo: !!v,
      playing: !!v && !v.paused,
      src: v ? v.getAttribute('src') : null,
      poster: v ? v.getAttribute('poster') : null,
      network: v ? v.networkState : -1,
      ready: v ? v.readyState : -1,
      connected: !!v && v.isConnected,
      imgSrc: root.querySelector('img').getAttribute('src'),
      imgVisible: !root.querySelector('img').hidden,
      badgeHidden: root.querySelector('.media-badge').hidden,
      controlHidden: root.querySelector('[data-media-toggle]').hidden,
      ariaPressed: root.querySelector('[data-media-toggle]').getAttribute('aria-pressed'),
    };
  };
  const to = (sel, arg) => page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center', behavior: 'instant' }), sel);

  await page.goto('${url}');
  await page.waitForSelector('[data-media-toggle]');
  // Instrument: record every clip video node created from now on.
  await page.evaluate(() => {
    window.__clips = [];
    new MutationObserver(records => {
      for (const r of records) for (const n of r.addedNodes) if (n.tagName === 'VIDEO') window.__clips.push(n);
    }).observe(document.body, { childList: true, subtree: true });
  });

  // S0: at load, with only the hero visible, no clip element exists and no clip bytes were requested.
  let count = await page.evaluate(() => document.querySelectorAll('video').length);
  assert(count === 0, 'S0 no video element at load, got ' + count);
  count = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => e.name.indexOf('/motion/') >= 0 && e.name.split('?')[0].endsWith('.mp4')).length);
  assert(count === 0, 'S0 zero /motion/*.mp4 requests at load, got ' + count);
  let s = await page.evaluate(state, '[data-media=local-assistant]');
  assert(s.imgSrc === '/motion/local-assistant.jpg', 'S0 card default image is the matching poster, got ' + s.imgSrc);

  // A1: a card scrolled into view autoplays without any click.
  const card = '[data-media=local-assistant]';
  await to(card);
  await page.waitForSelector(card + ' video');
  await wait(300);
  s = await page.evaluate(state, card);
  assert(s.playing, 'A1 visible clip autoplays without a click, got ' + JSON.stringify(s));
  assert(s.poster === '/motion/local-assistant.jpg', 'A1 clip poster matches the video, got ' + s.poster);

  // A2: scroll the card out of the viewport; the clip is removed, paused, and unloaded.
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await wait(500);
  s = await page.evaluate(state, card);
  assert(!s.hasVideo && s.imgVisible && s.badgeHidden, 'A2 offscreen clip returns to the poster, got ' + JSON.stringify(s));

  // A3: returning to view restarts the clip.
  await to(card);
  await page.waitForSelector(card + ' video');
  await wait(300);
  s = await page.evaluate(state, card);
  assert(s.playing, 'A3 clip restarts on return, got ' + JSON.stringify(s));

  // A4: an explicit pause persists across leaving and returning; Play restarts the clip.
  await page.evaluate(sel => document.querySelector(sel + ' [data-media-toggle]').click(), card);
  await wait(300);
  s = await page.evaluate(state, card);
  assert(!s.hasVideo && s.imgVisible && s.ariaPressed === 'false' && !s.controlHidden, 'A4 pause returns to the poster with a usable control, got ' + JSON.stringify(s));
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await wait(400);
  await to(card);
  await wait(600);
  s = await page.evaluate(state, card);
  assert(!s.hasVideo, 'A4 manual pause persists across leaving and returning, got ' + JSON.stringify(s));
  await page.evaluate(sel => document.querySelector(sel + ' [data-media-toggle]').click(), card);
  await page.waitForSelector(card + ' video');
  await wait(300);
  s = await page.evaluate(state, card);
  assert(s.playing, 'A4 Play restarts the clip, got ' + JSON.stringify(s));

  // A5: the dialog clip plays while the page card pauses behind the modal; closing resumes the card.
  await page.evaluate(() => document.querySelector("[data-project='local-assistant']").click());
  await page.waitForSelector('dialog [data-media=local-assistant] video');
  await wait(300);
  s = await page.evaluate(state, 'dialog [data-media=local-assistant]');
  assert(s.playing, 'A5 dialog clip plays, got ' + JSON.stringify(s));
  s = await page.evaluate(state, card);
  assert(!s.hasVideo && s.imgVisible, 'A5 page card pauses behind the modal, got ' + JSON.stringify(s));
  await page.evaluate(() => document.querySelector('#close-dialog').click());
  await wait(500);
  s = await page.evaluate(state, card);
  assert(s.playing, 'A5 page card resumes after the modal closes, got ' + JSON.stringify(s));

  // A6: a re-render like render() does. The dialog is closed before the replacement, exactly as in
  // production: a modal covers the page, so a language re-render cannot happen while it is open.
  // Every clip playing right before the replacement must end paused + unloaded via the sweep that
  // the dialog-open mountMedia performs on detached roots.
  await to(card);
  await page.waitForSelector(card + ' video');
  await wait(200);
  const playing = await page.evaluate(() => window.__clips.map((v, i) => (!v.paused && v.isConnected) ? i : -1).filter(i => i >= 0));
  assert(playing.length >= 1, 'A6 expected a playing clip before the re-render, got ' + playing.length);
  await page.evaluate(() => { document.querySelector('#app').innerHTML = document.querySelector('#app').innerHTML; });
  await page.evaluate(() => document.querySelector("[data-project='local-assistant']").click());
  await wait(500);
  const rerender = await page.evaluate(idx => idx.map(i => {
    const v = window.__clips[i];
    return { paused: v.paused, hasSrc: v.hasAttribute('src'), network: v.networkState, ready: v.readyState, connected: v.isConnected };
  }), playing);
  rerender.forEach((st, i) => assert(unloaded(st), 'A6 playing clip #' + playing[i] + ' paused + unloaded, got ' + JSON.stringify(st)));
  await page.evaluate(() => document.querySelector('dialog #close-dialog')?.click());
  await wait(200);

  // B: play() rejects with NotAllowedError: poster stays, control stays usable, retry plays.
  // Park every clip at the top first, so the stub governs the next autoplay attempt.
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await wait(400);
  await page.evaluate(() => {
    window.__realPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked by policy', 'NotAllowedError'));
  });
  const tedias = '[data-media=tedias-ahead]';
  await to(tedias);
  await wait(600);
  s = await page.evaluate(state, tedias);
  assert(s.imgVisible && !s.hasVideo && s.badgeHidden && !s.controlHidden, 'B policy-blocked play restores the poster and keeps the control, got ' + JSON.stringify(s));
  assert(s.ariaPressed === 'false', 'B control offers Play again, got ' + JSON.stringify(s));
  assert(s.imgSrc === '/motion/tedias-ahead.jpg', 'B poster matches the clip, got ' + s.imgSrc);
  await page.evaluate(() => { HTMLMediaElement.prototype.play = window.__realPlay; });
  await page.evaluate(sel => document.querySelector(sel + ' [data-media-toggle]').click(), tedias);
  await page.waitForSelector(tedias + ' video');
  await wait(300);
  s = await page.evaluate(state, tedias);
  assert(s.playing, 'B gesture retry after a policy block plays, got ' + JSON.stringify(s));

  // C1: a naturally autoplaying clip pauses and unloads when reduced-motion switches on.
  // Reload first so the explicit opt-in from B's gesture retry is out of the picture.
  await page.reload();
  await page.waitForSelector('[data-media-toggle]');
  await to(tedias);
  await page.waitForSelector(tedias + ' video');
  await wait(300);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await wait(500);
  s = await page.evaluate(state, tedias);
  assert(!s.hasVideo && s.imgVisible && !s.controlHidden, 'C1 reduced-motion pauses and unloads a playing clip, got ' + JSON.stringify(s));

  // C2: an explicit Play press opts in under reduced-motion.
  await page.evaluate(sel => document.querySelector(sel + ' [data-media-toggle]').click(), tedias);
  await page.waitForSelector(tedias + ' video');
  await wait(300);
  s = await page.evaluate(state, tedias);
  assert(s.playing, 'C2 explicit play opts in under reduced-motion, got ' + JSON.stringify(s));

  // C3: with reduced-motion still on, a fresh load shows only the matching poster; autoplay stays off.
  await page.reload();
  await page.waitForSelector('[data-media-toggle]');
  await to(tedias);
  await wait(600);
  s = await page.evaluate(state, tedias);
  assert(!s.hasVideo && s.imgVisible && !s.controlHidden, 'C3 reduced-motion default is the poster with a Play control, got ' + JSON.stringify(s));
  assert(s.imgSrc === '/motion/tedias-ahead.jpg', 'C3 poster matches the clip, got ' + s.imgSrc);

  // C4: motion returning autoplays the visible clip again.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await wait(500);
  s = await page.evaluate(state, tedias);
  assert(s.playing, 'C4 motion returning autoplays the visible clip, got ' + JSON.stringify(s));

  // D: card and dialog poster are not cropped and match the clip.
  const fit = await page.evaluate(() => getComputedStyle(document.querySelector('[data-media=tedias-ahead] img')).objectFit);
  assert(fit === 'contain', 'D card poster is not cropped, got ' + fit);
  await page.evaluate(() => document.querySelector("[data-project='homelab-cm3588']").click());
  await wait(300);
  const detail = await page.evaluate(() => {
    // The clip element copies the img's detail-image class and sits before it, so select the img directly.
    const img = document.querySelector('dialog .detail-media img');
    return { src: img.getAttribute('src'), fit: getComputedStyle(img).objectFit };
  });
  assert(detail.src === '/motion/homelab-cm3588.jpg', 'D dialog poster matches the clip, got ' + detail.src);
  assert(detail.fit === 'contain', 'D dialog poster is not cropped, got ' + detail.fit);
  return 'media regressions passed';
}
`;

const scratch = mkdtempSync(join(tmpdir(), 'media-regression-'));
const cli = args => execFileSync('playwright-cli', args, { cwd: scratch, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const server = spawn('bun', ['server.ts'], { env: { ...process.env, PORT: port }, stdio: 'ignore', detached: false });

async function waitForServer() {
    for (let i = 0; i < 40; i++) {
        try {
            const res = await fetch(url);
            if (res.ok) return;
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`dev server did not become ready on ${url}`);
}

try {
    await waitForServer();
    // Use a unique isolated session. Never close a pre-existing browser.
    cli(['-s=' + session, 'open', url]);
    const file = join(scratch, 'payload.js');
    writeFileSync(file, payload);
    let out = '';
    try {
        out = cli(['-s=' + session, 'run-code', '--filename=' + file]);
    } catch (error) {
        out = [error.stdout, error.stderr].filter(Boolean).join('\n');
    }
    if (!out.includes('media regressions passed')) {
        console.error(out);
        throw new Error('media browser regressions failed');
    }
    console.log('media-browser-check: all regressions passed');
} finally {
    try { cli(['-s=' + session, 'close']); } catch {}
    server.kill();
    rmSync(scratch, { recursive: true, force: true });
}
