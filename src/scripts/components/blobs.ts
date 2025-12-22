/**
 * Background blobs component
 * Handles blob injection and interaction with cursor
 */

/**
 * Inject background blobs into the page
 */
export function injectBackgroundBlobs(): void {
    if (document.querySelector('.background-blobs')) return; // Prevent duplicate injection

    const blobsContainer = document.createElement('div');
    blobsContainer.className = 'background-blobs';
    
    blobsContainer.innerHTML = `
        <div class="blob-wrapper blob-wrapper-1"><div class="blob blob-inner-1"></div></div>
        <div class="blob-wrapper blob-wrapper-2"><div class="blob blob-inner-2"></div></div>
        <div class="blob-wrapper blob-wrapper-3"><div class="blob blob-inner-3"></div></div>
        <div class="blob-wrapper blob-wrapper-4"><div class="blob blob-inner-4"></div></div>
    `;

    // Insert as first child of body to stay behind content
    document.body.prepend(blobsContainer);
}

/**
 * Initialize blob interaction with cursor
 * @returns Function to interact with blobs based on cursor position
 */
export function initBlobInteraction(): (x: number, y: number) => void {
    const blobWrappers = document.querySelectorAll<HTMLElement>('.blob-wrapper');
    
    return function interactWithBlobs(x: number, y: number): void {
        blobWrappers.forEach((wrapper) => {
            const rect = wrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distX = x - centerX;
            const distY = y - centerY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            const radius = 400; 
            const maxPush = 100; 
            
            let moveX = 0, moveY = 0;
            if (distance < radius) {
                const force = (radius - distance) / radius;
                moveX = -(distX / distance) * force * maxPush;
                moveY = -(distY / distance) * force * maxPush;
            }
            wrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    };
}


