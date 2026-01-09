/**
 * Page transition utilities
 * Handles page transitions with GSAP and cursor hover states
 */

import gsap from 'gsap';

/**
 * Animates the current content out (Fade Out + Slide Up)
 * Returns a promise that resolves when the animation is complete.
 * 
 * @param container - The container element whose children should be animated out
 * @returns Promise that resolves when animation completes
 */
export function animatePageOut(container: HTMLElement): Promise<void> {
    // If container is empty, resolve immediately
    if (!container.firstElementChild) return Promise.resolve();

    return new Promise((resolve) => {
        gsap.to(container.children, {
            y: -50,          // Move up
            opacity: 0,      // Fade out
            duration: 0.4,
            ease: 'power2.in',
            stagger: 0.05,   // Nice effect: elements exit slightly offset
            onComplete: () => resolve()
        });
    });
}

/**
 * Animates the new content in (Fade In + Slide Down from top)
 * Inverted direction compared to animatePageOut
 * 
 * @param container - The container element whose children should be animated in
 * @returns Promise that resolves when animation completes
 */
export function animatePageIn(container: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
        // Set start values immediately (inverted: starts from above)
        gsap.set(container.children, {
            y: -50,
            opacity: 0
        });

        // Animate to neutral position (slides down)
        gsap.to(container.children, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.05,
            clearProps: 'all', // Important: Removes inline styles after animation
            onComplete: () => resolve()
        });
    });
}

/**
 * Initialize page transitions
 * Handles cursor hover states for interactive elements
 */
export function initTransitions(): void {
    // Cursor hover state for links
    const links = document.querySelectorAll<HTMLElement>('a, button, .work-item');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        link.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}
