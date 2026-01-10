/**
 * Language management utilities
 * Handles language switching and persistence
 */

type Language = 'en' | 'de';

let eventDelegationSetup = false;

/**
 * Initialize language from URL params, localStorage, or system language
 * Sets up event delegation for language switch button (only once)
 * 
 * Priority order:
 * 1. URL parameter (?lang=de)
 * 2. LocalStorage (previously saved preference)
 * 3. System language (navigator.language)
 * 4. Default 'en'
 */
export function initLanguage(): void {
    const translatableElements = document.querySelectorAll<HTMLElement>('[data-text-en]');

    const supportedLanguages: Language[] = ['en', 'de'];
    
    // Priority 1: Check URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language | null;
    
    // Priority 2: Check localStorage
    const savedLang = localStorage.getItem('lang') as Language | null;
    
    // Priority 3: Detect system language (extract first two characters, e.g., "de" from "de-DE")
    const systemLang = navigator.language.split('-')[0] as Language;
    
    // Determine target language based on priority
    let targetLang: Language = 'en'; // Priority 4: Absolute fallback
    
    if (urlLang && supportedLanguages.includes(urlLang)) {
        targetLang = urlLang;
    } else if (savedLang && supportedLanguages.includes(savedLang)) {
        targetLang = savedLang;
    } else if (supportedLanguages.includes(systemLang)) {
        targetLang = systemLang; // Automatically use system language if supported
    }

    setLanguage(targetLang, false); // false = don't push state on init, just replace

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
