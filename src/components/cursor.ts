/**
 * Custom cursor component
 * Handles cursor injection and animation
 */

type BlobInteractionFunction = (x: number, y: number) => void;

/**
 * Inject custom cursor elements into the page
 */
export function injectCursor(): void {
    // Disable on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    if (document.querySelector('.cursor-dot')) return; 

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    
    const cursorCircle = document.createElement('div');
    cursorCircle.className = 'cursor-circle';
    
    document.body.prepend(cursorCircle);
    document.body.prepend(cursorDot);
}

/**
 * Initialize cursor animation and interaction
 * @param interactWithBlobs - Function to call on mouse move for blob interaction
 */
export function initCursor(interactWithBlobs?: BlobInteractionFunction): void {
    // Disable on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const cursorDot = document.querySelector<HTMLElement>('.cursor-dot');
    const cursorCircle = document.querySelector<HTMLElement>('.cursor-circle');
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    if (cursorDot && cursorCircle) {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
            if (interactWithBlobs) {
                interactWithBlobs(mouseX, mouseY);
            }
        });

        function animateCursor(): void {
            if (!cursorCircle) return;
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            cursorX += dx * 0.25; 
            cursorY += dy * 0.25;
            cursorCircle.style.left = cursorX + 'px';
            cursorCircle.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Event listeners for interactive elements
        const hoverSelectors = [
            'a', 
            'button', 
            'input', 
            'textarea', 
            'label', 
            '[data-cursor-hover]',
            '.commit-node',      // Timeline nodes in about section
            '.legend-item',       // Legend items in about section
            '.event-card-close',  // Close button in event card
            '.work-item'          // Work items (if not already covered by 'a')
        ];

        // Event Delegation für Performance - closest() nutzen für Kind-Elemente
        document.addEventListener('mouseover', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Prüfen, ob das Element selbst ODER ein Elternteil interaktiv ist
            const interactiveEl = target.closest(hoverSelectors.join(','));
            if (interactiveEl) {
                document.body.classList.add('hovering');
            }
        });

        document.addEventListener('mouseout', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const interactiveEl = target.closest(hoverSelectors.join(','));
            if (interactiveEl) {
                document.body.classList.remove('hovering');
            }
        });
    }
}
