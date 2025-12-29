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
 * Get current effective theme (manual or system)
 * @param htmlElement - The HTML element to check
 * @returns 'light' or 'dark'
 */
function getCurrentTheme(htmlElement: HTMLElement): 'light' | 'dark' {
    const manualTheme = htmlElement.getAttribute('data-theme');
    return (manualTheme as 'light' | 'dark') || getSystemTheme();
}

/**
 * Initialize theme from localStorage or use system preference
 */
export function initTheme(): void {
    const themeToggleBtn = document.querySelector<HTMLButtonElement>('.theme-toggle');
    const htmlElement = document.documentElement;

    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        
        // Wenn kein Theme gespeichert, nutze System-Präferenz
        if (!savedTheme || savedTheme === 'system') {
            const systemTheme = getSystemTheme();
            // Bei System-Dark setze data-theme="dark" als State-Marker für UI-Konsistenz
            // Bei System-Light entferne data-theme (nutze :root mit light-dark())
            if (systemTheme === 'dark') {
                htmlElement.setAttribute('data-theme', 'dark');
            } else {
                htmlElement.removeAttribute('data-theme');
            }
            updateThemeUI(systemTheme);
        } else {
            htmlElement.setAttribute('data-theme', savedTheme);
            updateThemeUI(savedTheme);
        }

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            let newTheme: Theme;
            
            if (!currentTheme) {
                // Aktuell System-Präferenz → wechsle zu manuellem Dark
                newTheme = 'dark';
            } else if (currentTheme === 'dark') {
                // Dark → Light
                newTheme = 'light';
            } else {
                // Light → System-Präferenz (entferne data-theme)
                newTheme = 'system';
            }
            
            if (newTheme === 'system') {
                const systemTheme = getSystemTheme();
                // Bei System-Dark setze data-theme="dark" als State-Marker
                // Bei System-Light entferne data-theme (nutze :root mit light-dark())
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
        });
    }
}

/**
 * Update theme UI elements (icons, logos)
 * @param theme - 'light' or 'dark'
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




