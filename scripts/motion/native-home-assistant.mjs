#!/usr/bin/env node
/**
 * Bounded working prototype: the REAL native Home Assistant frontend
 * (anonymous read-only asset GETs) rendering the ACTUAL custom dashboard code,
 * driven by an entirely fake in-process Home Assistant WebSocket backend over
 * a fictional floorplan with synthetic demo states.
 *
 * Safety model:
 *   - fresh isolated browser context; only FAKE tokens are seeded into it
 *     (never real credentials, never the original browser profile)
 *   - WebSocket is intercepted with context.routeWebSocket(); connectToServer()
 *     is never called, so no WebSocket frame reaches any server
 *   - HTTP firewall: non-GET, /auth/*, /api/*, real floorplan images, service
 *     workers and foreign origins are aborted; demo map SVG is fulfilled
 *     locally from the fictional SVG
 *   - all entity ids are sanitized to domain.demo_N aliases at runtime; no
 *     real id, name, url or value is written to the repo, logs or evidence
 *
 * Usage: provide HA_ORIGIN, HA_PRIVATE_DIR, and PLAYWRIGHT_PATH through
 * the environment. Private inputs never belong in this repository.
 * HA_PRIVATE_DIR holds read-only dashboard-original-parsed.json and
 * resources-original.json. HA_DEMO_DASHBOARD and HA_DEMO_RESOURCES can
 * override those paths. HA_NATIVE_DEMO_OUT controls private evidence output.
 * Set HA_DEMO_RENDER=1 to record the native dashboard motion study.
 */

import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeDashboard, buildStates, createFakeHa, MAP_URL } from "./native-ha-backend.mjs";

const require = createRequire(import.meta.url);
const WORKTREE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = (k, d) => process.env[k] ?? d;

const HA_ORIGIN = process.env.HA_ORIGIN?.replace(/\/+$/, "");
if (!HA_ORIGIN || !/^https?:\/\//.test(HA_ORIGIN)) {
  console.error("HA_ORIGIN env is required (set it from the private origin file)");
  process.exit(2);
}
const PRIVATE_DIR = process.env.HA_PRIVATE_DIR;
if (!PRIVATE_DIR || !process.env.PLAYWRIGHT_PATH) throw new Error("Set HA_PRIVATE_DIR and PLAYWRIGHT_PATH. Do not use real credentials.");
const OUT_DIR = env("HA_NATIVE_DEMO_OUT", path.join(PRIVATE_DIR, "worker-native-demo"));
const PLAYWRIGHT_PATH = process.env.PLAYWRIGHT_PATH;
const DEMO_SVG = env("DEMO_SVG", path.join(WORKTREE, "public/motion/sources/home-assistant-fictional-floorplan.svg"));
const DASHBOARD_JSON = env("HA_DEMO_DASHBOARD", path.join(PRIVATE_DIR, "dashboard-original-parsed.json"));
const RESOURCES_JSON = env("HA_DEMO_RESOURCES", path.join(PRIVATE_DIR, "resources-original.json"));
const HEADLESS = env("HA_DEMO_HEADLESS", "1") !== "0";

const { chromium } = require(PLAYWRIGHT_PATH);

const outputRelative = path.relative(WORKTREE,path.resolve(OUT_DIR));
if (outputRelative !== ".." && !outputRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(outputRelative)) throw new Error("Evidence must remain outside the repository.");
mkdirSync(OUT_DIR, { recursive: true });
const evidence = {
  generatedAt: new Date().toISOString(),
  origin: "<redacted>",
  nativeTags: {},
  customElementsDefined: {},
  serviceCalls: [],
  blockedRequests: [],
  allowedGets: 0,
  demoAssetsFulfilled: 0,
  wsMessageTypes: {},
  unknownWsCommands: [],
  stateChanges: 0,
  consoleErrors: [],
  screenshots: [],
  clicks: [],
};

let probingFirewall=false;
const log = (...a) => console.log("[ha-demo]", ...a);

/* ------------------------------------------------------------------ */
/* build fake world                                                    */
/* ------------------------------------------------------------------ */

const svgSource = readFileSync(DEMO_SVG, "utf8");
const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svgSource, "utf8").toString("base64")}`;

const dashboardOriginal = JSON.parse(readFileSync(DASHBOARD_JSON, "utf8"));
const demo = sanitizeDashboard(dashboardOriginal, { svgDataUri });
const states = buildStates(demo);

const resourcesOriginal = JSON.parse(readFileSync(RESOURCES_JSON, "utf8"));
const resources = (resourcesOriginal.data?.items ?? []).filter(r=>/^\/local\/eg-(home-panel|shutter-icon)\.js(?:\?|$)/.test(r.url)).map((r, i) => ({
  id: `demo-resource-${i + 1}`,
  url: r.url,
  type: r.type,
}));

const fakeHa = createFakeHa({
  config: demo.config,
  states,
  resources,
  scriptAliases: demo.scriptAliases,
  log,
});

log(
  `sanitized dashboard: ${demo.aliases.length} entities aliased, ${states.size} fake states, ` +
    `${resources.length} custom resources served from origin (read-only GET)`
);

/* ------------------------------------------------------------------ */
/* browser + firewall                                                  */
/* ------------------------------------------------------------------ */

function findCachedChromium() {
  const cache = path.join(os.homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(cache)) return null;
  const entries = readdirSync(cache);
  const pick = (prefix, sub, bin) => {
    const dir = entries.filter((e) => e.startsWith(prefix)).sort().pop();
    if (!dir) return null;
    const p = path.join(cache, dir, sub, bin);
    return existsSync(p) ? p : null;
  };
  return (
    (HEADLESS && pick("chromium_headless_shell-", "chrome-headless-shell-mac-arm64", "chrome-headless-shell")) ||
    pick("chromium-", "chrome-mac-arm64/Chromium.app/Contents/MacOS", "Chromium")
  );
}

// launch our own fresh browser: system Chrome channel with a throwaway profile,
// or the cached chromium build; the original authenticated browser is untouched
async function launchBrowser() {
  const exe = env("PLAYWRIGHT_EXECUTABLE", "");
  if (exe) return chromium.launch({ headless: HEADLESS, executablePath: exe });
  try {
    return await chromium.launch({ headless: HEADLESS, channel: "chrome" });
  } catch (e) {
    log(`chrome channel unavailable (${e.message.split("\n")[0]}), trying cached chromium`);
    const cached = findCachedChromium();
    if (!cached) throw e;
    return chromium.launch({ headless: HEADLESS, executablePath: cached });
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({
  viewport: { width: 1188, height: 744 },
  colorScheme: "dark",
  serviceWorkers: "block",
  locale: "en-US",
  timezoneId: "UTC",
});

// the fake HA websocket backend; the socket is never connected to a server
await context.routeWebSocket(/.*/, (ws) => {
  if (new URL(ws.url()).pathname === "/api/websocket") fakeHa.attach(ws);
  else ws.close();
});

const pageOrigin = new URL(HA_ORIGIN).origin;
const blockClass = (url, method) => {
  let u;
  try {
    u = new URL(url);
  } catch {
    return { cls: "unparseable-url" };
  }
  if (u.origin !== pageOrigin) return { cls: "external-origin" };
  if (method !== "GET") return { cls: "non-GET-write" };
  if (u.pathname === "/api/websocket") return { cls: null }; // handled by routeWebSocket
  if (u.pathname.startsWith("/auth/")) return { cls: "auth-endpoint" };
  if (u.pathname.startsWith("/api/")) return { cls: "rest-api" };
  if (u.pathname.startsWith("/local/floorplans/")) return { cls: "real-floorplan-image" };
  if (u.pathname.startsWith("/service_worker")) return { cls: "service-worker" };
  if (u.pathname.startsWith("/local/") && !/\.js(\?|$)/.test(u.pathname + u.search)) return { cls: "non-script-local-asset" };
  return { cls: null };
};

await context.route("**/*", (route) => {
  const req = route.request();
  const url = req.url();
  const { cls } = blockClass(url, req.method());
  if (cls) {
    const u = new URL(url);
    evidence.blockedRequests.push({
      method: req.method(),
      class: cls,
      path: "<redacted>",
    });
    return route.abort();
  }
  const u = new URL(url);
  if (u.pathname === MAP_URL) {
    evidence.demoAssetsFulfilled += 1;
    return route.fulfill({ status: 200, contentType: "image/svg+xml", body: svgSource });
  }
  evidence.allowedGets += 1;
  return route.continue();
});

// fake credentials for this isolated context only; never real tokens
await context.addInitScript(
  ({ origin }) => {
    localStorage.setItem(
      "hassTokens",
      JSON.stringify({
        hassUrl: origin,
        clientId: origin + "/",
        access_token: "demo-fake-access-token",
        expires_in: 86400,
        expires: Date.now() + 86400e3,
        refresh_token: "demo-fake-refresh-token",
        token_type: "Bearer",
      })
    );
    // belt and braces: no service worker in the demo context
    if (navigator.serviceWorker) navigator.serviceWorker.register = () => new Promise(() => {});
  },
  { origin: HA_ORIGIN }
);

await context.addInitScript(() => {
  window.__haDemo = {
    walk(fn) {
      const out = [];
      const visit = (root) => {
        for (const el of root.querySelectorAll("*")) {
          if (fn(el, out)) out.push(el);
          if (el.shadowRoot) visit(el.shadowRoot);
        }
      };
      visit(document);
      return out;
    },
    tagCounts() {
      const counts = {};
      this.walk((el) => {
        const t = el.tagName.toLowerCase();
        if (t.includes("-")) counts[t] = (counts[t] || 0) + 1;
        return true;
      });
      return counts;
    },
    defined(tags) {
      return Object.fromEntries(tags.map((t) => [t, Boolean(customElements.get(t))]));
    },
    rect(selector) {
      const el = this.walk((e) => e.matches?.(selector) ?? false)[0];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    },
    rectForEntity(entity, tag) {
      const el = this.walk((e) => (tag ? e.tagName?.toLowerCase() === tag : true) && (e._config ?? e.config)?.entity === entity)[0];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    },
    rectInShadow(hostTag, selector) {
      const host = this.walk((e) => e.tagName?.toLowerCase() === hostTag)[0];
      if (!host?.shadowRoot) return null;
      const el = host.shadowRoot.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    },
  };
});

process.on("SIGTERM", async()=>{await browser.close();process.exit(1)});
const redactDiagnostic = text => {
  let safe=String(text).split(pageOrigin).join('<origin>').replace(/\/local\/[^\s'"<>]+/g,'/local/<redacted>');
  for(const id of demo.entityMap.keys()) safe=safe.split(id).join('<entity>');
  return safe;
};
const page = await context.newPage();
page.on("console", (m) => {
  if (m.type() === "error" && !probingFirewall) evidence.consoleErrors.push(redactDiagnostic(m.text()));
});
page.on("pageerror", (e) => evidence.consoleErrors.push(redactDiagnostic(`pageerror: ${e.message}`)));

log("loading real frontend …");
await page.goto(`${HA_ORIGIN}/`, { waitUntil: "domcontentloaded", timeout: 90000 });

await page.waitForFunction(
  () =>
    Boolean(
      customElements.get("hui-picture-elements-card") &&
        customElements.get("eg-floorplan-header") &&
        customElements.get("eg-home-panel") &&
        customElements.get("eg-shutter-icon")
    ),
  null, { timeout: 90000 }
).catch(() => { throw new Error("custom card elements did not register — see evidence/console errors"); });

await page.waitForFunction(
  () => Boolean(window.__haDemo?.rectInShadow("eg-home-panel", "ha-card .tabs")),
  null, { timeout: 60000 }
).catch(() => { throw new Error("eg-home-panel did not render its tabs"); });

await page.waitForTimeout(1200); // settle images + theme
await page.evaluate(()=>{
 const note=document.createElement('div');note.textContent='Illustrative activity\nNo real devices';
 note.style.cssText='position:fixed;left:16px;top:126px;width:210px;color:#9aa7ad;font:12px/1.7 Roboto,sans-serif;white-space:pre-line;pointer-events:none;z-index:1000';document.body.append(note);
});


/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const privacyGate = async () => {
 const result=await page.evaluate(({identifiers,origin})=>{
   let text='';const images=[];const configs=[];
   function visit(root){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;if(!n.parentElement?.closest('style,script'))text+=' '+n.textContent;}
     for(const el of root.querySelectorAll('*')){if(el.localName==='img')images.push(el.src);if(['hui-picture-elements-card','eg-home-panel','eg-floorplan-header','eg-shutter-icon'].includes(el.localName)) configs.push(el._config??el.config);if(el.shadowRoot)visit(el.shadowRoot);}}
   visit(document);const shown=text+' '+JSON.stringify(configs);
   const leaks=identifiers.filter(id=>shown.includes(id));
   if(shown.includes(new URL(origin).host)) leaks.push("private-origin");
   const badImages=images.filter(src=>new URL(src,origin).pathname!=='/__demo_floorplan.svg');
   const realStates=Object.keys(document.querySelector('home-assistant').hass.states).filter(id=>!/^\w+\.demo_/.test(id));
   return {identifierLeaks:leaks.length,badImages:badImages.length,realStates:realStates.length,images:images.length};
 },{identifiers:[...demo.entityMap.keys()],origin:HA_ORIGIN});
 if(result.identifierLeaks||result.badImages||result.realStates)throw new Error('Native dashboard privacy gate failed; no capture permitted');
 evidence.privacyGate=result;return result;
};
const shot = async (name, opts = {}) => {
  await privacyGate();
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, ...opts });
  evidence.screenshots.push(name);
  log("screenshot:", name);
};
const clickRect = async (rect, label) => {
  rect = await rect;
  if (!rect) throw new Error(`no rect for ${label}`);
  await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
  evidence.clicks.push(label);
  log("clicked:", label);
};
const firstElementAlias = (pred) => {
  const els = demo.config.views[0].cards[0].cards[1].elements;
  return els.find(pred)?.entity;
};

/* ------------------------------------------------------------------ */
/* interactions (real clicks, fake backend)                            */
/* ------------------------------------------------------------------ */

const rendering = process.env.HA_DEMO_RENDER === '1';
if(process.env.HA_DEMO_FIREWALL_CHECK==='1') {
  probingFirewall=true;
  const failed=await page.evaluate(async()=>Promise.all([
    ['/api/services/switch/toggle','POST'],['/auth/token','POST'],
    ['/local/floorplans/demo-canary.svg','GET'],['https://example.invalid/demo-canary','GET'],
  ].map(async([url,method])=>{try{await fetch(url,{method});return false;}catch{return true;}})));
  if(!failed.every(Boolean)||evidence.blockedRequests.length!==4)throw new Error('Native preview firewall canary failed');
  evidence.firewallCanariesPassed=4;
  await privacyGate();
  await shot('firewall-verified.png');
} else if (rendering) {
  const assert = require('node:assert/strict');
  const {mkdtempSync, rmSync} = require('node:fs');
  const {captureFrames,encodeFrames,sleep} = require('./encode.cjs');
  const frames = mkdtempSync(path.join(os.tmpdir(),'portfolio-native-ha-'));
  const HOME={x:1100,y:650};
  const moveClick = async(rect,label)=>{
    rect=await rect;assert.ok(rect&&rect.y>=56&&rect.y+rect.height<=744,`${label} must be visible`);
    await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2,{steps:10});
    await sleep(160);await page.mouse.down();await sleep(80);await page.mouse.up();
    evidence.clicks.push(label);
  };
  const inCard=(tag,selector)=>page.evaluate(([tag,selector])=>window.__haDemo.rectInShadow(tag,selector),[tag,selector]);
  const lightAlias=firstElementAlias(e=>e.icon?.includes('lightbulb'));
  const lightRect=()=>page.evaluate(id=>window.__haDemo.rectForEntity(id,'hui-state-icon-element'),lightAlias);
  const panel=demo.config.views[0].cards[0].cards[2];
  const vacAlias=panel.vacuum.entity;
  await page.evaluate(()=>{
    const pointer=document.createElement('div');pointer.id='demo-pointer';
    pointer.innerHTML='<svg width="24" height="30" viewBox="0 0 24 30"><path d="M3 2v22l6-6 4 9 4-2-4-8h8Z" fill="#f7fafb" stroke="#10171b" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    pointer.style.cssText='position:fixed;left:0;top:0;width:24px;height:30px;pointer-events:none;z-index:2147483647';document.body.append(pointer);
    document.addEventListener('pointermove',e=>pointer.style.transform=`translate(${e.clientX}px,${e.clientY}px)`,true);
  });
  await page.mouse.move(HOME.x,HOME.y);await sleep(500);
  const initial=Object.fromEntries([...states].map(([id,v])=>[id,v.s]));
  await privacyGate();
  try {
    await captureFrames(page,frames,async()=>{
      await sleep(400);
      await moveClick(lightRect(),'native bulb on');assert.equal(states.get(lightAlias).s,'on');
      await sleep(400);
      await moveClick(inCard('eg-floorplan-header','[data-a="open"][data-group="all"]'),'native shutter sheet');
      await sleep(150);
      await moveClick(inCard('eg-floorplan-header','[data-a="down"]'),'native shutters down');
      await sleep(650);
      await moveClick(inCard('eg-floorplan-header','[data-a="close"]'),'close native shutter sheet');
      await sleep(450);
      await page.mouse.move(750,590);await page.mouse.wheel(0,1400);await sleep(600);
      await moveClick(inCard('eg-home-panel','[data-a="start"]:not([disabled])'),'native vacuum start');
      await sleep(750);assert.equal(states.get(vacAlias).s,'cleaning');
      await moveClick(inCard('eg-home-panel','[data-a="tab"][data-v="kitchen"]'),'native kitchen tab');
      await sleep(1300);
      await moveClick(inCard('eg-home-panel','[data-a="tab"][data-v="media"]'),'native media tab');
      await sleep(750);
      await moveClick(inCard('eg-home-panel','[data-a="tab"][data-v="vacuum"]'),'native cleaner tab');
      await moveClick(inCard('eg-home-panel','[data-a="dock"]:not([disabled])'),'native vacuum dock');
      await sleep(400);
      await page.mouse.move(750,400);await page.mouse.wheel(0,-1800);await sleep(650);
      await moveClick(lightRect(),'native bulb off');assert.equal(states.get(lightAlias).s,'off');
      await moveClick(inCard('eg-floorplan-header','[data-a="open"][data-group="all"]'),'native shutter sheet again');
      await sleep(100);
      await moveClick(inCard('eg-floorplan-header','[data-a="up"]'),'native shutters up');
      await sleep(650);
      await moveClick(inCard('eg-floorplan-header','[data-a="close"]'),'close native shutter sheet again');
      await page.mouse.move(HOME.x,HOME.y,{steps:10});
      await sleep(2100);
      for (const [id,state] of Object.entries(initial)) assert.equal(states.get(id).s,state,`restore ${id}`);
      evidence.stateRestored=true;
      await sleep(500);
    },16);
    await encodeFrames(frames,path.join(WORKTREE,'public/motion/homelab-cm3588'),16,4,128);
    const first=await require('sharp')(path.join(frames,'frame_000000.jpg')).resize(96,60).removeAlpha().raw().toBuffer();
    const last=await require('sharp')(path.join(frames,'frame_000399.jpg')).resize(96,60).removeAlpha().raw().toBuffer();
    evidence.boundaryMeanDiff=first.reduce((sum,v,i)=>sum+Math.abs(v-last[i]),0)/first.length;
    assert.ok(evidence.boundaryMeanDiff<4,'The native loop must restore its visual opening state');
    writeFileSync(path.join(WORKTREE,"public/motion/home-assistant-manifest.json"),JSON.stringify([{"id": "homelab-cm3588", "title": "Home Assistant \u00b7 native cards and demo states", "kind": "illustrative", "description": "The actual Home Assistant frontend and the owner's original shutter and cleaner/media/kitchen cards. A fictional apartment replaces the floorplan, with controls repositioned for its rooms. Real clicks toggle a bulb, operate the native shutter sheet, start and dock the cleaner, and inspect the kitchen and media tabs. Every device state is synthetic. No real device commands or configuration changes.", "sources": ["Read-only frontend assets and original custom dashboard components; configuration inputs remain private.", "public/motion/sources/home-assistant-fictional-floorplan.svg", "Fresh isolated browser with a local simulated WebSocket backend; no real credentials or live device states."], "duration": 16, "files": {"mp4": "homelab-cm3588.mp4", "gif": "homelab-cm3588.gif", "poster": "homelab-cm3588.jpg"}}],null,2)+"\n");
    log('native loop captured',JSON.stringify({seconds:16,frames:400,boundaryMeanDiff:evidence.boundaryMeanDiff}));
  } finally {rmSync(frames,{recursive:true,force:true});}
} else {
await shot("01-initial-viewport.png");
writeFileSync(path.join(OUT_DIR,"initial-evidence.json"),JSON.stringify({nativeTags:await page.evaluate(()=>window.__haDemo.tagCounts()),counters:fakeHa.counters,errors:evidence.consoleErrors},null,2));

// 1. toggle a floorplan light through the native state-icon
const lightAlias = firstElementAlias((e) => e.icon?.includes("lightbulb"));
if (lightAlias) {
  const before = states.get(lightAlias)?.s;
  await clickRect(page.evaluate((e) => window.__haDemo.rectForEntity(e, "hui-state-icon-element"), lightAlias), `floorplan light toggle (${lightAlias})`);
  await page.waitForTimeout(600);
  const after = states.get(lightAlias)?.s;
  if (before === after) throw new Error(`fake state did not change for ${lightAlias}`);
  evidence.clicks.push(`state-change ${lightAlias}: ${before} -> ${after}`);
  await shot("02-light-toggled.png");
} else {
  throw new Error("no light element found in sanitized config");
}

// 2. floorplan header shutter sheet
await clickRect(page.evaluate(() => window.__haDemo.rectInShadow("eg-floorplan-header", '[data-a="open"][data-group="all"]')), "header: Alle Rollos");
await page.waitForTimeout(300);
await shot("03-shutter-sheet-open.png");

const downAlias = firstElementAlias((e) => e.type === "custom:eg-shutter-icon");
await clickRect(page.evaluate(() => window.__haDemo.rectInShadow("eg-floorplan-header", '[data-a="down"]')), "sheet: Runter (close all covers)");
await page.waitForTimeout(400);
await shot("04-shutters-closing.png");

// close the sheet via its backdrop, then let the covers finish closing
await clickRect({ x: 300, y: 400, width: 1, height: 1 }, "sheet: backdrop close");
await page.waitForTimeout(2800);
const closedCount = [...states.entries()].filter(([id, v]) => id.startsWith("cover.") && v.s === "closed").length;
evidence.clicks.push(`covers closed: ${closedCount}`);

// 3. scroll to the lower device panel
await page.mouse.move(600, 400);
await page.mouse.wheel(0, 1400);
await page.waitForTimeout(700);
await shot("05-device-panel-vacuum.png");

// 4. start the (fake) vacuum via the native panel button
const startRect = await page.evaluate(() => window.__haDemo.rectInShadow("eg-home-panel", '[data-a="start"]:not([disabled])'));
if (startRect) {
  const vacAlias = demo.roles.find((r) => r.role.endsWith(".vacuum.entity"))?.alias;
  await clickRect(startRect, "panel: vacuum Start");
  await page.waitForTimeout(900);
  evidence.clicks.push(`vacuum state: ${states.get(vacAlias)?.s}`);
  await shot("06-vacuum-cleaning.png");

  // 5. the fulfilled fictional map
  await clickRect(page.evaluate(() => window.__haDemo.rectInShadow("eg-home-panel", '[data-a="map"]')), "panel: Karte (fulfilled demo SVG)");
  await page.waitForFunction(
    () => {
      const host = window.__haDemo.walk((e) => e.tagName?.toLowerCase() === "eg-home-panel")[0];
      const img = host?.shadowRoot?.querySelector("img.map");
      return img && img.complete && img.naturalWidth > 0;
    },
    { timeout: 15000 }
  ).catch(() => log("WARN: map image did not report complete"));
  await page.waitForTimeout(400);
  await shot("07-vacuum-map.png");
}

// 6. kitchen tab
await clickRect(page.evaluate(() => window.__haDemo.rectInShadow("eg-home-panel", '[data-a="tab"][data-v="kitchen"]')), "panel: Küche tab");
await page.waitForTimeout(500);
await shot("08-kitchen-tab.png");

// 7. media tab
await clickRect(page.evaluate(() => window.__haDemo.rectInShadow("eg-home-panel", '[data-a="tab"][data-v="media"]')), "panel: Medien tab");
await page.waitForTimeout(700);
await shot("09-media-tab.png");

}

/* ------------------------------------------------------------------ */
/* evidence                                                            */
/* ------------------------------------------------------------------ */

evidence.nativeTags = await page.evaluate(() => window.__haDemo.tagCounts());
evidence.customElementsDefined = await page.evaluate(() =>
  window.__haDemo.defined([
    "home-assistant", "ha-app-layout", "ha-sidebar", "ha-panel-lovelace", "hui-view", "hui-picture-elements-card",
    "hui-vertical-stack-card", "hui-state-icon-element", "hui-markdown-element", "ha-icon", "ha-card",
    "ha-entity-toggle", "eg-floorplan-header", "eg-home-panel", "eg-shutter-icon",
  ])
);
evidence.serviceCalls = fakeHa.counters.serviceCalls.map((c) => ({
  call: c.call,
  entities: c.entities,
  at: new Date(c.ts).toISOString(),
})); // note: raw service data intentionally not persisted
evidence.wsMessageTypes = fakeHa.counters.wsMessages;
evidence.unknownWsCommands = fakeHa.counters.unknownCommands;
evidence.stateChanges = fakeHa.counters.stateChanges;
evidence.sanitizedStateSnapshot = Object.fromEntries([...states.entries()].map(([k, v]) => [k, { state: v.s, friendly_name: v.a.friendly_name }]));
evidence.fakeSocketNote =
  "WebSocket handled by Playwright routeWebSocket; connectToServer() was never called, so no frame reached any server.";
evidence.resourcesServed = resources.map((r) => r.url.split("?")[0]);

writeFileSync(path.join(OUT_DIR, "evidence.json"), JSON.stringify(evidence, null, 2));
writeFileSync(path.join(OUT_DIR, "sanitized-dashboard-config.json"), JSON.stringify(demo.config, null, 2));

console.log("\n=== SUMMARY (sanitized) ===");
console.log("native custom elements rendered:", {
  "eg-floorplan-header": evidence.nativeTags["eg-floorplan-header"] ?? 0,
  "eg-home-panel": evidence.nativeTags["eg-home-panel"] ?? 0,
  "eg-shutter-icon": evidence.nativeTags["eg-shutter-icon"] ?? 0,
  "hui-picture-elements-card": evidence.nativeTags["hui-picture-elements-card"] ?? 0,
  "hui-state-icon-element": evidence.nativeTags["hui-state-icon-element"] ?? 0,
  "ha-icon": evidence.nativeTags["ha-icon"] ?? 0,
});
console.log("service calls (fake):", evidence.serviceCalls.map((c) => `${c.call}${c.entities.length ? ` [${c.entities.length} entities]` : ""}`).join(", ") || "none");
console.log("fake state changes:", evidence.stateChanges);
console.log("blocked requests:", JSON.stringify(evidence.blockedRequests));
console.log("allowed GETs:", evidence.allowedGets, "| demo map fulfills:", evidence.demoAssetsFulfilled);
console.log("unknown ws commands:", evidence.unknownWsCommands.length ? evidence.unknownWsCommands : "none");
console.log("console errors:", evidence.consoleErrors.length ? evidence.consoleErrors.slice(0, 5) : "none");
console.log("screenshots + evidence.json in:", OUT_DIR);

await browser.close();
fakeHa.cleanup();
