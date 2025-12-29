/**
 * Page transition utilities
 * Handles page transitions and cursor hover states
 */

/**
 * Initialize page transitions for internal links
 */
export function initTransitions(): void {
    // Cursor hover state for links
    const links = document.querySelectorAll<HTMLElement>('a, button, .work-item');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Page transition logic
    const internalLinks = document.querySelectorAll<HTMLAnchorElement>(
        'a[href^="index.html"], a[href^="work.html"], a[href^="about.html"], a[href^="project-detail.html"]'
    );
    
    internalLinks.forEach(link => {
        link.addEventListener('click', (e: MouseEvent) => {
            // Only intercept if it's a normal left click and not opening in new tab
            if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                const targetUrl = link.getAttribute('href');
                if (!targetUrl) return;

                // Add exiting class to body to trigger fade out
                document.body.classList.add('exiting');
                
                // Special case: if clicking a menu link, add exiting-menu class too
                if (link.classList.contains('menu-link')) {
                    document.body.classList.add('exiting-menu');
                }

                // Wait for animation to finish before navigating
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500); // Match the CSS transition time (0.5s)
            }
        });
    });
}




