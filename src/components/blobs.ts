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
        <div class="blob-wrapper blob-wrapper-5"><div class="blob blob-inner-5"></div></div>
        <div class="blob-wrapper blob-wrapper-6"><div class="blob blob-inner-6"></div></div>
        <div class="blob-wrapper blob-wrapper-7"><div class="blob blob-inner-7"></div></div>
        <div class="blob-wrapper blob-wrapper-8"><div class="blob blob-inner-8"></div></div>

    `;

    // Insert as first child of body to stay behind content
    document.body.prepend(blobsContainer);
}

/**
 * Initialize blob interaction with cursor
 * Uses caching to prevent layout thrashing during animation loop.
 * 
 * @returns Function to interact with blobs based on cursor position
 */
export function initBlobInteraction(): (x: number, y: number) => void {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        return () => {};
    }
    
    const blobWrappers = document.querySelectorAll<HTMLElement>('.blob-wrapper');
    
    // Cache positions to avoid getBoundingClientRect() in the loop (Layout Thrashing)
    let blobCache: { el: HTMLElement, x: number, y: number }[] = [];

    const updateCache = () => {
        blobCache = Array.from(blobWrappers).map(wrapper => {
            const rect = wrapper.getBoundingClientRect();
            return {
                el: wrapper,
                // Calculate center point relative to viewport
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        });
    };

    // Initial cache and update on resize
    updateCache();
    window.addEventListener('resize', () => {
        // Debounce could be added here, but simple update is fine for resize
        updateCache();
    });
    
    let animationFrameId: number | null = null;
    
    return function interactWithBlobs(x: number, y: number): void {
        if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
            blobCache.forEach((item) => {
                const distX = x - item.x;
                const distY = y - item.y;
                const distance = Math.sqrt(distX * distX + distY * distY);
                const radius = 400; 
                const maxPush = 100; 
                
                let moveX = 0, moveY = 0;
                if (distance < radius) {
                    const force = (radius - distance) / radius;
                    moveX = -(distX / distance) * force * maxPush;
                    moveY = -(distY / distance) * force * maxPush;
                }
                
                // Use translate3d for GPU acceleration
                item.el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
        });
    };
}
