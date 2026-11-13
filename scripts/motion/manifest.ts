import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { PROJECTS } from '../../src/data/projects.ts';

const root = join(import.meta.dir, '../../public/motion');
const order = ['local-assistant', 'homelab-cm3588', 'tedias-ahead', 'thoraxmonitor', 'respiratory-flow-reconstruction', 'federated-cardiac-ct', 'portfolio-website', 'patent-measuring-process'];
const parts = ['static', 'ui'].flatMap(name => {
    const value = JSON.parse(readFileSync(join(root, `${name}-manifest.json`), 'utf8'));
    const entries = Array.isArray(value) ? value : value.entries;
    assert.ok(Array.isArray(entries), `Invalid ${name} manifest`);
    return entries;
});
assert.deepEqual(parts.map(item => item.id).sort(), [...order].sort(), 'Each project needs one loop.');
// Later render stages supersede the original static studies.
for (const name of ['flow-v2', 'breathing-v2', 'monte-carlo']) {
    const file = join(root, `${name}-manifest.json`);
    if (!existsSync(file)) continue;
    const value = JSON.parse(readFileSync(file, 'utf8'));
    const overrides = Array.isArray(value) ? value : value.entries;
    assert.ok(Array.isArray(overrides), `Invalid ${name} manifest`);
    for (const item of overrides) {
        const index = parts.findIndex(entry => entry.id === item.id);
        assert.ok(index >= 0, `${name}: unknown project ${item.id}`);
        parts[index] = { ...parts[index], ...item };
    }
}
const entries = [];
for (const id of order) {
    const item = parts.find(entry => entry.id === id);
    const project = PROJECTS.find(project => project.id === id)!;
    assert.ok(['real-ui', 'illustrative'].includes(item.kind));
    assert.ok(typeof item.description === 'string' && item.description.length > 0);
    const duration = item.duration ?? 4;
    assert.ok(Number.isFinite(duration) && duration >= 4 && duration <= 60, `${id}: invalid duration`);
    if (!['portfolio-website', 'homelab-cm3588', 'respiratory-flow-reconstruction'].includes(id)) assert.equal(duration, 4, `${id}: expected a four-second study`);
    const files = { mp4: `${id}.mp4`, gif: `${id}.gif`, poster: `${id}.jpg` };
    const gif = await sharp(join(root, files.gif), { animated: true }).metadata();
    assert.ok(gif.pages! > 1, `${id}: no GIF motion`);
    assert.equal(gif.delay!.reduce((total, delay) => total + delay, 0), duration * 1000, `${id}: wrong duration`);
    assert.equal(gif.loop, 0);
    assert.equal(gif.width, 792);
    assert.equal(gif.pageHeight, 496);
    assert.equal(readFileSync(join(root, files.mp4)).subarray(4, 8).toString(), 'ftyp');
    entries.push({ id, title: project.title, kind: item.kind, description: item.description, duration, files,
        bytes: { mp4: statSync(join(root, files.mp4)).size, gif: statSync(join(root, files.gif)).size },
        sources: item.sources ?? item.source });
}
writeFileSync(join(root, 'manifest.json'), JSON.stringify({ entries }, null, 2) + '\n');
console.log(`Checked ${entries.length} looping GIFs and wrote the preview manifest.`);
