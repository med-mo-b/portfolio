/**
 * Client-Side Router
 * Handles navigation without page reloads using History API
 */

import type { Page, RouteHandler } from './types.js';
import { animatePageOut, animatePageIn } from './lib/transitions.js';

// Route mapping
const routes: Record<string, RouteHandler> = {
    '/': () => import('./pages/home.js'),
    '/about': () => import('./pages/about.js'),
    '/work': () => import('./pages/work.js'),
};

// Page title mapping
const pageTitles: Record<string, string> = {
    '/': 'Moritz Bednorz | Research Engineer & Tech Enthusiast',
    '/about': 'About Me | Moritz Bednorz',
    '/work': 'Work & Projects | Moritz Bednorz',
    '/project-detail': 'Project Details | Moritz Bednorz',
};

// Body class mapping
const pageClasses: Record<string, string> = {
    '/': 'page-home',
    '/about': 'page-about',
    '/work': 'page-work',
    '/project-detail': 'page-detail',
};

/**
 * Router class
 */
export class Router {
    private container: HTMLElement | null;
    private currentPage: Page | null = null;
    private isFirstLoad: boolean = true; // Flag für ersten Load

    constructor(containerId: string) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }
        this.init();
    }

    /**
     * Initialize router
     */
    private init(): void {
        // Event delegation for link clicks
        document.addEventListener('click', this.handleLinkClick.bind(this));
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    /**
     * Load initial route (called from main.ts after setup)
     * Returns a promise that resolves when the initial page is loaded
     */
    public async loadInitialRoute(): Promise<void> {
        // Initial route - WICHTIG: skipAnimation = true für den ersten Load
        // Wir animieren das manuell in main.ts
        // Preserve query string from initial URL
        const initialPath = window.location.pathname + window.location.search;
        await this.navigate(initialPath, false, true);
    }

    /**
     * Handle link clicks
     */
    private handleLinkClick(e: MouseEvent): void {
        const link = (e.target as HTMLElement).closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        
        // Check if it's an internal link
        if (href && href.startsWith('/') && !href.startsWith('//') && !href.startsWith('http')) {
            // Skip if it's a disabled link (like work items)
            if (link.classList.contains('disabled-link')) {
                return;
            }
            
            e.preventDefault();
            this.navigate(href);
        }
    }

    /**
     * Handle browser navigation (back/forward)
     */
    private handlePopState(_e: PopStateEvent): void {
        // Preserve query string when handling browser navigation
        const currentPath = window.location.pathname + window.location.search;
        this.navigate(currentPath, false);
    }

    /**
     * Navigate to a route
     */
    async navigate(path: string, pushState: boolean = true, skipAnimation: boolean = false): Promise<void> {
        if (!this.container) return;

        // Parse path and query string separately
        // Handle both absolute paths (/work?project=...) and relative paths
        let pathname: string;
        let search: string;
        
        if (path.startsWith('/')) {
            // Absolute path - parse with current origin
            const url = new URL(path, window.location.origin);
            pathname = url.pathname;
            search = url.search;
        } else {
            // Relative path - shouldn't happen for internal links, but handle it
            const url = new URL(path, window.location.href);
            pathname = url.pathname;
            search = url.search;
        }
        
        // Normalize pathname (remove trailing slash except for root)
        const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
        
        // Get route handler (use only pathname for route lookup)
        const routeHandler = routes[normalizedPath];
        
        if (!routeHandler) {
            console.warn(`Route not found: ${normalizedPath}`);
            // Could show 404 page here
            return;
        }

        // 1. EXIT ANIMATION (Nur wenn nicht erster Load)
        if (this.currentPage && !skipAnimation) {
            await animatePageOut(this.container);
        }

        // Unmount current page
        if (this.currentPage && typeof this.currentPage.unmount === 'function') {
            try {
                this.currentPage.unmount();
            } catch (error) {
                console.error('Error unmounting page:', error);
            }
        }

        // Update URL (without reload) - preserve query string
        if (pushState) {
            const fullPath = normalizedPath + search;
            window.history.pushState({}, '', fullPath);
        }

        // Update body class
        const bodyClass = pageClasses[normalizedPath] || 'page-home';
        document.body.className = bodyClass;

        // Update page title
        const title = pageTitles[normalizedPath] || pageTitles['/'];
        document.title = title;

        // Load and render new page
        try {
            const pageModule = await routeHandler();
            
            // 2. CONTENT SWAP
            // Render template
            if (pageModule.template) {
                this.container.innerHTML = pageModule.template;
                
                // Wenn wir Animation skippen (erster Load), setzen wir Opacity auf 0,
                // damit main.ts die Kontrolle übernehmen kann.
                // Wenn normale Navigation, setzt animatePageIn das gleich.
                if (skipAnimation) {
                    const children = this.container.children;
                    for (let i = 0; i < children.length; i++) {
                        (children[i] as HTMLElement).style.opacity = '0';
                    }
                } else {
                    // FOUC-Vermeidung: Sofort verstecken, damit kein Frame "blitzt"
                    // bevor GSAP greift
                    const children = this.container.children;
                    for (let i = 0; i < children.length; i++) {
                        (children[i] as HTMLElement).style.opacity = '0';
                    }
                }
            } else {
                console.error('Page module does not export template');
                return;
            }

            // Store current page module
            this.currentPage = pageModule;

            // 3. SCROLL
            // Scroll immediately after swap, before enter animation
            // Prevents user from seeing new page at old scroll level
            // Use Lenis for smooth scrolling (immediate: true to prevent animation during page transition)
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            } else {
                // Fallback to native scroll if Lenis is not available
                window.scrollTo(0, 0);
            }

            // Mount new page - ensure DOM is ready
            if (typeof pageModule.mount === 'function') {
                // Use requestAnimationFrame to ensure DOM is fully updated
                requestAnimationFrame(() => {
                    try {
                        pageModule.mount?.();
                    } catch (error) {
                        console.error('Error mounting page:', error);
                    }
                });
            }

            // Re-initialize language utility (for data-text attributes)
            // Use requestAnimationFrame to ensure DOM is ready
            if (window.initLanguage) {
                requestAnimationFrame(() => {
                    window.initLanguage?.();
                });
            }

            // 4. ENTER ANIMATION
            // Nur ausführen, wenn NICHT geskippt werden soll
            if (!skipAnimation) {
                requestAnimationFrame(() => {
                    if (this.container) {
                        animatePageIn(this.container);
                    }
                });
            }
            
            // Flag zurücksetzen
            this.isFirstLoad = false;

        } catch (error) {
            console.error('Error loading page:', error);
        }
    }
}
