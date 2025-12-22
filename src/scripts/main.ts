/**
 * Main entry point
 * Initializes all components and utilities for SPA
 */

import { injectBackgroundBlobs, initBlobInteraction } from './components/blobs.js';
import { injectCursor, initCursor } from './components/cursor.js';
import { injectHeader } from './components/header.js';
import { injectMenuOverlay, initMenu } from './components/menu.js';
import { initTheme } from './utils/theme.js';
import { initLanguage } from './utils/language.js';
import { initTransitions } from './utils/transitions.js';
import { Router } from '../router.js';

// Extend Window interface to include initLanguage
declare global {
    interface Window {
        initLanguage?: () => void;
    }
}

// Make initLanguage available globally for router to call after page changes
window.initLanguage = initLanguage;

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
    
    // Initialize router (this will handle page-specific logic via mount/unmount)
    const router = new Router('app');
});


