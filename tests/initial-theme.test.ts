/**
 * The inline theme script in index.html runs before the first paint.
 * A saved choice wins. Without a saved choice, the system preference applies.
 * data-cfasync="false" keeps Cloudflare Rocket Loader from deferring it.
 */
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const themeScript = html.match(/<script data-cfasync="false">([\s\S]*?)<\/script>/)?.[1] ?? '';

function run(saved: string | null | Error, systemDark: boolean): string | undefined {
    const attrs: Record<string, string> = {};
    const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
    const localStorage = {
        getItem: () => {
            if (saved instanceof Error) throw saved;
            return saved;
        },
    };
    const window = { matchMedia: () => ({ matches: systemDark }) };
    new Function('document', 'localStorage', 'window', themeScript)(document, localStorage, window);
    return attrs['data-theme'];
}

describe('index.html initial theme script', () => {
    test('carries the Rocket Loader exclusion', () => {
        expect(themeScript.length).toBeGreaterThan(0);
    });
    test('a saved choice wins over the system preference', () => {
        expect(run('light', true)).toBe('light');
        expect(run('dark', false)).toBe('dark');
    });
    test('without a saved choice, the system preference applies', () => {
        expect(run(null, true)).toBe('dark');
        expect(run(null, false)).toBe('light');
    });
    test('unavailable storage does not stop the script', () => {
        expect(run(new Error('blocked'), true)).toBe('dark');
    });
});
