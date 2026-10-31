/**
 * Content checks for role/timeline data.
 * Plain Node (no bun needed): node scripts/content-check.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const timeline = read('src/data/timeline.ts');
const site = read('src/site.ts');
const indexHtml = read('index.html');

// New current role: single open-ended 'main' event, and it is osapiens
const presentCount = (timeline.match(/- Present'/g) || []).length;
assert.equal(presentCount, 1, 'exactly one "Present" date expected');
const heuteCount = (timeline.match(/- Heute'/g) || []).length;
assert.equal(heuteCount, 1, 'exactly one "Heute" date expected');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?date: 'Jul 2026 - Present'/.test(timeline), 'osapiens entry is the open-ended one');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?branch: 'main'/.test(timeline), 'osapiens entry on professional branch');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?title: 'AI Platform Engineer'/.test(timeline), 'osapiens title');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?titleDe: 'AI Platform Engineer'/.test(timeline), 'osapiens titleDe');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?company: 'osapiens'/.test(timeline), 'osapiens employer');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?year: 2026,\s*month: 7,/.test(timeline), 'osapiens starts Jul 2026');
assert.ok(/id: 'osapiens-aipe'[\s\S]*?descriptionDe: '[^']+'/.test(timeline), 'osapiens has German description');
assert.ok(!/\d+ (yrs|mos|years|months)/.test(timeline), 'no relative duration labels');

// Prior role closed at Jun 2026, description preserved
assert.ok(/id: 'fipa-re',\s*date: 'Feb 2024 - Jun 2026',\s*dateDe: 'Feb 2024 - Jun 2026',/.test(timeline), 'fipa-re ends Jun 2026');
assert.ok(timeline.includes("'I led interdisciplinary teams and got third-party funding (BMBF, EU, and industry).'"), 'fipa-re highlights from LinkedIn');

// EN/DE pairing complete for every event
const count = (s, re) => (s.match(re) || []).length;
assert.ok(count(timeline, /\bdate: '/g) === count(timeline, /\bdateDe: '/g), 'every event has dateDe');
assert.ok(count(timeline, /\btitle: '/g) === count(timeline, /\btitleDe: '/g), 'every event has titleDe');
assert.ok(count(timeline, /\bdescription: '/g) === count(timeline, /\bdescriptionDe: '/g), 'every event has descriptionDe');

// Sort order: osapiens (2026-07) is the newest event
const yearMonth = [...timeline.matchAll(/year: (\d+),\s*month: (\d+),/g)].map(m => Number(m[1]) * 12 + Number(m[2]));
assert.equal(Math.max(...yearMonth), 2026 * 12 + 7, 'osapiens is the newest event');

// About page bio: current role in EN and DE, no stale current-role wording
assert.ok(site.includes('AI Platform Engineer at osapiens'), 'about EN bio');
assert.ok(site.includes('AI Platform Engineer bei osapiens'), 'about DE bio');
assert.ok(!site.includes('Research Engineer at Fraunhofer'), 'about EN bio has no stale role');
assert.ok(!site.includes('Forschungsingenieur bei Fraunhofer'), 'about DE bio has no stale role');

// Route title and metadata
assert.ok(site.includes("'Moritz Bednorz | AI Platform Engineer & Tech Enthusiast'"), 'site title');
assert.ok(indexHtml.includes('<title>Moritz Bednorz | AI Platform Engineer & Tech Enthusiast</title>'), 'index title');
assert.ok(indexHtml.includes('AI Platform Engineer at osapiens, with a background in Medical Informatics and healthcare research.'), 'index meta description');
assert.ok(timeline.includes('I shorten time-to-market with safe and effective AI use in development workflows.'), 'safe AI responsibility');
assert.ok(timeline.includes('Ich verkürze die Time-to-Market durch sicheren und wirksamen KI-Einsatz in Entwicklungsabläufen.'), 'safe AI responsibility in German');
assert.ok(timeline.includes('Full-time, hybrid role in Mannheim, Baden-Württemberg, Germany.'), 'employment and location details');
assert.ok(indexHtml.includes('Moritz Bednorz, AI Platform Engineer, osapiens,'), 'index meta keywords');
assert.ok(!indexHtml.includes('Fraunhofer'), 'index.html has no stale employer');

console.log('content-check: all checks passed');
