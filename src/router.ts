/**
 * Client-Side Router
 * Handles navigation without page reloads using History API
 */

import type { Page, RouteHandler } from './types.js';

// Route mapping
const routes: Record<string, RouteHandler> = {
    '/': () => import('./pages/home.js'),
    '/about': () => import('./pages/about.js'),
    '/work': () => import('./pages/work.js'),
    '/project-detail': () => import('./pages/project-detail.js'),
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
        
        // Initial route
        this.navigate(window.location.pathname, false);
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
        this.navigate(window.location.pathname, false);
    }

    /**
     * Navigate to a route
     */
    async navigate(path: string, pushState: boolean = true): Promise<void> {
        if (!this.container) return;

        // Normalize path (remove trailing slash except for root)
        const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
        
        // Get route handler
        const routeHandler = routes[normalizedPath];
        
        if (!routeHandler) {
            console.warn(`Route not found: ${normalizedPath}`);
            // Could show 404 page here
            return;
        }

        // Unmount current page
        if (this.currentPage && typeof this.currentPage.unmount === 'function') {
            try {
                this.currentPage.unmount();
            } catch (error) {
                console.error('Error unmounting page:', error);
            }
        }

        // Update URL (without reload)
        if (pushState) {
            window.history.pushState({}, '', normalizedPath);
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
            
            // Render template
            if (pageModule.template) {
                this.container.innerHTML = pageModule.template;
            } else {
                console.error('Page module does not export template');
                return;
            }

            // Store current page module
            this.currentPage = pageModule;

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

        } catch (error) {
            console.error('Error loading page:', error);
        }
    }
}


