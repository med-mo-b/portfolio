/**
 * Language management utilities
 * Handles language switching and persistence
 */

type Language = 'en' | 'de';

let eventDelegationSetup = false;

/**
 * Initialize language from URL params or localStorage
 * Sets up event delegation for language switch button (only once)
 */
export function initLanguage(): void {
    const translatableElements = document.querySelectorAll<HTMLElement>('[data-text-en]');

    // Check URL query param first, then localStorage, default to 'en'
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    let savedLang: Language = (localStorage.getItem('lang') as Language) || 'en';
    
    // If URL has ?lang=de, allow override (or just stick to saved if navigating internally)
    // Usually URL param overrides storage for sharing purposes
    if (urlLang === 'de') {
        savedLang = 'de';
    }

    setLanguage(savedLang, false); // false = don't push state on init, just replace

    // Event delegation: Set up once at app initialization
    // This eliminates the need to re-initialize listeners after route changes
    if (!eventDelegationSetup) {
        document.addEventListener('click', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.lang-switch')) {
                const currentLang: Language = (localStorage.getItem('lang') as Language) || 'en';
                const newLang: Language = currentLang === 'en' ? 'de' : 'en';
                setLanguage(newLang, true);
            }
        });
        eventDelegationSetup = true;
    }
}

/**
 * Set the current language and update UI
 * @param lang - 'en' or 'de'
 * @param pushState - Whether to push state to history
 */
function setLanguage(lang: Language, pushState: boolean = true): void {
    const langSwitchBtn = document.querySelector<HTMLButtonElement>('.lang-switch');
    const translatableElements = document.querySelectorAll<HTMLElement>('[data-text-en]');

    // Update Text Content
    translatableElements.forEach(el => {
        const text = el.getAttribute(`data-text-${lang}`);
        if (text) el.textContent = text;
    });

    // Update Button Text (Show TARGET language)
    if (langSwitchBtn) {
        langSwitchBtn.textContent = lang === 'en' ? 'DE' : 'EN';
    }

    // Update LocalStorage
    localStorage.setItem('lang', lang);

    // Update URL State (Use Query Params for robustness on static sites)
    // Always replace state to ensure ?lang=de persists or is removed
    const url = new URL(window.location.href);
    if (lang === 'de') {
        url.searchParams.set('lang', 'de');
    } else {
        url.searchParams.delete('lang');
    }
    
    // Use pushState if it's a user action (click), replaceState if init
    if (pushState) {
        window.history.pushState({}, '', url);
    } else {
        window.history.replaceState({}, '', url);
    }
    
    // Clean up old /de path if present (migration)
    if (window.location.pathname.includes('/de')) {
         const cleanPath = window.location.pathname.replace('/de', '').replace('//', '/');
         const cleanUrl = new URL(window.location.href);
         cleanUrl.pathname = cleanPath;
         if (lang === 'de') cleanUrl.searchParams.set('lang', 'de');
         window.history.replaceState({}, '', cleanUrl);
    }
}

