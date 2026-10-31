/**
 * Entry point. The page renders at once, without a preloader.
 */

import { initSite } from './site.js';
import { initCursor } from './components/cursor.js';
import { initBubbles, initGrain } from './components/effects.js';

initBubbles();
initSite();
initGrain();
initCursor();
