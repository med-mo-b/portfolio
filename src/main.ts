/**
 * Main entry point
 * Initializes all components and utilities for SPA
 */

import { injectBackgroundBlobs, initBlobInteraction } from './components/blobs.js';
import { injectCursor, initCursor } from './components/cursor.js';
import { injectHeader } from './components/header.js';
import { injectMenuOverlay, initMenu } from './components/menu.js';
import { initTheme } from './lib/theme.js';
import { initLanguage } from './lib/language.js';
import { initTransitions } from './lib/transitions.js';
import { initGrained } from './lib/grained.js'; // Import Grained
import { Router } from './router.js';
import Lenis from 'lenis';

// Extend Window interface to include initLanguage and lenis
declare global {
    interface Window {
        initLanguage?: () => void;
        lenis: Lenis;
    }
}

// Make initLanguage available globally for router to call after page changes
window.initLanguage = initLanguage;

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    autoRaf: true,
});

// Optional: Debug logging (can be removed later)
// lenis.on('scroll', (e) => {
//     console.log(e);
// });

// Make Lenis available globally for router to use
window.lenis = lenis;

document.addEventListener('DOMContentLoaded', () => {
    // Inject global components (only once, since this is SPA)
    injectBackgroundBlobs();
    injectMenuOverlay();
    injectCursor();
    injectHeader();
    
    // Initialize blob interaction and cursor
    const interactWithBlobs = initBlobInteraction();
    initCursor(interactWithBlobs);
    
    // Initialize menu
    initMenu();
    
    // Initialize utilities
    initTheme();
    initLanguage();
    initTransitions();
    
    // Initialize Grained Noise
    // We use a higher density but lower opacity for a subtle film grain look
    initGrained({
        patternWidth: 200,
        patternHeight: 200,
        grainOpacity: 0.15,
        grainDensity: 1
    });
    
    // Initialize router (this will handle page-specific logic via mount/unmount)
    const router = new Router('app');
});
