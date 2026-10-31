/**
 * Language choice: English or German.
 * Priority: ?lang= in the URL, then the saved choice, then the browser languages, then English.
 * Only an explicit choice is saved. The URL always shows the current language (?lang=de),
 * so a link can be shared. A change replaces the history entry and never adds one.
 */

export type Language = 'en' | 'de';

const isLanguage = (value: unknown): value is Language => value === 'en' || value === 'de';

function savedLanguage(): string | null {
    try {
        return localStorage.getItem('lang');
    } catch {
        return null;
    }
}

export function detectLanguage(): Language {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLanguage(fromUrl)) return fromUrl;
    const saved = savedLanguage();
    if (isLanguage(saved)) return saved;
    const browser = (navigator.languages ?? [navigator.language]).map(l => l.slice(0, 2)).find(isLanguage);
    return browser ?? 'en';
}

export function applyLanguage(lang: Language, save: boolean): void {
    document.documentElement.lang = lang;
    if (save) {
        try {
            localStorage.setItem('lang', lang);
        } catch {
            // Storage unavailable: the URL still keeps the choice.
        }
    }
    const url = new URL(window.location.href);
    if (lang === 'de') url.searchParams.set('lang', 'de');
    else url.searchParams.delete('lang');
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}
