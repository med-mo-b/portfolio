/**
 * Theme management utilities
 * Handles theme toggling and persistence
 */

type Theme = 'light' | 'dark' | 'system';

/**
 * Get system theme preference
 * @returns 'light' or 'dark' based on system preference
 */
function getSystemTheme(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Setzt das Theme initial basierend auf LocalStorage oder System-Präferenz.
 * Diese Funktion muss VOR dem Rendern des UI aufgerufen werden.
 */
export function setInitialTheme(): void {
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (!savedTheme || savedTheme === 'system') {
        const systemTheme = getSystemTheme();
        if (systemTheme === 'dark') {
            htmlElement.setAttribute('data-theme', 'dark');
        } else {
            htmlElement.removeAttribute('data-theme');
        }
    } else {
        htmlElement.setAttribute('data-theme', savedTheme);
    }
}

/**
 * Update theme UI elements (icons, logos)
 */
function updateThemeUI(theme: 'light' | 'dark'): void {
    const iconSun = document.querySelector<SVGElement>('.icon-sun');
    const iconMoon = document.querySelector<SVGElement>('.icon-moon');
    const logoLight = document.querySelector<SVGElement>('.logo-light');
    const logoDark = document.querySelector<SVGElement>('.logo-dark');

    if (theme === 'dark') {
        if (iconMoon) iconMoon.style.display = 'none';
        if (iconSun) iconSun.style.display = 'block';
        if (logoLight) logoLight.style.display = 'none';
        if (logoDark) logoDark.style.display = 'block';
    } else {
        if (iconMoon) iconMoon.style.display = 'block';
        if (iconSun) iconSun.style.display = 'none';
        if (logoLight) logoLight.style.display = 'block';
        if (logoDark) logoDark.style.display = 'none';
    }
}

/**
 * Initialisiert die Event-Listener für den Theme-Toggle Button.
 * Muss NACH injectHeader() aufgerufen werden.
 */
export function initTheme(): void {
    const themeToggleBtn = document.querySelector<HTMLButtonElement>('.theme-toggle');
    const htmlElement = document.documentElement;

    // Initial UI Update basierend auf dem aktuellen State (gesetzt durch setInitialTheme)
    const currentThemeState = htmlElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    updateThemeUI(currentThemeState);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            let newTheme: Theme;
            
            if (!currentTheme) {
                newTheme = 'dark';
            } else if (currentTheme === 'dark') {
                newTheme = 'light';
            } else {
                newTheme = 'system';
            }
            
            if (newTheme === 'system') {
                const systemTheme = getSystemTheme();
                if (systemTheme === 'dark') {
                    htmlElement.setAttribute('data-theme', 'dark');
                } else {
                    htmlElement.removeAttribute('data-theme');
                }
                localStorage.removeItem('theme');
                updateThemeUI(systemTheme);
            } else {
                htmlElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeUI(newTheme);
            }
            
            // Trigger update for blobs if they exist
            // (MutationObserver in blobs.ts handles the attribute change automatically)
        });
    }
}
