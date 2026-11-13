#!/usr/bin/env node
// Fixed-camera content animations, not the earlier camera-only studies.
// Usage: node scripts/motion/static.cjs [--only <project-id>]
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const jobs = [
  { script: 'flow.cjs', manifest: 'flow-v2-manifest.json', ids: ['tedias-ahead', 'federated-cardiac-ct'] },
  { script: 'breathing.cjs', manifest: 'breathing-v2-manifest.json', ids: ['thoraxmonitor', 'respiratory-flow-reconstruction'] },
  { script: 'patent.cjs', manifest: 'patent-v2-manifest.json', ids: ['patent-measuring-process'] },
];
const args = process.argv.slice(2);
assert.ok(!args.length || (args.length === 2 && args[0] === '--only'), 'Use --only <project-id>, or no arguments.');
const only = args[1];
assert.ok(!only || jobs.some(job => job.ids.includes(only)), 'Unknown illustrative project id.');
const out = path.resolve(__dirname, '../../public/motion');
const file = path.join(out, 'static-manifest.json');
const entries = new Map((fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : []).map(entry => [entry.id, entry]));
for (const job of jobs) {
  if (only && !job.ids.includes(only)) continue;
  execFileSync(process.execPath, [path.join(__dirname, job.script), ...(only && job.script !== 'patent.cjs' ? ['--only', only] : [])], { stdio: 'inherit' });
  for (const entry of JSON.parse(fs.readFileSync(path.join(out, job.manifest)))) entries.set(entry.id, entry);
}
fs.writeFileSync(file, JSON.stringify([...entries.values()], null, 2) + '\n');
