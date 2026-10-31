import { describe, test, expect, beforeEach } from 'bun:test';

// Stubs for the browser surface that language.ts uses.
const pushed: string[] = [];
const replaced: string[] = [];
const store = new Map<string, string>();
const location = { search: '', href: 'http://localhost:3000/' };
const root = { lang: '' };

function setUrl(url: string): void {
    const parsed = new URL(url);
    location.search = parsed.search;
    location.href = parsed.href;
}

(globalThis as any).document = { documentElement: root };
(globalThis as any).window = {
    location,
    history: {
        state: null,
        pushState: (_s: unknown, _t: string, url: string | URL) => (pushed.push(String(url)), setUrl(String(url))),
        replaceState: (_s: unknown, _t: string, url: string | URL) => (replaced.push(String(url)), setUrl(String(url))),
    },
};
(globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
};
const nav = { language: 'en-US', languages: ['en-US'] };
Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true });

const { detectLanguage, applyLanguage } = await import('./language.js');

beforeEach(() => {
    pushed.length = 0;
    replaced.length = 0;
    store.clear();
    setUrl('http://localhost:3000/');
    nav.languages = ['en-US'];
    root.lang = '';
});

describe('detectLanguage', () => {
    test('the URL parameter wins over the saved choice', () => {
        store.set('lang', 'en');
        setUrl('http://localhost:3000/?lang=de');
        expect(detectLanguage()).toBe('de');
    });

    test('the saved choice wins over the browser languages', () => {
        store.set('lang', 'de');
        expect(detectLanguage()).toBe('de');
    });

    test('the first supported browser language is used', () => {
        nav.languages = ['fr-FR', 'de-DE', 'en-US'];
        expect(detectLanguage()).toBe('de');
    });

    test('English is the fallback', () => {
        nav.languages = ['fr-FR'];
        expect(detectLanguage()).toBe('en');
    });
});

describe('applyLanguage', () => {
    test('German sets the URL parameter, the html lang, and replaces the history entry', () => {
        applyLanguage('de', true);
        expect(root.lang).toBe('de');
        expect(store.get('lang')).toBe('de');
        expect(replaced).toEqual(['http://localhost:3000/?lang=de']);
        expect(pushed).toEqual([]);
    });

    test('English removes only the lang parameter and keeps the hash', () => {
        setUrl('http://localhost:3000/?x=1&lang=de#work');
        applyLanguage('en', true);
        expect(location.href).toBe('http://localhost:3000/?x=1#work');
        expect(pushed).toEqual([]);
    });

    test('a detected language is not saved', () => {
        applyLanguage('de', false);
        expect(store.has('lang')).toBe(false);
    });
});
