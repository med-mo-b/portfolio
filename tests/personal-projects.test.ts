import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { PROJECTS } from '../src/data/projects';
import { BRANCHES, TIMELINE_DATA } from '../src/data/timeline';

const personalIds = ['homelab-cm3588', 'local-assistant'];
const milestones = [
    ['local-assistant', 2026, 11, 'local-assistant'],
    ['home-automation', 2026, 9, 'homelab-cm3588'],
    ['private-photo-library', 2025, 1, 'homelab-cm3588'],
    ['encrypted-backup', 2026, 10, 'homelab-cm3588'],
    ['network-segmentation', 2026, 9, 'homelab-cm3588'],
] as const;

describe('approved personal projects', () => {
    test('IDs, translations, local media, and timeline links are complete', () => {
        expect(PROJECTS).toHaveLength(8);
        expect(new Set(PROJECTS.map(p => p.id)).size).toBe(PROJECTS.length);
        expect(PROJECTS.find(p => p.id === 'home-automation')).toBeUndefined();
        expect(PROJECTS.find(p => p.id === 'private-photo-library')).toBeUndefined();
        expect(new Set(TIMELINE_DATA.map(e => e.id)).size).toBe(TIMELINE_DATA.length);
        expect(TIMELINE_DATA.filter(e => e.branch === 'homelabbing')).toHaveLength(7);
        for (const p of PROJECTS) {
            for (const key of ['title', 'titleDe', 'description', 'descriptionDe', 'details', 'detailsDe'] as const) {
                expect(p[key].trim().length).toBeGreaterThan(0);
            }
            if (p.image?.startsWith('/')) expect(existsSync(`public${p.image}`)).toBe(true);
        }
        for (const event of TIMELINE_DATA) {
            expect(BRANCHES.some(b => b.id === event.branch)).toBe(true);
            expect(event.month).toBeGreaterThanOrEqual(1);
            expect(event.month).toBeLessThanOrEqual(12);
            if (event.projectId) expect(PROJECTS.some(p => p.id === event.projectId)).toBe(true);
        }
        const site = readFileSync('src/site.ts', 'utf8');
        const order = site.match(/const projectOrder = \[([^\]]+)\]/)![1]!;
        const displayedIds = [...order.matchAll(/'([^']+)'/g)].map(m => m[1]);
        expect(new Set(displayedIds).size).toBe(PROJECTS.length);
        for (const p of PROJECTS) expect(displayedIds).toContain(p.id);
        expect(displayedIds).toEqual([
            'local-assistant', 'homelab-cm3588', 'tedias-ahead', 'thoraxmonitor',
            'respiratory-flow-reconstruction', 'federated-cardiac-ct', 'portfolio-website', 'patent-measuring-process',
        ]);
        expect(site).not.toContain('All seven projects');
    });

    test('confirmed months link to the right projects without replacing the current role', () => {
        for (const [id, year, month, projectId] of milestones) {
            const event = TIMELINE_DATA.find(e => e.id === id);
            expect(event).toMatchObject({ year, month, projectId, branch: 'homelabbing' });
            for (const field of ['date', 'dateDe', 'title', 'titleDe', 'description', 'descriptionDe'] as const) {
                expect(event?.[field].trim().length).toBeGreaterThan(0);
            }
        }
        expect(TIMELINE_DATA.find(e => e.id === 'osapiens-aipe')?.date).toBe('Jul 2026 - Present');
        expect(TIMELINE_DATA.find(e => e.id === 'private-photo-library')?.description).toMatch(/in use by/i);
    });

    test('Personal Homelab folds in the photo library and home automation facts', () => {
        const homelab = PROJECTS.find(p => p.id === 'homelab-cm3588')!;
        expect(homelab.image).toBe('/images/personal-homelab.png');
        expect(homelab.details).toMatch(/Immich/);
        expect(homelab.details).toMatch(/in use by January 2025/i);
        expect(homelab.details).toMatch(/Home Assistant/);
        expect(homelab.details).toMatch(/September 2026/);
        expect(homelab.details).toMatch(/3-2-1/);
        expect(homelab.detailsDe).toMatch(/Immich/);
        expect(homelab.detailsDe).toMatch(/spätestens im Januar 2025/);
        expect(homelab.detailsDe).toMatch(/Home Assistant/);
        expect(homelab.detailsDe).toMatch(/September 2026/);
        expect(homelab.detailsDe).toMatch(/3-2-1/);
    });

    test('Local Agent uses the agreed names without changing its IDs', () => {
        const project = PROJECTS.find(p => p.id === 'local-assistant');
        const event = TIMELINE_DATA.find(e => e.id === 'local-assistant');
        for (const entry of [project, event]) {
            expect(entry).toMatchObject({ title: 'Local Agent', titleDe: 'Lokaler Agent' });
            expect(entry?.description).not.toMatch(/assistant/i);
        }
        expect(project?.image).toBe('/images/local-assistant.png');
        expect(event?.projectId).toBe('local-assistant');
    });

    test('personal entries contain no operational endpoints or deployment identifiers', () => {
        const projects = PROJECTS.filter(p => personalIds.includes(p.id));
        expect(projects).toHaveLength(personalIds.length);
        const events = TIMELINE_DATA.filter(e => e.branch === 'homelabbing' && e.id !== 'portfolio-website');
        const content = JSON.stringify([...projects, ...events]);
        expect(content).not.toMatch(/https?:\/\/|\b(?:\d{1,3}\.){3}\d{1,3}\b|\b\d+\.\d+\.\d+\b/);
        expect(content).not.toMatch(/\/(?:srv|mnt|home|root)\/|\bVLAN\s*\d+|\b(?:localhost|192\.168\.)/i);
        for (const p of projects) expect(p.links).toBeUndefined();
        const assistant = PROJECTS.find(p => p.id === 'local-assistant')!;
        expect(assistant.details).toMatch(/OpenRouter/);
        expect(assistant.details).toMatch(/(?:external|third.party|model providers)/i);
        expect(assistant.details).toMatch(/(?:cost|token)/i);
    });
});
