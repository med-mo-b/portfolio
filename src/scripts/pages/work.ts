/**
 * Work page specific logic
 * Handles image preview functionality
 */

import { createLightbox } from '../components/lightbox.js';

/**
 * Handle image load errors with fallback
 */
function handleImageError(img: HTMLImageElement, fallbackSrc: string = ''): void {
    console.warn(`Failed to load image: ${img.src}`);
    if (fallbackSrc) {
        img.src = fallbackSrc;
    } else {
        // Use placeholder if no fallback provided
        img.src = 'https://placehold.co/800x600/2a2a2a/FFF?text=Image+Not+Found';
    }
}

/**
 * Initialize work page image preview functionality
 */
export function initWorkPage(): void {
    const previewImg = document.getElementById('preview-img') as HTMLImageElement | null;
    const workItems = document.querySelectorAll<HTMLAnchorElement>('.work-item a');

    // Add error handler to preview image
    if (previewImg) {
        previewImg.addEventListener('error', () => {
            handleImageError(previewImg);
        });
    }

    if (workItems.length > 0) {
        workItems.forEach(item => {
            // Desktop Hover
            item.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768 && previewImg) { // Check for desktop
                    const newSrc = item.getAttribute('data-img');
                    if (newSrc) {
                        // Verify data-img attribute exists and is not empty
                        if (!newSrc || newSrc.trim() === '') {
                            console.warn('Empty or missing data-img attribute on work item');
                            return;
                        }
                        previewImg.src = newSrc;
                        previewImg.style.opacity = '1';
                        previewImg.style.transform = 'scale(1.05)';
                    }
                }
            });
            item.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768 && previewImg) { // Check for desktop
                    previewImg.style.opacity = '0';
                    previewImg.style.transform = 'scale(1)';
                }
            });

            // Mobile Click Handling (Toggle Preview)
            item.addEventListener('click', (e: MouseEvent) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault(); // Prevent navigation on mobile too if needed, though disabled-link handles it mostly
                    
                    // Find or Create Mobile Preview Container for THIS item
                    // Check if preview already exists
                    let mobilePreview = item.parentElement?.querySelector<HTMLDivElement>('.mobile-preview');
                    
                    if (!mobilePreview && item.parentElement) {
                        // Create it
                        mobilePreview = document.createElement('div');
                        mobilePreview.className = 'mobile-preview';
                        const img = document.createElement('img');
                        const imgSrc = item.getAttribute('data-img');
                        if (imgSrc && imgSrc.trim() !== '') {
                            img.src = imgSrc;
                            // Add error handler for mobile images
                            img.addEventListener('error', () => {
                                handleImageError(img);
                            });
                        } else {
                            console.warn('Empty or missing data-img attribute on work item');
                        }
                        mobilePreview.appendChild(img);
                        item.parentElement.appendChild(mobilePreview);
                    }

                    if (mobilePreview) {
                        // Toggle Visibility
                        if (mobilePreview.classList.contains('active')) {
                            mobilePreview.classList.remove('active');
                        } else {
                            // Close others? Optional. Let's close others for cleaner UI.
                            document.querySelectorAll('.mobile-preview').forEach(el => el.classList.remove('active'));
                            mobilePreview.classList.add('active');
                            
                            // Add click listener to the image for Lightbox (Mobile)
                            const mobileImg = mobilePreview.querySelector<HTMLImageElement>('img');
                            if (mobileImg) {
                                 // Remove old listeners to prevent duplicates if toggled multiple times (though recreating element avoids this, but good practice)
                                 const newImg = mobileImg.cloneNode(true) as HTMLImageElement;
                                 mobileImg.parentNode?.replaceChild(newImg, mobileImg);
                                 
                                 newImg.addEventListener('click', (ev: MouseEvent) => {
                                     ev.stopPropagation(); // Prevent bubbling to item click
                                     const link = item.getAttribute('data-link');
                                     createLightbox(newImg.src, link);
                                 });
                            }
                        }
                    }
                } else {
                    // Desktop Click Handling: Open Link if available
                     const link = item.getAttribute('data-link');
                     if (link) {
                         window.open(link, '_blank');
                     }
                }
            });
        });
    }

    // Desktop Preview Image Click - Open Lightbox
    if (previewImg) {
        previewImg.addEventListener('click', () => {
            // Only activate if visible and has valid source
            if (previewImg.style.opacity !== '0' && previewImg.src) {
                const activeLink = document.querySelector<HTMLAnchorElement>('.work-item a:hover')?.getAttribute('data-link');
                createLightbox(previewImg.src, activeLink || null);
            }
        });
    }
}


