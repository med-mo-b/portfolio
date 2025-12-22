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
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            cursorX += dx * 0.25; 
            cursorY += dy * 0.25;
            cursorCircle.style.left = cursorX + 'px';
            cursorCircle.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }
}


