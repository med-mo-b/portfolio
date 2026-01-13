/**
 * Custom cursor component
 * Handles cursor injection and animation using Delta Time for frame-rate independence.
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
 * Uses requestAnimationFrame with Delta Time to ensure consistent speed across 60Hz/144Hz monitors.
 * 
 * @param interactWithBlobs - Function to call on mouse move for blob interaction
 */
export function initCursor(interactWithBlobs?: BlobInteractionFunction): void {
    // Disable on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const cursorDot = document.querySelector<HTMLElement>('.cursor-dot');
    const cursorCircle = document.querySelector<HTMLElement>('.cursor-circle');
    
    // State variables
    // Start off-screen to avoid initial jump
    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    
    // Scale state for smooth hover transition
    let currentScale = 1;
    let targetScale = 1;

    // Time tracking for Delta Time
    let lastTime = performance.now();
    
    // Configuration
    const DAMPING = 0.25; // 0 to 1 (higher = faster/tighter)
    const SCALE_DAMPING = 0.15; // Speed of scale transition

    if (cursorDot && cursorCircle) {
        // Mouse move updates target position
        document.addEventListener('mousemove', (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Dot follows instantly using GPU transform
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            
            if (interactWithBlobs) {
                interactWithBlobs(mouseX, mouseY);
            }
        });

        // Animation loop
        const animateCursor = (time: number): void => {
            // Calculate Delta Time (seconds)
            // Cap at 0.1s to prevent huge jumps if tab was inactive
            const dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            // Frame-rate independent interpolation factor
            // Formula: 1 - (1 - damping) ^ (dt * targetFPS)
            // This ensures the visual speed is the same on 60Hz vs 144Hz
            const adjust = 1 - Math.pow(1 - DAMPING, dt * 60);
            const scaleAdjust = 1 - Math.pow(1 - SCALE_DAMPING, dt * 60);

            // Interpolate Position
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            cursorX += dx * adjust; 
            cursorY += dy * adjust;

            // Determine Target Scale based on hover state
            const isHovering = document.body.classList.contains('hovering');
            targetScale = isHovering ? 2.5 : 1; // Slightly larger for better visibility

            // Interpolate Scale
            currentScale += (targetScale - currentScale) * scaleAdjust;

            // Apply Transform (GPU accelerated)
            // Combine translation and scale in one property to avoid CSS conflicts
            cursorCircle.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%) scale(${currentScale})`;
            
            requestAnimationFrame(animateCursor);
        };
        
        requestAnimationFrame(animateCursor);

        // Event listeners for interactive elements to toggle 'hovering' class
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
            '.work-item'          // Work items
        ];

        document.addEventListener('mouseover', (e: MouseEvent) => {
            const target = e.target as HTMLElement;
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
