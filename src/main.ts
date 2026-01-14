/**
 * Main entry point
 * Initializes all components and utilities for SPA
 */

import { injectBackgroundBlobs, initBlobInteraction } from './components/blobs.js';
import { injectCursor, initCursor } from './components/cursor.js';
import { injectHeader } from './components/header.js';
import { injectMenuOverlay, initMenu } from './components/menu.js';
import { initTheme, setInitialTheme } from './lib/theme.js';
import { initLanguage } from './lib/language.js';
import { initTransitions, animateInitialIn } from './lib/transitions.js';
import { initGrained } from './lib/grained.js'; // Import Grained
import { Preloader } from './components/preloader.js';
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

document.addEventListener('DOMContentLoaded', async () => {
    setInitialTheme(); 

    const preloader = new Preloader();
    const shouldPreload = preloader.shouldRun();

    if (shouldPreload) {
        // 1. Preloader anzeigen
        preloader.render();
        
        // 2. Assets laden (Warten...)
        await preloader.load();
    }

    // 3. App Komponenten injizieren
    injectBackgroundBlobs();
    injectMenuOverlay();
    injectCursor();
    injectHeader();
    
    const interactWithBlobs = initBlobInteraction();
    initCursor(interactWithBlobs);
    
    initMenu();
    initTheme();
    initLanguage();
    initTransitions();
    
    initGrained({
        patternWidth: 200,
        patternHeight: 200,
        grainOpacity: 0.15,
        grainDensity: 1
    });
    
    // 4. Router starten und initialen Inhalt laden
    const router = new Router('app');
    
    // Warten, bis der Router den Inhalt gerendert hat
    await router.loadInitialRoute();
    
    // 5. Koordinierte Animation: Preloader raus, Inhalt rein
    if (shouldPreload) {
        const appContainer = document.getElementById('app');
        if (appContainer && appContainer.children.length > 0) {
            // Beide Animationen parallel starten
            await Promise.all([
                preloader.animateOut(),
                animateInitialIn(appContainer)
            ]);
        }
    } else {
        // Fallback: Wenn kein Preloader (z.B. Refresh), Inhalt sofort sichtbar machen
        const appContainer = document.getElementById('app');
        if (appContainer && appContainer.children.length > 0) {
             // Schnelles Einblenden ohne Drama
             await animateInitialIn(appContainer); 
        }
    }
});
