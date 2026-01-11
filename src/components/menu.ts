/**
 * Menu overlay component
 * Handles menu injection and toggle logic
 */

import { initPhysics, stopPhysics } from './physicsMenu.js';

/**
 * Inject menu overlay into the page
 */
export function injectMenuOverlay(): void {
    if (document.querySelector('.menu-overlay')) return; // Prevent duplicate injection

    const menuContainer = document.createElement('div');
    menuContainer.className = 'menu-overlay';

    menuContainer.innerHTML = `
        <nav class="menu-nav">
            <ul>
                <li><a href="/" class="menu-link" data-text-en="HOME" data-text-de="START">HOME</a><span class="menu-number">01</span></li>
                <li><a href="/work" class="menu-link" data-text-en="WORK" data-text-de="PROJEKTE">WORK</a><span class="menu-number">02</span></li>
                <li><a href="/about" class="menu-link" data-text-en="ABOUT" data-text-de="ÜBER MICH">ABOUT</a><span class="menu-number">03</span></li>
                <li><a href="mailto:contact@moritzbednorz.com" class="menu-link" data-text-en="CONTACT" data-text-de="KONTAKT">CONTACT</a><span class="menu-number">04</span></li>
            </ul>
        </nav>
        <div class="menu-footer">
            <a href="https://www.linkedin.com/in/moritz-bednorz/" target="_blank">↗ LinkedIn</a>
            <a href="https://orcid.org/0000-0002-4981-5732" target="_blank">↗ ORCID</a>
        </div>
    `;

    // Insert after blobs, before main content usually, but order in body matters less with z-index
    const blobs = document.querySelector('.background-blobs');
    if (blobs) {
        blobs.after(menuContainer);
    } else {
        document.body.prepend(menuContainer);
    }
}

/**
 * Initialize menu toggle functionality
 */
export function initMenu(): void {
    const menuTrigger = document.querySelector<HTMLButtonElement>('.menu-trigger');
    const menuOverlay = document.querySelector<HTMLElement>('.menu-overlay');

    if (menuTrigger && menuOverlay) {
        menuTrigger.addEventListener('click', () => {
            const isOpen = document.body.classList.toggle('menu-open');
            
            if (isOpen) {
                // Delay to ensure layout is rendered
                setTimeout(() => {
                    initPhysics(menuOverlay);
                }, 100);
            } else {
                // Stop physics immediately when closing
                stopPhysics();
            }
        });
    }
}
