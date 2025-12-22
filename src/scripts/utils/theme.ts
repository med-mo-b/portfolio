/**
 * Theme management utilities
 * Handles theme toggling and persistence
 */

type Theme = 'light' | 'dark';

/**
 * Initialize theme from localStorage or default to 'light'
 */
export function initTheme(): void {
    const themeToggleBtn = document.querySelector<HTMLButtonElement>('.theme-toggle');
    const htmlElement = document.documentElement;

    if (themeToggleBtn) {
        const savedTheme: Theme = (localStorage.getItem('theme') as Theme) || 'light';
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeUI(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') as Theme;
            const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    }
}

/**
 * Update theme UI elements (icons, logos)
 * @param theme - 'light' or 'dark'
 */
function updateThemeUI(theme: Theme): void {
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


