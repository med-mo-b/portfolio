/**
 * Fake Home Assistant backend for the ha-native-demo prototype.
 *
 * Takes the original dashboard config (from a private read-only copy) and
 * produces:
 *   1. a sanitized, fictional dashboard config (all entity ids -> domain.demo_N
 *      aliases, fictional image, generic room-mapped names, no device or user
 *      ids),
 *   2. a fully synthetic fake entity state store (illustrative values only),
 *   3. a WebSocket message handler implementing the HA client protocol so the
 *      real Home Assistant frontend boots against it.
 *
 * Everything user-visible is generated from the fictional floorplan geometry;
 * no real ids, names, urls or measurement values are used.
 */

export const HA_VERSION = "2026.3.0";
export const MAP_URL = "/__demo_floorplan.svg";

/* ------------------------------------------------------------------ */
/* entity id aliasing                                                  */
/* ------------------------------------------------------------------ */

const ENTITY_DOMAINS =
  "light|switch|cover|climate|sensor|binary_sensor|vacuum|media_player|remote|select|image|script|input_boolean|input_select|input_number|button|lock|fan|humidifier|number|person|device_tracker|camera|weather|update|scene|automation|group|sun|timer|water_heater|todo|calendar|siren";
const ENTITY_RE = new RegExp(`\\b(?:${ENTITY_DOMAINS})\\.[a-zA-Z0-9_]+\\b`, "g");

function aliasEntitiesInString(str, map, counters) {
  return str.replace(ENTITY_RE, (id) => {
    if (!map.has(id)) {
      const domain = id.split(".")[0];
      const n = (counters.get(domain) ?? 0) + 1;
      counters.set(domain, n);
      map.set(id, `${domain}.demo_${n}`);
    }
    return map.get(id);
  });
}

/* ------------------------------------------------------------------ */
/* fictional room geometry (matches the fictional floorplan SVG)       */
/* ------------------------------------------------------------------ */

const ROOMS = ["living", "kitchen", "hall", "bedroom", "bath", "study", "storage", "balcony"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function roomFor(left, top) {
  const x = parseFloat(left);
  const y = parseFloat(top);
  if (y < 40) return x < 42 ? "living" : x < 55 ? "hall" : "bedroom";
  if (y < 67) return x < 42 ? "kitchen" : x < 55 ? "hall" : "bath";
  if (y < 89) return x < 32 ? "balcony" : x < 45 ? "storage" : x < 55 ? "hall" : "study";
  return x < 42 ? "balcony" : x < 55 ? "storage" : "study";
}

function kindForElement(el) {
  if (el.type === "custom:eg-shutter-icon") return "shutter";
  const icon = el.icon ?? "";
  if (icon.includes("lightbulb")) return "light";
  if (icon.includes("power-socket")) return "socket";
  if (icon.includes("air-conditioner")) return "air conditioner";
  if (icon.includes("radiator")) return "radiator";
  if (icon.includes("window-shutter")) return "shutter";
  return "device";
}

/* ------------------------------------------------------------------ */
/* sanitizer                                                           */
/* ------------------------------------------------------------------ */

export function sanitizeDashboard(original, { svgDataUri }) {
  const map = new Map(); // real entity id -> alias
  const counters = new Map();
  const roles = []; // {role: config path, alias}

  function walk(node, key) {
    if (Array.isArray(node)) return node.map((v) => walk(v, key));
    if (node && typeof node === "object") {
      const out = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === "visible") continue; // real per-user visibility rules
        if (k === "device_id") continue; // native code renders its safe more-info button
        if (k === "image" && typeof v === "string") {
          out[k] = svgDataUri; // fictional floorplan instead of the real image
          continue;
        }
        out[k] = walk(v, k);
      }
      return out;
    }
    if (typeof node !== "string") return node;
    if (["service", "perform_action"].includes(key)) return node;
    return aliasEntitiesInString(node, map, counters);
  }

  const walkAll = walk(original, null);
  const view = structuredClone(walkAll.views[0]); // first (current) view only
  const stack = view.cards[0];
  const header = stack.cards[0];
  const floorplan = stack.cards[1];
  floorplan.image = MAP_URL;
  const points = { light: [[29,22],[70,19],[24,51],[72,52],[73,81],[40,78],[49,53]], socket: [[15,52],[25,61],[17,84],[35,84],[82,78]], shutter: [[24,8],[38,8],[67,8],[92,29],[92,60],[73,91],[8,34]], "air conditioner": [[54,25]] };
  const pointCounters = {};
  for (const element of floorplan.elements) {
    const kind = kindForElement(element), pointsForKind = points[kind] ?? [[50,50]];
    const n = pointCounters[kind] ?? 0; pointCounters[kind] = n + 1;
    const [left,top] = pointsForKind[n % pointsForKind.length];
    element.style = {...element.style, left: `${left}%`, top: `${top}%`};
  }
  const panel = stack.cards[2];

  view.title = "Fictional floorplan";
  view.path = "demo";
  header.title = "Fictional floorplan";

  // regenerate generic, room-mapped labels for every floorplan element
  const names = new Map(); // alias -> friendly name
  const seen = new Map();
  for (const el of floorplan.elements) {
    delete el.title;
    if (!el.entity) continue;
    const room = roomFor(el.style?.left ?? "50%", el.style?.top ?? "50%");
    const kind = kindForElement(el);
    const key = `${room}/${kind}`;
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    const label =
      kind === "shutter" || kind === "air conditioner"
        ? `${cap(room)} ${kind}`
        : `${cap(room)} ${kind} ${n}`;
    names.set(el.entity, label);
  }

  // panel: fictional room chips, safe media source names, appliance names
  if (panel.vacuum?.rooms) {
    panel.vacuum.rooms = panel.vacuum.rooms.map((r, i) => ({
      area: `demo_${ROOMS[i % ROOMS.length]}`,
      name: cap(ROOMS[i % ROOMS.length]),
    }));
  }
  if (panel.media) {
    panel.media.spotify_sources = ["Demo soundbar"];
    panel.media.spotify_soundbar_source = "Demo soundbar";
  }
  if (panel.kitchen?.dishwasher) {
    delete panel.kitchen.dishwasher.device_id;
    panel.kitchen.dishwasher.name = "Demo dishwasher";
  }
  if (panel.kitchen?.oven) {
    delete panel.kitchen.oven.device_id;
    panel.kitchen.oven.name = "Demo oven";
  }

  const config = { title: "Fictional floorplan", views: [view] };

  // collect aliases with their config roles for state synthesis
  const collect = (obj, path) => {
    if (typeof obj === "string") {
      for (const m of obj.matchAll(ENTITY_RE)) {
        if ([...map.values()].includes(m[0])) roles.push({ role: path, alias: m[0] });
      }
      return;
    }
    if (Array.isArray(obj)) return obj.forEach((v, i) => collect(v, `${path}[${i}]`));
    if (obj && typeof obj === "object") for (const [k, v] of Object.entries(obj)) collect(v, `${path}.${k}`);
  };
  collect(config, "");

  const roleBySuffix = (suffix) => roles.find((r) => r.role.endsWith(suffix))?.alias;
  const scriptAliases = {
    up: roleBySuffix(".up_script"),
    stop: roleBySuffix(".stop_script"),
    down: roleBySuffix(".down_script"),
  };

  return {
    config,
    entityMap: map,
    aliases: [...new Set(map.values())],
    roles,
    names,
    scriptAliases,
  };
}

/* ------------------------------------------------------------------ */
/* synthetic fake state store (illustrative values only)               */
/* ------------------------------------------------------------------ */

const iso = (t) => new Date(t).toISOString();

export function buildStates({ aliases, roles, names }) {
  const states = new Map(); // alias -> {s, a, lc?, lu?}
  const put = (id, s, a = {}) => {
    if (!id) return;
    states.set(id, { s: String(s), a: { friendly_name: a.friendly_name ?? id, ...a } });
  };
  const endsWith = (suffix) => roles.find((r) => r.role.endsWith(suffix))?.alias;
  const list = (frag) => roles.filter((r) => r.role.includes(frag)).map((r) => r.alias);
  const rename = (id, name) => {
    const cur = id && states.get(id);
    if (cur) cur.a.friendly_name = name;
  };

  for (const id of aliases) {
    const domain = id.split(".")[0];
    put(id, domain === "binary_sensor" ? "off" : domain === "script" ? "idle" : domain === "sensor" ? "0" : "off");
  }
  for (const [id, name] of names) rename(id, name);

  // covers: synthetic positions
  const positions = [100];
  let ci = 0;
  for (const id of [...states.keys()].filter((i) => i.startsWith("cover."))) {
    const pos = positions[ci++ % positions.length];
    put(id, pos === 0 ? "closed" : "open", {
      current_position: pos,
      device_class: "shutter",
      friendly_name: names.get(id) ?? `Demo shutter ${ci}`,
    });
  }

  // climate
  for (const id of [...states.keys()].filter((i) => i.startsWith("climate."))) {
    put(id, "off", {
      hvac_modes: ["off", "cool", "fan_only"],
      current_temperature: 21.5,
      min_temp: 7,
      max_temp: 30,
      friendly_name: names.get(id) ?? "Demo air conditioner",
    });
  }

  // panel roles
  const vac = endsWith(".vacuum.entity");
  if (vac) states.set(vac, { s: "docked", a: { friendly_name: "Demo vacuum", status: "Docked" } });
  const vacStatus = endsWith(".vacuum.status");
  if (vacStatus) states.set(vacStatus, { s: "docked", a: { friendly_name: "Demo vacuum status" } });
  const battery = endsWith(".vacuum.battery");
  if (battery)
    states.set(battery, {
      s: "84",
      a: { friendly_name: "Demo vacuum battery", device_class: "battery", state_class: "measurement", unit_of_measurement: "%" },
    });
  const progress = endsWith(".vacuum.progress");
  if (progress)
    states.set(progress, {
      s: "0",
      a: { friendly_name: "Demo vacuum progress", unit_of_measurement: "%", state_class: "measurement" },
    });
  const room = endsWith(".vacuum.room");
  if (room) states.set(room, { s: "none", a: { friendly_name: "Demo vacuum room" } });
  list(".vacuum.errors").forEach((id, i) => states.set(id, { s: "ok", a: { friendly_name: `Demo vacuum error sensor ${i + 1}` } }));
  list(".vacuum.problems").forEach((id, i) => states.set(id, { s: "off", a: { friendly_name: `Demo vacuum tank sensor ${i + 1}` } }));
  const mapAlias = endsWith(".vacuum.map");
  if (mapAlias)
    states.set(mapAlias, { s: "idle", a: { friendly_name: "Demo vacuum map", entity_picture: MAP_URL, access_token: "demo" } });
  const cleanEnd = endsWith(".vacuum.last_clean_end");
  if (cleanEnd)
    states.set(cleanEnd, {
      s: iso(Date.now() - 3 * 3600e3),
      a: { friendly_name: "Demo vacuum last cleaning end", device_class: "timestamp" },
    });

  const now = iso(Date.now());
  const mediaCommon = {
    app_name: "Google TV",
    app_id: "com.google.android.apps.tv.launcherx",
    media_title: "Demo film",
    media_duration: 5400,
    media_position: 1200,
    media_position_updated_at: now,
    volume_level: 0.3,
    is_volume_muted: false,
    supported_features: 152461,
  };
  const mp = endsWith(".media.entity");
  if (mp) states.set(mp, { s: "playing", a: { friendly_name: "Demo TV audio", ...mediaCommon } });
  const streamer = endsWith(".media.streamer");
  if (streamer)
    states.set(streamer, {
      s: "playing",
      a: { friendly_name: "Demo TV streamer", app_name: "Google TV", app_id: "com.google.android.apps.tv.launcherx" },
    });
  const soundbar = endsWith(".media.soundbar");
  if (soundbar)
    states.set(soundbar, { s: "on", a: { friendly_name: "Demo soundbar", volume_level: 0.3, is_volume_muted: false, source: "D.IN" } });
  const input = endsWith(".media.input");
  if (input) states.set(input, { s: "D.IN", a: { friendly_name: "Demo soundbar input", options: ["BT", "WIFI", "D.IN"] } });
  const timeline = endsWith(".media.timeline");
  if (timeline) states.set(timeline, { s: "playing", a: { friendly_name: "Demo media timeline", ...mediaCommon } });
  const playback = endsWith(".media.playback");
  if (playback) states.set(playback, { s: "playing", a: { friendly_name: "Demo playback status" } });
  const fcast = endsWith(".media.fcast");
  if (fcast) states.set(fcast, { s: "off", a: { friendly_name: "Demo FCast receiver" } });
  const spotify = endsWith(".media.spotify");
  if (spotify) states.set(spotify, { s: "off", a: { friendly_name: "Demo Spotify" } });
  const remote = endsWith(".media.remote");
  if (remote) states.set(remote, { s: "on", a: { friendly_name: "Demo TV remote" } });

  const dish = endsWith(".kitchen.dishwasher.entity");
  if (dish) {
    states.set(dish, { s: "run", a: { friendly_name: "Demo dishwasher" } });
    const conn = list(".dishwasher.connectivity")[0];
    if (conn) states.set(conn, { s: "on", a: { friendly_name: "Demo dishwasher connectivity" } });
    const prog = list(".dishwasher.program")[0];
    if (prog) states.set(prog, { s: "eco", a: { friendly_name: "Demo dishwasher program", options: ["eco", "intensive", "quick"] } });
    const sel = list(".dishwasher.selected_program")[0];
    if (sel) states.set(sel, { s: "eco", a: { friendly_name: "Demo dishwasher selected program", options: ["eco", "intensive", "quick"] } });
    const prog2 = list(".dishwasher.progress")[0];
    if (prog2)
      states.set(prog2, { s: "42", a: { friendly_name: "Demo dishwasher progress", unit_of_measurement: "%", state_class: "measurement" } });
    const end = list(".dishwasher.end_time")[0];
    if (end)
      states.set(end, { s: iso(Date.now() + 55 * 60e3), a: { friendly_name: "Demo dishwasher program end time", device_class: "timestamp" } });
    list(".dishwasher.problems").forEach((id, i) => states.set(id, { s: "off", a: { friendly_name: `Demo dishwasher consumable ${i + 1}` } }));
    const rs = list(".dishwasher.remote_start")[0];
    if (rs) states.set(rs, { s: "on", a: { friendly_name: "Demo dishwasher remote start" } });
    const door = list(".dishwasher.door")[0];
    if (door) states.set(door, { s: "closed", a: { friendly_name: "Demo dishwasher door" } });
  }
  const oven = endsWith(".kitchen.oven.entity");
  if (oven) {
    states.set(oven, { s: "ready", a: { friendly_name: "Demo oven" } });
    const conn = list(".oven.connectivity")[0];
    if (conn) states.set(conn, { s: "on", a: { friendly_name: "Demo oven connectivity" } });
    const program = list(".oven.program")[0];
    if (program) states.set(program, {s:"conventional",a:{friendly_name:"Demo oven program"}});
    const sel = list(".oven.selected_program")[0];
    if (sel) states.set(sel, { s: "conventional", a: { friendly_name: "Demo oven selected program", options: ["conventional", "fan"] } });
    const cur = list(".oven.current_temperature")[0];
    if (cur)
      states.set(cur, { s: "22", a: { friendly_name: "Demo oven current temperature", unit_of_measurement: "°C", state_class: "measurement" } });
    const end = list(".oven.end_time")[0];
    if (end) states.set(end, { s: iso(Date.now() + 30 * 60e3), a: { friendly_name: "Demo oven program end time", device_class: "timestamp" } });
    const rs = list(".oven.remote_start")[0];
    if (rs) states.set(rs, { s: "off", a: { friendly_name: "Demo oven remote start" } });
    const door = list(".oven.door")[0];
    if (door) states.set(door, { s: "closed", a: { friendly_name: "Demo oven door" } });
  }

  put("sensor.demo_info", "Illustrative activity · no real devices", {friendly_name:"Demo disclosure"});
  for (const r of roles.filter(r=>r.role.endsWith(".end_time"))) if(states.has(r.alias)) states.get(r.alias).s="unknown";
  return states;
}

/* ------------------------------------------------------------------ */
/* fake websocket protocol handler                                     */
/* ------------------------------------------------------------------ */

const SERVICES = {
  homeassistant: ["toggle"],
  light: ["turn_on", "turn_off", "toggle"],
  switch: ["turn_on", "turn_off", "toggle"],
  cover: ["open_cover", "close_cover", "stop_cover", "toggle"],
  vacuum: ["start", "pause", "stop", "return_to_base", "send_command", "clean_area"],
  media_player: [
    "toggle", "media_play_pause", "media_play", "media_pause", "media_previous_track",
    "media_next_track", "volume_set", "volume_mute", "media_seek",
  ],
  remote: ["send_command"],
  select: ["select_option"],
  script: ["turn_on"],
};

export function createFakeHa({ config, states, resources, scriptAliases, log }) {
  const timers = new Set();
  const counters = { wsMessages: {}, serviceCalls: [], unknownCommands: [], stateChanges: 0 };
  const entitySubs = new Map(); // subId -> ws
  const eventSubs = new Map(); // subId -> {ws, event_type}

  const nowSec = () => Date.now() / 1000;
  const snapshot = () => {
    const t = nowSec();
    const out = {};
    for (const [id, v] of states) out[id] = { s: v.s, a: v.a, c: "demo", lc: t, lu: t };
    return out;
  };
  const rawState = (v, id) => {
    if (!v) return null;
    const t = iso(Date.now());
    return {
      entity_id: id,
      state: v.s,
      attributes: v.a,
      context: { id: "demo", parent_id: null, user_id: "demo-user" },
      last_changed: t,
      last_updated: t,
    };
  };

  function emitEntityDiff(payload) {
    for (const [subId, ws] of entitySubs) ws.send(JSON.stringify({ id: subId, type: "event", event: payload }));
  }
  function emitEvent(eventType, data) {
    for (const [subId, sub] of eventSubs) {
      if (sub.event_type && sub.event_type !== eventType) continue;
      sub.ws.send(
        JSON.stringify({ id: subId, type: "event", event: { event_type: eventType, data, origin: "LOCAL", time_fired: iso(Date.now()) } })
      );
    }
  }

  function pushState(id, s, aDelta = {}) {
    const cur = states.get(id);
    if (!cur) return;
    const t = nowSec();
    const aMerged = { ...cur.a, ...aDelta };
    const changedAttrs = {};
    for (const [k, v] of Object.entries(aDelta)) if (cur.a[k] !== v) changedAttrs[k] = v;
    const stateChanged = cur.s !== String(s);
    if (!stateChanged && Object.keys(changedAttrs).length === 0) return;
    const old = rawState({ ...cur }, id);
    states.set(id, { s: String(s), a: aMerged, lc: stateChanged ? t : (cur.lc ?? t), lu: t });
    counters.stateChanges += 1;
    const plus = { s: String(s), lc: t, lu: t };
    if (Object.keys(changedAttrs).length) plus.a = changedAttrs;
    emitEntityDiff({ c: { [id]: { "+": plus } } });
    emitEvent("state_changed", { entity_id: id, old_state: old, new_state: rawState(states.get(id), id) });
  }

  const idsFrom = (data, target) => {
    let ids = data?.entity_id ?? target?.entity_id;
    if (typeof ids === "string") ids = [ids];
    return Array.isArray(ids) ? ids : [];
  };
  const byDomain = (d) => [...states.keys()].filter((i) => i.startsWith(`${d}.`));

  function moveCovers(ids, dir /* 1 open, -1 close, 0 stop */) {
    for (const id of ids) {
      const cur = states.get(id);
      if (!cur) continue;
      const pos = Number(cur.a.current_position ?? 0);
      if (dir === 0) {
        pushState(id, pos === 0 ? "closed" : "open", {});
        continue;
      }
      const target = dir > 0 ? 100 : 0;
      if (pos === target) {
        pushState(id, dir > 0 ? "open" : "closed", {});
        continue;
      }
      pushState(id, dir > 0 ? "opening" : "closing", { current_position: pos });
      const t = setTimeout(() => {
        timers.delete(t);
        const mid = states.get(id);
        if (mid && ["opening", "closing"].includes(mid.s)) pushState(id, target === 100 ? "open" : "closed", { current_position: target });
      }, 2500);
      timers.add(t);
    }
  }

  const vacuumStatus=config.views?.[0]?.cards?.[0]?.cards?.[2]?.vacuum?.status;
  function applyService(domain, service, data, target) {
    const ids = idsFrom(data, target);
    switch (`${domain}.${service}`) {
      case "switch.toggle":
      case "light.toggle":
      case "switch.turn_on":
      case "light.turn_on":
      case "switch.turn_off":
      case "light.turn_off":
        for (const id of ids) {
          const cur = states.get(id);
          if (cur) pushState(id, service === "toggle" ? (cur.s === "on" ? "off" : "on") : service === "turn_on" ? "on" : "off");
        }
        break;
      case "homeassistant.toggle":
        for (const id of ids) {
          const cur = states.get(id);
          if (!cur) continue;
          if (id.startsWith("cover.")) moveCovers([id], cur.s === "open" ? -1 : 1);
          else pushState(id, ["on", "open", "playing", "heat", "cool"].includes(cur.s) ? "off" : "on");
        }
        break;
      case "cover.open_cover":
        moveCovers(ids, 1);
        break;
      case "cover.close_cover":
        moveCovers(ids, -1);
        break;
      case "cover.stop_cover":
        moveCovers(ids, 0);
        break;
      case "cover.toggle":
        for (const id of ids) {
          const cur = states.get(id);
          if (cur) moveCovers([id], cur.s === "open" ? -1 : 1);
        }
        break;
      case "vacuum.start":
      case "vacuum.clean_area": {
        const vac = ids[0] ?? byDomain("vacuum")[0];
        if (vac) {
          const rooms = data?.cleaning_area_id;
          pushState(vac, "cleaning", { status: "Cleaning (demo)", ...(rooms ? { cleaned_area: rooms } : {}) });
          if(vacuumStatus)pushState(vacuumStatus,"cleaning");
        }
        break;
      }
      case "vacuum.pause": {
        const vac = ids[0] ?? byDomain("vacuum")[0];
        if (vac) {pushState(vac, "paused", { status: "Paused (demo)" });if(vacuumStatus)pushState(vacuumStatus,"paused");}
        break;
      }
      case "vacuum.return_to_base":
      case "vacuum.stop": {
        const vac = ids[0] ?? byDomain("vacuum")[0];
        if (vac) {
          pushState(vac, "returning", { status: "Returning (demo)" });
          if(vacuumStatus)pushState(vacuumStatus,"returning");
          const t = setTimeout(() => {
            timers.delete(t);
            pushState(vac, "docked", { status: "Docked" });
            if(vacuumStatus)pushState(vacuumStatus,"docked");
          }, 3000);
          timers.add(t);
        }
        break;
      }
      case "vacuum.send_command":
        break; // recorded only; the fake backend does not emulate device commands
      case "media_player.media_play_pause":
      case "media_player.toggle":
      case "media_player.media_play":
      case "media_player.media_pause": {
        const id = ids[0] ?? byDomain("media_player").find((i) => !["off", "idle"].includes(states.get(i)?.s));
        const cur = id && states.get(id);
        if (cur) {
          const next = service === "media_pause" ? "paused" : service === "media_play" ? "playing" : cur.s === "playing" ? "paused" : "playing";
          pushState(id, next, { media_position_updated_at: iso(Date.now()) });
        }
        break;
      }
      case "media_player.media_previous_track":
      case "media_player.media_next_track": {
        const id = ids[0] ?? byDomain("media_player")[0];
        if (id) pushState(id, states.get(id).s, { media_position: 0, media_position_updated_at: iso(Date.now()) });
        break;
      }
      case "media_player.volume_set": {
        const id = ids[0] ?? byDomain("media_player").find((i) => states.get(i)?.a.volume_level !== undefined);
        if (id) pushState(id, states.get(id).s, { volume_level: Math.max(0, Math.min(1, Number(data?.volume_level ?? 0))) });
        break;
      }
      case "media_player.volume_mute": {
        const id = ids[0] ?? byDomain("media_player").find((i) => states.get(i)?.a.volume_level !== undefined);
        if (id) pushState(id, states.get(id).s, { is_volume_muted: Boolean(data?.is_volume_muted) });
        break;
      }
      case "media_player.media_seek": {
        const id = ids[0];
        if (id) pushState(id, states.get(id).s, { media_position: Number(data?.seek_position ?? 0), media_position_updated_at: iso(Date.now()) });
        break;
      }
      case "select.select_option": {
        const id = ids[0];
        if (id && data?.option) pushState(id, data.option, {});
        break;
      }
      case "script.turn_on": {
        const id = ids[0];
        if (id && scriptAliases) {
          if (id === scriptAliases.up) moveCovers(byDomain("cover"), 1);
          if (id === scriptAliases.down) moveCovers(byDomain("cover"), -1);
          if (id === scriptAliases.stop) moveCovers(byDomain("cover"), 0);
        }
        break;
      }
      default:
        break; // recorded only
    }
  }

  const user = { id: "demo-user", name: "Demo", is_owner: true, is_admin: true, credentials: [], mfa_modules: [] };
  const systemConfig = {
    latitude: 0,
    longitude: 0,
    elevation: 0,
    unit_system: { length: "km", mass: "kg", temperature: "°C", volume: "L", pressure: "hPa", wind_speed: "km/h" },
    location_name: "Demo",
    time_zone: "UTC",
    components: [
      "frontend", "lovelace", "persistent_notification", "light", "switch", "cover", "climate", "vacuum",
      "media_player", "remote", "select", "sensor", "binary_sensor", "image", "script", "homeassistant",
    ],
    config_source: "storage",
    state: "RUNNING",
    safe_mode: false,
    external_url: null,
    internal_url: null,
    currency: "USD",
    country: "US",
    language: "en",
    onboarding: false,
    version: HA_VERSION,
  };
  const themes = { themes: {}, default_theme: "default", default_dark_theme: null };
  const userData = { default_panel: "lovelace" };
  const panels = {
    lovelace: { component_name: "lovelace", icon: "mdi:home", title: "Fictional floorplan", url_path: "lovelace", config: { mode: "storage" } },
  };

  /**
   * Attaches the fake protocol to a Playwright WebSocketRoute.
   * connectToServer is never called: no byte of this socket reaches a server.
   */
  function attach(ws) {
    ws.onMessage((message) => {
      let msg;
      try {
        msg = JSON.parse(typeof message === "string" ? message : message.toString());
      } catch {
        return;
      }
      const { id, type } = msg;
      counters.wsMessages[type] = (counters.wsMessages[type] ?? 0) + 1;
      const result = (res) => ws.send(JSON.stringify({ id, type: "result", success: true, result: res }));
      const error = (code, message2) => ws.send(JSON.stringify({ id, type: "result", success: false, error: { code, message: message2 } }));

      switch (type) {
        case "auth":
          ws.send(JSON.stringify({ type: "auth_ok", ha_version: HA_VERSION }));
          break;
        case "supported_features":
          break; // fire-and-forget client feature negotiation
        case "ping":
          ws.send(JSON.stringify({ id, type: "pong" }));
          break;
        case "auth/current_user":
          result(user);
          break;
        case "get_config":
          result(systemConfig);
          break;
        case "get_states":
          result([...states.entries()].map(([eid, v]) => rawState(v, eid)));
          break;
        case "subscribe_entities":
          entitySubs.set(id, ws);
          result(null);
          ws.send(JSON.stringify({ id, type: "event", event: { a: snapshot() } }));
          break;
        case "subscribe_events":
          eventSubs.set(id, { ws, event_type: msg.event_type ?? null });
          result(null);
          break;
        case "unsubscribe_events":
          eventSubs.delete(id);
          result(null);
          break;
        case "get_services":
          result(
            Object.fromEntries(
              Object.entries(SERVICES).map(([domain, svcs]) => [
                domain,
                Object.fromEntries(svcs.map((s) => [s, { name: s, description: s, fields: {} }])),
              ])
            )
          );
          break;
        case "get_panels":
          result(panels);
          break;
        case "frontend/get_themes":
          result(themes);
          break;
        case "frontend/get_user_data":
        case "frontend/get_system_data":
          result({ value: userData });
          break;
        case "frontend/subscribe_user_data":
          result(null);
          ws.send(JSON.stringify({ id, type: "event", event: { value: userData } }));
          break;
        case "frontend/subscribe_system_data":
          result(null);
          ws.send(JSON.stringify({ id, type: "event", event: { value: {} } }));
          break;
        case "frontend/get_translations":
          result({ resources: {} });
          break;
        case "brands/access_token":
          result({ access_token: "demo" });
          break;
        case "frontend/set_user_data":
          result(null);
          break;
        case "lovelace/config":
          result(config);
          break;
        case "lovelace/resources":
          result(resources);
          break;
        case "lovelace/config/save":
          log("BLOCKED lovelace/config/save (demo backend is read-only)");
          error("not_allowed", "Demo backend is read-only");
          break;
        case "call_service": {
          const { domain, service } = msg;
          log(`fake service ${domain}.${service}`);
          const data = msg.service_data ?? {};
          counters.serviceCalls.push({ call: `${domain}.${service}`, entities: idsFrom(data, msg.target), data, ts: Date.now() });
          applyService(domain, service, data, msg.target);
          result(msg.return_response ? { response: {} } : {});
          break;
        }
        case "config/area_registry/list":
        case "config/device_registry/list":
        case "config/floor_registry/list":
        case "config/label_registry/list":
        case "config/zone_registry/list":
          result([]);
          break;
        case "config/entity_registry/list_for_display":
          result({ entities: [], entity_categories: {} });
          break;
        case "repairs/list_issues":
          result({ issues: [] });
          break;
        case "recorder/info":
          // flat shape on purpose: frontend reads result.migration_in_progress directly
          result({ migration_in_progress: false, migration_is_live: false });
          break;
        case "lovelace/info":
          result({mode:"storage",resources:resources.length,dashboards:1});
          break;
        case "labs/subscribe":
        case "persistent_notification/subscribe":
          result(null);
          break;
        case "subscribe_bootstrap_integrations":
          result(null);
          break; // no events: nothing is starting up
        case "subscribe_trigger":
          result(null);
          break;
        case "sensor/numeric_device_classes":
          result([]);
          break;
        case "sensor/device_class_convertible_units":
          result({});
          break;
        default:
          counters.unknownCommands.push(type);
          error("unknown_command", `Demo backend does not implement ${type}`);
          break;
      }
    });
  }

  return {
    attach,
    counters,
    states,
    cleanup: () => timers.forEach(clearTimeout),
  };
}
